// =========================================================
// PÉNZÜGYI SEGÉDFÜGGVÉNYEK
// =========================================================

export const getPeriodId = (date = new Date()) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

// =========================================================
// DÁTUM KONVERTÁLÁSA
// =========================================================

export const getDocumentDate = (value) => {
  if (!value) {
    return null;
  }

  // Firestore Timestamp
  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  // JavaScript Date
  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

// =========================================================
// EGY ADOTT DÁTUM AZ ADOTT HÓNAPHOZ TARTOZIK-E
// =========================================================

export const isDateInPeriod = (value, period) => {
  const date = getDocumentDate(value);

  if (!date || !period) {
    return false;
  }

  return getPeriodId(date) === period;
};

// =========================================================
// ELŐZŐ HÓNAP
// =========================================================

export const getPreviousPeriod = (period) => {
  const [year, month] = period.split("-");

  const date = new Date(Number(year), Number(month) - 2, 1);

  return getPeriodId(date);
};

// =========================================================
// HÓNAP NEVE
// =========================================================

export const formatPeriod = (period) => {
  if (!period) {
    return "";
  }

  const [year, month] = period.split("-");

  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
    "hu-HU",
    {
      year: "numeric",
      month: "long",
    },
  );
};

// =========================================================
// TELJES HAVI PÉNZÜGYI SZÁMÍTÁS
// =========================================================

export const calculatePeriodFinancials = ({
  orders = [],
  stockPurchases = [],
  expenses = [],
  period,
  startingBalance = 0,
}) => {
  // =======================================================
  // HAVI BEVÉTEL
  // =======================================================

  const revenue = orders.reduce((sum, order) => {
    if (!isDateInPeriod(order?.createdAt, period)) {
      return sum;
    }

    /*
     * Csak fizetett rendelések számítanak
     * bevételnek.
     *
     * Régebbi rekordnál, ha nincs
     * orderStatus mező, akkor továbbra is
     * beszámítjuk.
     */

    if (order?.orderStatus && order.orderStatus !== "Fizetve") {
      return sum;
    }

    return sum + Number(order?.orderAmount || 0);
  }, 0);

  // =======================================================
  // HAVI BESZERZÉS
  // =======================================================

  const purchases = stockPurchases.reduce((sum, purchase) => {
    if (!isDateInPeriod(purchase?.createdAt, period)) {
      return sum;
    }

    return sum + Number(purchase?.total || 0);
  }, 0);

  // =======================================================
  // RENDEZETT KIADÁSOK
  // =======================================================

  const paidExpenses = expenses.reduce((sum, expense) => {
    if (expense?.period !== period) {
      return sum;
    }

    if (expense?.status !== "paid") {
      return sum;
    }

    return sum + Number(expense?.amount || 0);
  }, 0);

  // =======================================================
  // FÜGGŐ KIADÁSOK
  // =======================================================

  const pendingExpenses = expenses.reduce((sum, expense) => {
    if (expense?.period !== period) {
      return sum;
    }

    if (expense?.status === "paid") {
      return sum;
    }

    return sum + Number(expense?.amount || 0);
  }, 0);

  // =======================================================
  // HAVI EREDMÉNY
  // =======================================================

  const monthlyResult = revenue - purchases - paidExpenses;

  // =======================================================
  // ZÁRÓ / JELENLEGI PÉNZ
  // =======================================================

  const closingBalance = Number(startingBalance || 0) + monthlyResult;

  return {
    revenue,
    purchases,
    paidExpenses,
    pendingExpenses,
    monthlyResult,
    closingBalance,
  };
};
