import { useMemo, useState } from "react";

import Layout from "../../components/Layout";

import useFetchCollection from "../../customHooks/useFetchCollection";
import useFetchDocument from "../../customHooks/useFetchDocument";

import { collection, doc, setDoc, addDoc, Timestamp } from "firebase/firestore";

import { db } from "../../firebase/config";

import Notiflix from "notiflix";

import "./Business.scss";

const Business = () => {
  const orders = useFetchCollection("kunpaosorders");

  const products = useFetchCollection("kunpaosproducts");

  const stockPurchases = useFetchCollection("stockPurchases");

  const expenses = useFetchCollection("businessExpenses");

  /*
   * A kezdő pénzkészlet egyetlen Firestore
   * dokumentumban található.
   *
   * finance/settings
   */
  const financeSettings = useFetchDocument("finance", "settings");

  const [startingBalanceInput, setStartingBalanceInput] = useState("");

  const [expenseAmount, setExpenseAmount] = useState("");

  const [expenseDescription, setExpenseDescription] = useState("");

  const [expenseCategory, setExpenseCategory] = useState("Egyéb");

  const [savingBalance, setSavingBalance] = useState(false);

  const [savingExpense, setSavingExpense] = useState(false);

  // =========================================================
  // KEZDŐ PÉNZKÉSZLET
  // =========================================================

  const startingBalance = Number(financeSettings?.startingBalance || 0);

  // =========================================================
  // ÉRTÉKESÍTÉSI BEVÉTEL
  // =========================================================

  const totalRevenue = useMemo(() => {
    return orders.reduce(
      (acc, curr) => acc + Number(curr?.orderAmount || 0),
      0,
    );
  }, [orders]);

  // =========================================================
  // BESZERZÉSI KÖLTSÉG
  // =========================================================

  const totalPurchases = useMemo(() => {
    return stockPurchases.reduce(
      (acc, curr) => acc + Number(curr?.total || 0),
      0,
    );
  }, [stockPurchases]);

  // =========================================================
  // EGYÉB KIADÁSOK
  // =========================================================

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + Number(curr?.amount || 0), 0);
  }, [expenses]);

  // =========================================================
  // JELENLEGI PÉNZ
  // =========================================================

  const currentMoney =
    startingBalance + totalRevenue - totalPurchases - totalExpenses;

  // =========================================================
  // KEZDŐ PÉNZKÉSZLET MENTÉSE
  // =========================================================

  const saveStartingBalance = async (e) => {
    e.preventDefault();

    const amount = Number(startingBalanceInput);

    if (!Number.isFinite(amount) || amount < 0) {
      Notiflix.Notify.warning(
        "Adj meg érvényes, 0 vagy annál nagyobb összeget.",
      );

      return;
    }

    if (savingBalance) {
      return;
    }

    setSavingBalance(true);

    try {
      await setDoc(
        doc(db, "finance", "settings"),
        {
          startingBalance: amount,

          updatedAt: Timestamp.now().toDate(),
        },
        {
          merge: true,
        },
      );

      setStartingBalanceInput("");

      Notiflix.Notify.success("A kezdő pénzkészlet mentve!");
    } catch (error) {
      console.error("Starting balance error:", error);

      Notiflix.Notify.failure("Nem sikerült menteni a kezdő pénzkészletet.");
    } finally {
      setSavingBalance(false);
    }
  };

  // =========================================================
  // EGYÉB KIADÁS RÖGZÍTÉSE
  // =========================================================

  const saveExpense = async (e) => {
    e.preventDefault();

    const amount = Number(expenseAmount);

    const description = expenseDescription.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      Notiflix.Notify.warning("Adj meg érvényes kiadási összeget.");

      return;
    }

    if (!description) {
      Notiflix.Notify.warning("Add meg a kiadás megnevezését.");

      return;
    }

    if (savingExpense) {
      return;
    }

    setSavingExpense(true);

    try {
      await addDoc(collection(db, "businessExpenses"), {
        amount,
        description,
        category: expenseCategory,

        createdAt: Timestamp.now().toDate(),
      });

      setExpenseAmount("");
      setExpenseDescription("");
      setExpenseCategory("Egyéb");

      Notiflix.Notify.success("A kiadás sikeresen rögzítve!");
    } catch (error) {
      console.error("Expense error:", error);

      Notiflix.Notify.failure("Nem sikerült rögzíteni a kiadást.");
    } finally {
      setSavingExpense(false);
    }
  };

  return (
    <Layout>
      <section className="business">
        {/* =====================================================
            HEADER
           ===================================================== */}

        <header className="business__header">
          <div>
            <span className="business__eyebrow">Pénzügyek</span>

            <h1>Üzleti összesítő</h1>

            <p>
              A kávézó bevételeinek, kiadásainak és pénzkészletének áttekintése.
            </p>
          </div>
        </header>

        {/* =====================================================
            JELENLEGI PÉNZ
           ===================================================== */}

        <div className="business__balanceCard">
          <div className="business__balanceHeader">
            <div>
              <span className="business__eyebrow">Pénztár</span>

              <h2>Kávézó jelenlegi pénze</h2>
            </div>

            <div className="business__balanceIcon">💰</div>
          </div>

          <strong
            className={
              currentMoney >= 0
                ? "business__balance business__balance--positive"
                : "business__balance business__balance--negative"
            }
          >
            {currentMoney.toLocaleString("hu-HU")} Ft
          </strong>

          <div className="business__balanceFormula">
            <div>
              <span>Kezdő pénzkészlet</span>

              <strong>+ {startingBalance.toLocaleString("hu-HU")} Ft</strong>
            </div>

            <div>
              <span>Értékesítési bevétel</span>

              <strong>+ {totalRevenue.toLocaleString("hu-HU")} Ft</strong>
            </div>

            <div>
              <span>Beszerzések</span>

              <strong className="business__negative">
                − {totalPurchases.toLocaleString("hu-HU")} Ft
              </strong>
            </div>

            <div>
              <span>Egyéb kiadások</span>

              <strong className="business__negative">
                − {totalExpenses.toLocaleString("hu-HU")} Ft
              </strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            STATISZTIKAI KÁRTYÁK
           ===================================================== */}

        <div className="business__card business__card1">
          <span className="business__eyebrow">Értékesítés</span>

          <h2>Összes bevétel</h2>

          <strong>{totalRevenue.toLocaleString("hu-HU")} Ft</strong>

          <p>A lezárt rendelésekből származó teljes bevétel.</p>
        </div>

        <div className="business__card business__card2">
          <span className="business__eyebrow">Készlet</span>

          <h2>Beszerzési költség</h2>

          <strong>{totalPurchases.toLocaleString("hu-HU")} Ft</strong>

          <p>Termék-utánpótlásra fordított összeg.</p>
        </div>

        <div className="business__card business__card3">
          <span className="business__eyebrow">Kiadások</span>

          <h2>Egyéb kiadások</h2>

          <strong>{totalExpenses.toLocaleString("hu-HU")} Ft</strong>

          <p>Minden egyéb kézzel rögzített kiadás.</p>
        </div>

        <div className="business__card business__card4">
          <span className="business__eyebrow">Termékek</span>

          <h2>Termékek száma</h2>

          <strong>{products.length}</strong>

          <p>Aktuálisan nyilvántartott termékek.</p>
        </div>

        {/* =====================================================
            KEZDŐ PÉNZ
           ===================================================== */}

        <div className="business__managementCard">
          <div className="business__managementHeader">
            <span className="business__eyebrow">Pénztár beállítása</span>

            <h2>Kezdő pénzkészlet</h2>

            <p>
              Az az összeg, amellyel a pénztár a vizsgált időszak kezdetén
              rendelkezett.
            </p>
          </div>

          <form onSubmit={saveStartingBalance}>
            <label htmlFor="startingBalance">Összeg (Ft)</label>

            <input
              id="startingBalance"
              type="number"
              min="0"
              step="1"
              value={startingBalanceInput}
              placeholder={`${startingBalance.toLocaleString("hu-HU")} Ft`}
              onChange={(e) => setStartingBalanceInput(e.target.value)}
              disabled={savingBalance}
            />

            <button type="submit" disabled={savingBalance}>
              {savingBalance ? "Mentés..." : "Kezdő összeg mentése"}
            </button>
          </form>
        </div>

        {/* =====================================================
            EGYÉB KIADÁS
           ===================================================== */}

        <div className="business__managementCard">
          <div className="business__managementHeader">
            <span className="business__eyebrow">Kiadás rögzítése</span>

            <h2>Új egyéb kiadás</h2>

            <p>
              Például rezsi, javítás, takarítószer vagy egyéb működési költség.
            </p>
          </div>

          <form onSubmit={saveExpense}>
            <label htmlFor="expenseAmount">Összeg (Ft)</label>

            <input
              id="expenseAmount"
              type="number"
              min="1"
              step="1"
              value={expenseAmount}
              placeholder="5000"
              onChange={(e) => setExpenseAmount(e.target.value)}
              disabled={savingExpense}
              required
            />

            <label htmlFor="expenseCategory">Kategória</label>

            <select
              id="expenseCategory"
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              disabled={savingExpense}
            >
              <option value="Egyéb">Egyéb</option>

              <option value="Rezsi">Rezsi</option>

              <option value="Karbantartás">Karbantartás</option>

              <option value="Takarítás">Takarítás</option>

              <option value="Eszköz">Eszköz</option>

              <option value="Szállítás">Szállítás</option>
            </select>

            <label htmlFor="expenseDescription">Megnevezés</label>

            <input
              id="expenseDescription"
              type="text"
              value={expenseDescription}
              placeholder="Pl. villanyszámla"
              onChange={(e) => setExpenseDescription(e.target.value)}
              disabled={savingExpense}
              required
            />

            <button type="submit" disabled={savingExpense}>
              {savingExpense ? "Rögzítés..." : "Kiadás rögzítése"}
            </button>
          </form>
        </div>

        {/* =====================================================
            KIADÁSI LISTA
           ===================================================== */}

        <div className="business__expensesCard">
          <div className="business__managementHeader">
            <span className="business__eyebrow">Kiadások</span>

            <h2>Rögzített egyéb kiadások</h2>
          </div>

          {expenses.length === 0 ? (
            <div className="business__empty">
              <span>💸</span>

              <p>Még nincs rögzített egyéb kiadás.</p>
            </div>
          ) : (
            <div className="business__expenseList">
              {expenses
                .slice()
                .sort((a, b) => {
                  const dateA = a?.createdAt?.toDate
                    ? a.createdAt.toDate()
                    : new Date(a?.createdAt || 0);

                  const dateB = b?.createdAt?.toDate
                    ? b.createdAt.toDate()
                    : new Date(b?.createdAt || 0);

                  return dateB - dateA;
                })
                .map((expense) => (
                  <div key={expense.id} className="business__expenseItem">
                    <div>
                      <strong>{expense.description}</strong>

                      <span>{expense.category}</span>
                    </div>

                    <strong>
                      − {Number(expense.amount || 0).toLocaleString("hu-HU")} Ft
                    </strong>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Business;
