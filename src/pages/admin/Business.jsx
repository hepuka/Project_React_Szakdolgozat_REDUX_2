import { useMemo } from "react";

import Layout from "../../components/Layout";

import useFetchCollection from "../../customHooks/useFetchCollection";
import useFetchDocument from "../../customHooks/useFetchDocument";

import "./Business.scss";

import {
  calculatePeriodFinancials,
  formatPeriod,
  getPeriodId,
  getPreviousPeriod,
} from "../../services/financeCalculations";

const INITIAL_CAPITAL = 1000000;

const Business = () => {
  // =========================================================
  // FIRESTORE ADATOK
  // =========================================================

  const orders = useFetchCollection("kunpaosorders");

  const stockPurchases = useFetchCollection("stockPurchases");

  const expenses = useFetchCollection("businessExpenses");

  const financePeriods = useFetchCollection("financePeriods");

  const financeSettings = useFetchDocument("finance", "settings");

  // =========================================================
  // AKTUÁLIS IDŐSZAK
  // =========================================================

  const currentPeriod = getPeriodId();

  /*
   * A kávézó 2026.08-ban indult.
   */

  // =========================================================
  // KEZDŐTŐKE
  // =========================================================

  const initialCapital = Number(
    financeSettings?.initialCapital ?? INITIAL_CAPITAL,
  );

  // =========================================================
  // KIVÁLASZTOTT HÓNAP
  // =========================================================

  const defaultPeriod = currentPeriod >= "2026-08" ? currentPeriod : "2026-08";

  /*
   * React state külön import nélkül:
   * a projekt jelenlegi változatában
   * a hónapot a currentPeriod alapján
   * kezeljük.
   *
   * Ezért célszerű a Business oldalon
   * mindig az aktuális hónapot indítani.
   */

  const selectedPeriod = defaultPeriod;

  // =========================================================
  // ELÉRHETŐ HÓNAPOK
  // =========================================================

  // =========================================================
  // FINANCE PERIOD
  // =========================================================

  const selectedFinancePeriod = financePeriods.find(
    (item) => item?.period === selectedPeriod,
  );

  // =========================================================
  // LEZÁRT?
  // =========================================================

  const isClosed = selectedFinancePeriod?.isClosed === true;

  // =========================================================
  // HAVI KEZDŐ PÉNZ
  // =========================================================

  const startingBalance = useMemo(() => {
    /*
     * 2026.08 = a kávézó indulása
     */

    if (selectedPeriod === "2026-08") {
      return initialCapital;
    }

    /*
     * Következő hónapok:
     * előző lezárt hónap záró pénze.
     */

    const previousPeriod = getPreviousPeriod(selectedPeriod);

    const previousFinancePeriod = financePeriods.find(
      (item) => item?.period === previousPeriod,
    );

    if (previousFinancePeriod?.isClosed === true) {
      return Number(previousFinancePeriod?.closingBalance ?? 0);
    }

    /*
     * Ha még nincs előző lezárt
     * hónap, nem tudunk hivatalos
     * továbbgörgetett pénzkészletet
     * számolni.
     */

    return initialCapital;
  }, [selectedPeriod, financePeriods, initialCapital]);

  // =========================================================
  // HAVI PÉNZÜGYEK
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
  // JELENLEGI / ZÁRÓ PÉNZ
  // =========================================================

  const currentMoney = isClosed
    ? Number(selectedFinancePeriod?.closingBalance ?? financials.closingBalance)
    : financials.closingBalance;

  return (
    <Layout>
      <section className="business">
        {/* ===================================================
            HEADER
           =================================================== */}

        <header className="business__header">
          <div>
            <span className="business__eyebrow">Pénzügyek</span>

            <h1>Üzleti összesítő</h1>

            <p>A kávézó pénzügyi helyzete havi bontásban.</p>
          </div>

          <div className="business__periodSelector">
            <span>Pénzügyi időszak</span>

            <select value={selectedPeriod} disabled>
              <option value={selectedPeriod}>
                {formatPeriod(selectedPeriod)}

                {isClosed ? " 🔒" : ""}
              </option>
            </select>
          </div>
        </header>

        {/* ===================================================
            CURRENT MONEY
           =================================================== */}

        <div
          className={`business__balanceCard ${
            isClosed ? "business__balanceCard--closed" : ""
          }`}
        >
          <div className="business__balanceHeader">
            <div>
              <span className="business__eyebrow">
                {formatPeriod(selectedPeriod)}
              </span>

              <h2>Rendelkezésre álló egyenleg</h2>

              {isClosed && (
                <span className="business__closedBadge">🔒 Hónap lezárva</span>
              )}
            </div>

            <div className="business__balanceIcon">
              {isClosed ? "🔒" : "💰"}
            </div>
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

          {/* =================================================
              FORMULA
             ================================================= */}

          <div className="business__balanceFormula">
            <div>
              <span>Kezdő pénzkészlet</span>

              <strong>+ {startingBalance.toLocaleString("hu-HU")} Ft</strong>
            </div>

            <div>
              <span>Havi bevétel</span>

              <strong>+ {financials.revenue.toLocaleString("hu-HU")} Ft</strong>
            </div>

            <div>
              <span>Havi beszerzés</span>

              <strong className="business__negative">
                − {financials.purchases.toLocaleString("hu-HU")} Ft
              </strong>
            </div>

            <div>
              <span>Rendezett kiadások</span>

              <strong className="business__negative">
                − {financials.paidExpenses.toLocaleString("hu-HU")} Ft
              </strong>
            </div>
          </div>
        </div>

        {/* ===================================================
            MONTHLY REVENUE
           =================================================== */}

        <div className="business__card business__card1">
          <span className="business__eyebrow">Értékesítés</span>

          <h2>Havi bevétel</h2>

          <strong>{financials.revenue.toLocaleString("hu-HU")} Ft</strong>

          <p>A kiválasztott hónap fizetett rendeléseiből származó bevétel.</p>
        </div>

        {/* ===================================================
            PURCHASES
           =================================================== */}

        <div className="business__card business__card2">
          <span className="business__eyebrow">Készlet</span>

          <h2>Havi beszerzés</h2>

          <strong>{financials.purchases.toLocaleString("hu-HU")} Ft</strong>

          <p>A kiválasztott hónap készletfeltöltési költsége.</p>
        </div>

        {/* ===================================================
            PAID EXPENSES
           =================================================== */}

        <div className="business__card business__card3">
          <span className="business__eyebrow">Kiadások</span>

          <h2>Rendezett kiadások</h2>

          <strong>{financials.paidExpenses.toLocaleString("hu-HU")} Ft</strong>

          <p>Csak a már rendezett számlák csökkentik a pénzkészletet.</p>
        </div>

        {/* ===================================================
            PENDING EXPENSES
           =================================================== */}

        <div className="business__card business__card4">
          <span className="business__eyebrow">Függőben</span>

          <h2>Rendezetlen kiadások</h2>

          <strong>
            {financials.pendingExpenses.toLocaleString("hu-HU")} Ft
          </strong>

          <p>Ezek még nem csökkentik a pénzkészletet.</p>
        </div>

        {/* ===================================================
            RESULT
           =================================================== */}

        <div className="business__resultCard">
          <div>
            <span className="business__eyebrow">Eredmény</span>

            <h2>{formatPeriod(selectedPeriod)} havi eredménye</h2>
          </div>

          <strong
            className={
              financials.monthlyResult >= 0
                ? "business__result--positive"
                : "business__result--negative"
            }
          >
            {financials.monthlyResult.toLocaleString("hu-HU")} Ft
          </strong>

          <p>Bevétel − beszerzés − rendezett kiadások.</p>
        </div>

        {/* ===================================================
            PERIOD SUMMARY
           =================================================== */}

        <div className="business__periodCard">
          <div>
            <span className="business__eyebrow">Pénzügyi időszak</span>

            <h2>{formatPeriod(selectedPeriod)}</h2>
          </div>

          <div className="business__periodRows">
            <div>
              <span>Kezdő pénz</span>

              <strong>{startingBalance.toLocaleString("hu-HU")} Ft</strong>
            </div>

            <div>
              <span>Havi eredmény</span>

              <strong>
                {financials.monthlyResult.toLocaleString("hu-HU")} Ft
              </strong>
            </div>

            <div>
              <span>Záró pénz</span>

              <strong>{currentMoney.toLocaleString("hu-HU")} Ft</strong>
            </div>

            <div>
              <span>Állapot</span>

              <strong
                className={
                  isClosed ? "business__closedText" : "business__openText"
                }
              >
                {isClosed ? "🔒 Lezárva" : "🟢 Nyitott"}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Business;
