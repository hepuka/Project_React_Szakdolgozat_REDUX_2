import { useEffect, useMemo, useState } from "react";

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

import { db } from "../../firebase/config";

import Notiflix from "notiflix";

import "./Expenses.scss";

const getPeriodId = (date = new Date()) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const formatPeriod = (period) => {
  if (!period) {
    return "";
  }

  const [year, month] = period.split("-");

  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
  });
};

const getPreviousPeriod = (period) => {
  const [year, month] = period.split("-");

  const date = new Date(Number(year), Number(month) - 2, 1);

  return getPeriodId(date);
};

const Expenses = () => {
  const expenses = useFetchCollection("businessExpenses");

  const [selectedPeriod, setSelectedPeriod] = useState(getPeriodId());

  const [startingBalance, setStartingBalance] = useState(0);

  const [startingBalanceInput, setStartingBalanceInput] = useState("");

  const [amount, setAmount] = useState("");

  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("Rezsi");

  const [dueDate, setDueDate] = useState("");

  const [savingBalance, setSavingBalance] = useState(false);

  const [savingExpense, setSavingExpense] = useState(false);

  const [showOnlyPending, setShowOnlyPending] = useState(false);

  // =========================================================
  // IDŐSZAKOK
  // =========================================================

  const periodList = useMemo(() => {
    const periods = new Set();

    expenses.forEach((item) => {
      if (item?.period) {
        periods.add(item.period);
      }
    });

    periods.add(getPeriodId());

    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  // =========================================================
  // IDŐSZAKI KIADÁSOK
  // =========================================================

  const periodExpenses = useMemo(() => {
    return expenses
      .filter((item) => item?.period === selectedPeriod)
      .sort((a, b) => {
        const dateA = a?.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a?.createdAt || 0);

        const dateB = b?.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b?.createdAt || 0);

        return dateB - dateA;
      });
  }, [expenses, selectedPeriod]);

  // =========================================================
  // SZŰRT LISTA
  // =========================================================

  const visibleExpenses = useMemo(() => {
    if (!showOnlyPending) {
      return periodExpenses;
    }

    return periodExpenses.filter((item) => item.status !== "paid");
  }, [periodExpenses, showOnlyPending]);

  // =========================================================
  // ÖSSZESÍTÉSEK
  // =========================================================

  const paidExpenses = useMemo(() => {
    return periodExpenses.reduce((sum, item) => {
      if (item.status === "paid") {
        return sum + Number(item.amount || 0);
      }

      return sum;
    }, 0);
  }, [periodExpenses]);

  const pendingExpenses = useMemo(() => {
    return periodExpenses.reduce((sum, item) => {
      if (item.status !== "paid") {
        return sum + Number(item.amount || 0);
      }

      return sum;
    }, 0);
  }, [periodExpenses]);

  const totalExpenses = paidExpenses + pendingExpenses;

  // =========================================================
  // IDŐSZAK KEZDŐPÉNZ BEÁLLÍTÁSA
  // =========================================================

  useEffect(() => {
    const loadPeriod = async () => {
      try {
        const currentPeriodRef = doc(db, "financePeriods", selectedPeriod);

        /*
         * Nem használunk itt külön hookot,
         * hanem Firestore-ból lekérjük az időszakot.
         */
        const { getDoc } = await import("firebase/firestore");

        const snapshot = await getDoc(currentPeriodRef);

        if (snapshot.exists()) {
          const data = snapshot.data();

          const balance = Number(data.startingBalance || 0);

          setStartingBalance(balance);

          setStartingBalanceInput(String(balance));

          return;
        }

        /*
         * Ha új hónap, megpróbáljuk
         * az előző hónap záró pénzét
         * alapértékként használni.
         */
        const previousPeriod = getPreviousPeriod(selectedPeriod);

        const previousPeriodRef = doc(db, "financePeriods", previousPeriod);

        const previousSnapshot = await getDoc(previousPeriodRef);

        let initialBalance = 0;

        if (previousSnapshot.exists()) {
          const previousData = previousSnapshot.data();

          initialBalance = Number(
            previousData.closingBalance || previousData.startingBalance || 0,
          );
        }

        await setDoc(
          currentPeriodRef,
          {
            period: selectedPeriod,

            startingBalance: initialBalance,

            closingBalance: initialBalance,

            createdAt: Timestamp.now().toDate(),

            updatedAt: Timestamp.now().toDate(),
          },
          {
            merge: true,
          },
        );

        setStartingBalance(initialBalance);

        setStartingBalanceInput(String(initialBalance));
      } catch (error) {
        console.error("Load finance period error:", error);
      }
    };

    loadPeriod();
  }, [selectedPeriod]);

  // =========================================================
  // KEZDŐPÉNZ MENTÉSE
  // =========================================================

  const saveStartingBalance = async (e) => {
    e.preventDefault();

    const value = Number(startingBalanceInput);

    if (!Number.isFinite(value) || value < 0) {
      Notiflix.Notify.warning("Adj meg érvényes kezdő pénzkészletet.");

      return;
    }

    if (savingBalance) {
      return;
    }

    setSavingBalance(true);

    try {
      await setDoc(
        doc(db, "financePeriods", selectedPeriod),
        {
          period: selectedPeriod,

          startingBalance: value,

          updatedAt: Timestamp.now().toDate(),
        },
        {
          merge: true,
        },
      );

      setStartingBalance(value);

      Notiflix.Notify.success("A kezdő pénzkészlet mentve!");
    } catch (error) {
      console.error(error);

      Notiflix.Notify.failure("Nem sikerült menteni a kezdő pénzkészletet.");
    } finally {
      setSavingBalance(false);
    }
  };

  // =========================================================
  // ÚJ KIADÁS
  // =========================================================

  const saveExpense = async (e) => {
    e.preventDefault();

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
      await addDoc(collection(db, "businessExpenses"), {
        period: selectedPeriod,

        amount: numericAmount,

        description: cleanDescription,

        category,

        dueDate: dueDate || null,

        status: "pending",

        createdAt: Timestamp.now().toDate(),

        updatedAt: Timestamp.now().toDate(),
      });

      setAmount("");
      setDescription("");
      setDueDate("");
      setCategory("Rezsi");

      Notiflix.Notify.success("A kiadás sikeresen rögzítve!");
    } catch (error) {
      console.error("Save expense error:", error);

      Notiflix.Notify.failure("Nem sikerült rögzíteni a kiadást.");
    } finally {
      setSavingExpense(false);
    }
  };

  // =========================================================
  // KIADÁS RENDEZÉSE
  // =========================================================

  const toggleExpenseStatus = async (expense) => {
    const newStatus = expense.status === "paid" ? "pending" : "paid";

    try {
      await updateDoc(doc(db, "businessExpenses", expense.id), {
        status: newStatus,

        paidAt: newStatus === "paid" ? Timestamp.now().toDate() : null,

        updatedAt: Timestamp.now().toDate(),
      });

      Notiflix.Notify.success(
        newStatus === "paid"
          ? "A számla rendezve."
          : "A számla visszaállítva függőben állapotra.",
      );
    } catch (error) {
      console.error(error);

      Notiflix.Notify.failure("Nem sikerült módosítani a számla állapotát.");
    }
  };

  // =========================================================
  // KIADÁS TÖRLÉSE
  // =========================================================

  const deleteExpense = (expense) => {
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
          console.error(error);

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
  // ZÁRÓ PÉNZ
  // =========================================================

  const currentClosingBalance = startingBalance - paidExpenses;

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

            <p>A kávézó havi kiadásainak és pénzügyi időszakainak kezelése.</p>
          </div>

          <div className="expenses__period">
            <span>Aktív időszak</span>

            <strong>{formatPeriod(selectedPeriod)}</strong>
          </div>
        </header>

        {/* ===================================================
            PERIOD
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
              {periodList.map((period) => (
                <option key={period} value={period}>
                  {formatPeriod(period)}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* ===================================================
            SUMMARY
           =================================================== */}

        <section className="expenses__summary">
          <div className="expenses__summaryCard">
            <span>Kezdő pénzkészlet</span>

            <strong>{startingBalance.toLocaleString("hu-HU")} Ft</strong>
          </div>

          <div className="expenses__summaryCard">
            <span>Rendezett kiadások</span>

            <strong>{paidExpenses.toLocaleString("hu-HU")} Ft</strong>
          </div>

          <div className="expenses__summaryCard">
            <span>Függőben</span>

            <strong>{pendingExpenses.toLocaleString("hu-HU")} Ft</strong>
          </div>

          <div className="expenses__summaryCard expenses__summaryCard--balance">
            <span>Időszak jelenlegi pénze</span>

            <strong>{currentClosingBalance.toLocaleString("hu-HU")} Ft</strong>
          </div>
        </section>

        {/* ===================================================
            FORMS
           =================================================== */}

        <section className="expenses__forms">
          {/* ===============================================
              STARTING BALANCE
             =============================================== */}

          <div className="expenses__card">
            <div className="expenses__cardHeader">
              <span>Pénztár</span>

              <h2>Kezdő pénzkészlet</h2>

              <p>A kiválasztott hónap induló pénzösszege.</p>
            </div>

            <form onSubmit={saveStartingBalance}>
              <label htmlFor="startingBalance">Összeg (Ft)</label>

              <input
                id="startingBalance"
                type="number"
                min="0"
                step="1"
                value={startingBalanceInput}
                onChange={(e) => setStartingBalanceInput(e.target.value)}
                disabled={savingBalance}
              />

              <button type="submit" disabled={savingBalance}>
                {savingBalance ? "Mentés..." : "Kezdő pénz mentése"}
              </button>
            </form>
          </div>

          {/* ===============================================
              NEW EXPENSE
             =============================================== */}

          <div className="expenses__card">
            <div className="expenses__cardHeader">
              <span>Új kiadás</span>

              <h2>Számla / költség rögzítése</h2>

              <p>Villany, takarítás, karbantartás, szállítás stb.</p>
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
              />

              <label htmlFor="category">Kategória</label>

              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Rezsi">Rezsi</option>

                <option value="Takarítás">Takarítás</option>

                <option value="Karbantartás">Karbantartás</option>

                <option value="Szállítás">Szállítás</option>

                <option value="Eszköz">Eszköz</option>

                <option value="Munkabér">Munkabér</option>

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
              />

              <label htmlFor="dueDate">Fizetési határidő</label>

              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <button type="submit" disabled={savingExpense}>
                {savingExpense ? "Mentés..." : "Kiadás rögzítése"}
              </button>
            </form>
          </div>
        </section>

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
                const isPaid = expense.status === "paid";

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
                        {isPaid ? "Rendezve" : "Függőben"}
                      </span>
                    </div>

                    <div className="expenses__expenseActions">
                      <button
                        type="button"
                        className={
                          isPaid
                            ? "expenses__undoButton"
                            : "expenses__payButton"
                        }
                        onClick={() => toggleExpenseStatus(expense)}
                      >
                        {isPaid ? "Visszaállít" : "Rendezve"}
                      </button>

                      <button
                        type="button"
                        className="expenses__deleteButton"
                        onClick={() => deleteExpense(expense)}
                      >
                        Töröl
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </Layout>
  );
};

export default Expenses;
