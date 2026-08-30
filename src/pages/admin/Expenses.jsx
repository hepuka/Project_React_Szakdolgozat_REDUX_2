import { useMemo, useState } from "react";

import Layout from "../../components/Layout";

import useFetchCollection from "../../customHooks/useFetchCollection";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import {
  getPeriodId,
  getPreviousPeriod,
  formatPeriod,
  calculatePeriodFinancials,
} from "../../services/financeCalculations";

import { db } from "../../firebase/config";

import Notiflix from "notiflix";

import "./Expenses.scss";

const INITIAL_CAPITAL = 1000000;

const Expenses = () => {
  // =========================================================
  // FIRESTORE ADATOK
  // =========================================================

  const expenses = useFetchCollection("businessExpenses");

  const financePeriods = useFetchCollection("financePeriods");

  const orders = useFetchCollection("kunpaosorders");

  const stockPurchases = useFetchCollection("stockPurchases");

  // =========================================================
  // ÁLLAPOTOK
  // =========================================================

  const [selectedPeriod, setSelectedPeriod] = useState("2026-08");

  const [amount, setAmount] = useState("");

  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("Rezsi");

  const [dueDate, setDueDate] = useState("");

  const [savingExpense, setSavingExpense] = useState(false);

  const [closingPeriod, setClosingPeriod] = useState(false);

  const [showOnlyPending, setShowOnlyPending] = useState(false);

  // =========================================================
  // AKTUÁLIS IDŐSZAK
  // =========================================================

  const currentFinancePeriod = financePeriods.find(
    (item) => item?.period === selectedPeriod,
  );

  const isClosed = currentFinancePeriod?.isClosed === true;

  // =========================================================
  // IDŐSZAKOK
  // =========================================================

  const periodList = useMemo(() => {
    const periods = new Set();

    financePeriods.forEach((item) => {
      if (item?.period) {
        periods.add(item.period);
      }
    });

    expenses.forEach((item) => {
      if (item?.period) {
        periods.add(item.period);
      }
    });

    orders.forEach((item) => {
      const createdAt = item?.createdAt;

      if (createdAt) {
        const date =
          typeof createdAt?.toDate === "function"
            ? createdAt.toDate()
            : new Date(createdAt);

        if (!Number.isNaN(date.getTime())) {
          const period = getPeriodId(date);

          if (period >= "2026-08") {
            periods.add(period);
          }
        }
      }
    });

    stockPurchases.forEach((item) => {
      const createdAt = item?.createdAt;

      if (createdAt) {
        const date =
          typeof createdAt?.toDate === "function"
            ? createdAt.toDate()
            : new Date(createdAt);

        if (!Number.isNaN(date.getTime())) {
          const period = getPeriodId(date);

          if (period >= "2026-08") {
            periods.add(period);
          }
        }
      }
    });

    periods.add("2026-08");

    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [financePeriods, expenses, orders, stockPurchases]);

  // =========================================================
  // KEZDŐ PÉNZ
  // =========================================================

  const startingBalance = useMemo(() => {
    /*
     * Kávézó indulása:
     * 2026.08 = 1 000 000 Ft
     */

    if (selectedPeriod === "2026-08") {
      return INITIAL_CAPITAL;
    }

    /*
     * Következő hónap:
     * előző lezárt hónap záró
     * egyenlege.
     */

    const previousPeriod = getPreviousPeriod(selectedPeriod);

    const previousFinancePeriod = financePeriods.find(
      (item) => item?.period === previousPeriod,
    );

    if (previousFinancePeriod?.isClosed === true) {
      return Number(previousFinancePeriod?.closingBalance ?? 0);
    }

    return INITIAL_CAPITAL;
  }, [selectedPeriod, financePeriods]);

  // =========================================================
  // AKTUÁLIS HÓNAP PÉNZÜGYEI
  // =========================================================

  const financials = useMemo(() => {
    return calculatePeriodFinancials({
      orders,
      stockPurchases,
      expenses,
      period: selectedPeriod,
      startingBalance,
    });
  }, [orders, stockPurchases, expenses, selectedPeriod, startingBalance]);

  // =========================================================
  // ÚJ IDŐSZAK LÉTREHOZÁSA
  // =========================================================

  const ensureFinancePeriod = async () => {
    const periodExists = financePeriods.some(
      (item) => item?.period === selectedPeriod,
    );

    if (periodExists) {
      return;
    }

    const periodRef = doc(db, "financePeriods", selectedPeriod);

    await setDoc(
      periodRef,
      {
        period: selectedPeriod,

        startingBalance,

        closingBalance: startingBalance,

        isClosed: false,

        createdAt: Timestamp.now().toDate(),

        updatedAt: Timestamp.now().toDate(),
      },
      {
        merge: true,
      },
    );
  };

  // =========================================================
  // ÚJ KIADÁS
  // =========================================================

  const saveExpense = async (e) => {
    e.preventDefault();

    if (isClosed) {
      Notiflix.Notify.warning(
        "A lezárt hónaphoz nem lehet új kiadást rögzíteni.",
      );

      return;
    }

    const numericAmount = Number(amount);

    const cleanDescription = description.trim();

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Notiflix.Notify.warning("Adj meg érvényes összeget.");

      return;
    }

    if (!cleanDescription) {
      Notiflix.Notify.warning("Add meg a kiadás megnevezését.");

      return;
    }

    if (savingExpense) {
      return;
    }

    setSavingExpense(true);

    try {
      await ensureFinancePeriod();

      await addDoc(collection(db, "businessExpenses"), {
        period: selectedPeriod,

        amount: numericAmount,

        description: cleanDescription,

        category,

        dueDate: dueDate || null,

        /*
         * Új kiadás mindig rendezetlen.
         */
        status: "pending",

        createdAt: Timestamp.now().toDate(),

        updatedAt: Timestamp.now().toDate(),
      });

      setAmount("");
      setDescription("");
      setCategory("Rezsi");
      setDueDate("");

      Notiflix.Notify.success("A kiadás sikeresen rögzítve!");
    } catch (error) {
      console.error("Save expense error:", error);

      Notiflix.Notify.failure("Nem sikerült rögzíteni a kiadást.");
    } finally {
      setSavingExpense(false);
    }
  };

  // =========================================================
  // SZÁMLA RENDEZÉSE
  //
  // FONTOS:
  // A folyamat csak egyirányú:
  //
  // pending → paid
  //
  // paid → NINCS VISSZAÁLLÍTÁS
  // =========================================================

  const markExpenseAsPaid = async (expense) => {
    if (isClosed) {
      Notiflix.Notify.warning("A lezárt hónap kiadásai már nem módosíthatók.");

      return;
    }

    /*
     * Ha már rendezve van,
     * semmilyen művelet ne történjen.
     */
    if (expense?.status === "paid") {
      return;
    }

    try {
      await updateDoc(doc(db, "businessExpenses", expense.id), {
        status: "paid",

        paidAt: Timestamp.now().toDate(),

        updatedAt: Timestamp.now().toDate(),
      });

      Notiflix.Notify.success("A kiadás rendezve és véglegesítve.");
    } catch (error) {
      console.error("Expense payment update error:", error);

      Notiflix.Notify.failure(
        "Nem sikerült rendezett állapotba állítani a kiadást.",
      );
    }
  };

  // =========================================================
  // KIADÁS TÖRLÉSE
  // =========================================================

  const deleteExpense = (expense) => {
    if (isClosed) {
      Notiflix.Notify.warning("A lezárt hónap kiadásai már nem törölhetők.");

      return;
    }

    Notiflix.Confirm.show(
      "Kiadás törlése",
      `Biztosan törölni szeretnéd a(z) ${expense.description} kiadást?`,
      "Törlés",
      "Mégse",
      async () => {
        try {
          await deleteDoc(doc(db, "businessExpenses", expense.id));

          Notiflix.Notify.success("A kiadás törölve.");
        } catch (error) {
          console.error("Delete expense error:", error);

          Notiflix.Notify.failure("Nem sikerült törölni a kiadást.");
        }
      },
      () => {},
      {
        width: "340px",
        borderRadius: "14px",
        titleColor: "#2c1e1a",
        okButtonBackground: "#b15252",
      },
    );
  };

  // =========================================================
  // HÓNAP LEZÁRÁSA
  // =========================================================

  const closeCurrentPeriod = () => {
    if (isClosed) {
      Notiflix.Notify.warning("Ez a hónap már le van zárva.");

      return;
    }

    if (financials.pendingExpenses > 0) {
      Notiflix.Confirm.show(
        "Függőben lévő számlák",
        `A hónapban még ${financials.pendingExpenses.toLocaleString(
          "hu-HU",
        )} Ft értékű rendezetlen kiadás van. Biztosan le szeretnéd zárni a hónapot?`,
        "Lezárás",
        "Mégse",
        () => performClosePeriod(),
        () => {},
        {
          width: "420px",
          borderRadius: "14px",
          titleColor: "#8a641e",
          okButtonBackground: "#8a641e",
        },
      );

      return;
    }

    Notiflix.Confirm.show(
      "Hónap lezárása",
      `Biztosan lezárod a(z) ${formatPeriod(
        selectedPeriod,
      )} időszakot? A záró pénzkészlet ${financials.closingBalance.toLocaleString(
        "hu-HU",
      )} Ft lesz.`,
      "Hónap lezárása",
      "Mégse",
      () => performClosePeriod(),
      () => {},
      {
        width: "420px",
        borderRadius: "14px",
        titleColor: "#b15252",
        okButtonBackground: "#b15252",
      },
    );
  };

  // =========================================================
  // HÓNAP TÉNYLEGES LEZÁRÁSA
  // =========================================================

  const performClosePeriod = async () => {
    if (closingPeriod) {
      return;
    }

    setClosingPeriod(true);

    try {
      await ensureFinancePeriod();

      const closingBalance = financials.closingBalance;

      await setDoc(
        doc(db, "financePeriods", selectedPeriod),
        {
          period: selectedPeriod,

          startingBalance,

          closingBalance,

          isClosed: true,

          closedAt: Timestamp.now().toDate(),

          updatedAt: Timestamp.now().toDate(),
        },
        {
          merge: true,
        },
      );

      Notiflix.Notify.success(
        `${formatPeriod(
          selectedPeriod,
        )} sikeresen lezárva. Záró pénzkészlet: ${closingBalance.toLocaleString(
          "hu-HU",
        )} Ft.`,
      );
    } catch (error) {
      console.error("Close period error:", error);

      Notiflix.Notify.failure("Nem sikerült lezárni a hónapot.");
    } finally {
      setClosingPeriod(false);
    }
  };

  // =========================================================
  // LÁTHATÓ KIADÁSOK
  // =========================================================

  const periodExpenses = useMemo(() => {
    return expenses
      .filter((item) => item?.period === selectedPeriod)
      .sort((a, b) => {
        const getTime = (value) => {
          if (!value) {
            return 0;
          }

          if (typeof value?.toDate === "function") {
            return value.toDate().getTime();
          }

          const date = new Date(value);

          return Number.isNaN(date.getTime()) ? 0 : date.getTime();
        };

        return getTime(b?.createdAt) - getTime(a?.createdAt);
      });
  }, [expenses, selectedPeriod]);

  const visibleExpenses = showOnlyPending
    ? periodExpenses.filter((item) => item?.status !== "paid")
    : periodExpenses;

  return (
    <Layout>
      <section className="expenses">
        {/* ===================================================
            HEADER
           =================================================== */}

        <header className="expenses__header">
          <div>
            <span className="expenses__eyebrow">Manager / Pénzügyek</span>

            <h1>Rezsi és kiadások</h1>

            <p>A kávézó havi rezsi- és egyéb kiadásainak kezelése.</p>
          </div>

          <div className="expenses__period">
            <span>Aktív időszak</span>

            <strong>{formatPeriod(selectedPeriod)}</strong>

            {isClosed ? (
              <span className="expenses__closedBadge">🔒 Lezárva</span>
            ) : (
              <span className="expenses__openBadge">🟢 Nyitott</span>
            )}
          </div>
        </header>

        {/* ===================================================
            PERIOD SELECTOR
           =================================================== */}

        <section className="expenses__periodCard">
          <div>
            <span>Pénzügyi időszak</span>

            <h2>Hónap kiválasztása</h2>
          </div>

          <div className="expenses__periodControls">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {periodList.map((period) => {
                const periodData = financePeriods.find(
                  (item) => item?.period === period,
                );

                return (
                  <option key={period} value={period}>
                    {formatPeriod(period)}

                    {periodData?.isClosed ? " 🔒" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </section>

        {/* ===================================================
            CLOSED NOTICE
           =================================================== */}

        {isClosed && (
          <section className="expenses__closedNotice">
            <div>
              <strong>🔒 Ez a hónap le van zárva</strong>

              <p>A lezárt pénzügyi időszak adatai már nem módosíthatók.</p>
            </div>
          </section>
        )}

        {/* ===================================================
            SUMMARY
           =================================================== */}

        <section className="expenses__summary">
          <div className="expenses__summaryCard">
            <span>Rendezett kiadások</span>

            <strong>
              {financials.paidExpenses.toLocaleString("hu-HU")} Ft
            </strong>
          </div>

          <div className="expenses__summaryCard">
            <span>Rendezetlen kiadások</span>

            <strong>
              {financials.pendingExpenses.toLocaleString("hu-HU")} Ft
            </strong>
          </div>

          <div className="expenses__summaryCard">
            <span>Összes kiadás</span>

            <strong>
              {(
                financials.paidExpenses + financials.pendingExpenses
              ).toLocaleString("hu-HU")}{" "}
              Ft
            </strong>
          </div>

          <div className="expenses__summaryCard expenses__summaryCard--balance">
            <span>Záró pénzkészlet</span>

            <strong>
              {financials.closingBalance.toLocaleString("hu-HU")} Ft
            </strong>
          </div>
        </section>

        {/* ===================================================
            NEW EXPENSE
           =================================================== */}

        {!isClosed && (
          <section className="expenses__forms">
            <div className="expenses__card">
              <div className="expenses__cardHeader">
                <span>Új kiadás</span>

                <h2>Számla / költség rögzítése</h2>

                <p>
                  Villany, víz, takarítás, karbantartás, szállítás vagy egyéb
                  költség.
                </p>
              </div>

              <form onSubmit={saveExpense}>
                <label htmlFor="amount">Összeg (Ft)</label>

                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={savingExpense}
                />

                <label htmlFor="category">Kategória</label>

                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={savingExpense}
                >
                  <option value="Rezsi">Rezsi</option>

                  <option value="Takarítás">Takarítás</option>

                  <option value="Karbantartás">Karbantartás</option>

                  <option value="Szállítás">Szállítás</option>

                  <option value="Eszköz">Eszköz</option>

                  <option value="Egyéb">Egyéb</option>
                </select>

                <label htmlFor="description">Megnevezés</label>

                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pl. Villanyszámla"
                  required
                  disabled={savingExpense}
                />

                <label htmlFor="dueDate">Fizetési határidő</label>

                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={savingExpense}
                />

                <button type="submit" disabled={savingExpense}>
                  {savingExpense ? "Mentés..." : "Kiadás rögzítése"}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ===================================================
            EXPENSE LIST
           =================================================== */}

        <section className="expenses__listCard">
          <div className="expenses__listHeader">
            <div>
              <span>{formatPeriod(selectedPeriod)}</span>

              <h2>Számlák és kiadások</h2>
            </div>

            <button
              type="button"
              className={
                showOnlyPending
                  ? "expenses__filterButton expenses__filterButton--active"
                  : "expenses__filterButton"
              }
              onClick={() => setShowOnlyPending((current) => !current)}
            >
              {showOnlyPending ? "Összes kiadás" : "Csak rendezetlen"}
            </button>
          </div>

          {visibleExpenses.length === 0 ? (
            <div className="expenses__empty">
              <span>💳</span>

              <h3>Nincs kiadás</h3>

              <p>Ebben az időszakban még nincs rögzített kiadás.</p>
            </div>
          ) : (
            <div className="expenses__list">
              {visibleExpenses.map((expense) => {
                const isPaid = expense?.status === "paid";

                return (
                  <article
                    key={expense.id}
                    className={`expenses__expense ${
                      isPaid
                        ? "expenses__expense--paid"
                        : "expenses__expense--pending"
                    }`}
                  >
                    <div className="expenses__expenseIcon">
                      {isPaid ? "✓" : "!"}
                    </div>

                    <div className="expenses__expenseMain">
                      <strong>{expense.description}</strong>

                      <div>
                        <span>{expense.category}</span>

                        {expense.dueDate && (
                          <span>Határidő: {expense.dueDate}</span>
                        )}
                      </div>
                    </div>

                    <div className="expenses__expenseAmount">
                      <strong>
                        {Number(expense.amount || 0).toLocaleString("hu-HU")} Ft
                      </strong>

                      <span
                        className={
                          isPaid
                            ? "expenses__status expenses__status--paid"
                            : "expenses__status expenses__status--pending"
                        }
                      >
                        {isPaid ? "Rendezve" : "Rendezetlen"}
                      </span>
                    </div>

                    <div className="expenses__expenseActions">
                      {!isClosed && (
                        <>
                          <button
                            type="button"
                            className={
                              isPaid
                                ? "expenses__payButton expenses__payButton--disabled"
                                : "expenses__payButton"
                            }
                            onClick={() => markExpenseAsPaid(expense)}
                            disabled={isPaid}
                          >
                            {isPaid ? "Rendezve" : "Rendezetlen"}
                          </button>

                          {!isPaid && (
                            <button
                              type="button"
                              className="expenses__deleteButton"
                              onClick={() => deleteExpense(expense)}
                            >
                              Töröl
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================================================
            MONTH CLOSE
           =================================================== */}

        {!isClosed && (
          <section className="expenses__closingCard">
            <div>
              <span className="expenses__eyebrow">Pénzügyi zárás</span>

              <h2>{formatPeriod(selectedPeriod)} lezárása</h2>

              <p>
                A hónap lezárásakor a rendszer elmenti a kiszámolt záró
                pénzkészletet.
              </p>

              <strong className="expenses__closingBalance">
                Záró pénzkészlet:{" "}
                {financials.closingBalance.toLocaleString("hu-HU")} Ft
              </strong>

              {financials.pendingExpenses > 0 && (
                <strong className="expenses__closingWarning">
                  ⚠ {financials.pendingExpenses.toLocaleString("hu-HU")} Ft
                  rendezetlen kiadás van még.
                </strong>
              )}
            </div>

            <button
              type="button"
              className="expenses__closeButton"
              onClick={closeCurrentPeriod}
              disabled={closingPeriod}
            >
              {closingPeriod ? "Lezárás..." : "🔒 Hónap lezárása"}
            </button>
          </section>
        )}
      </section>
    </Layout>
  );
};

export default Expenses;
