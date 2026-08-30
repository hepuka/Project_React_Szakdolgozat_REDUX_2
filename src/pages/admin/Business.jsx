import Layout from "../../components/Layout";
import useFetchCollection from "../../customHooks/useFetchCollection";
import "./Business.scss";

const Business = () => {
  const orders = useFetchCollection("kunpaosorders");
  const products = useFetchCollection("kunpaosproducts");
  const stockPurchases = useFetchCollection("stockPurchases");

  // =========================================================
  // ÖSSZES ELADÁSI BEVÉTEL
  // =========================================================

  const totalRevenue = orders.reduce(
    (acc, curr) => acc + Number(curr?.orderAmount || 0),
    0,
  );

  // =========================================================
  // BESZERZÉSI KÖLTSÉGEK
  // =========================================================

  const totalPurchases = stockPurchases.reduce(
    (acc, curr) => acc + Number(curr?.total || 0),
    0,
  );

  // =========================================================
  // MŰKÖDÉSI EREDMÉNY
  // Bevétel - beszerzési költség
  // =========================================================

  const operatingResult = totalRevenue - totalPurchases;

  // =========================================================
  // KÁVÉZÓ JELENLEGI EGYENLEGE
  //
  // A jelenlegi adatmodellben ez megegyezik
  // az értékesítésből származó bevétel és a
  // beszerzések különbségével.
  // =========================================================

  const cafeBalance = operatingResult;

  return (
    <Layout>
      <section className="business">
        {/* =====================================================
            ÖSSZES BEVÉTEL
           ===================================================== */}

        <div className="business__card business__card1">
          <span className="business__eyebrow">Értékesítés</span>

          <h2>Összes bevétel</h2>

          <strong>{totalRevenue.toLocaleString("hu-HU")} Ft</strong>

          <p>
            A lezárt rendelésekből beérkezett teljes összeg, az 5%-os adóval
            együtt.
          </p>
        </div>

        {/* =====================================================
            BESZERZÉSI KÖLTSÉG
           ===================================================== */}

        <div className="business__card business__card2">
          <span className="business__eyebrow">Készlet</span>

          <h2>Beszerzési költség</h2>

          <strong>{totalPurchases.toLocaleString("hu-HU")} Ft</strong>

          <p>A készletfeltöltésre, utánpótlásra fordított összes összeg.</p>
        </div>

        {/* =====================================================
            MŰKÖDÉSI EREDMÉNY
           ===================================================== */}

        <div className="business__card business__card3">
          <span className="business__eyebrow">Eredmény</span>

          <h2>Működési eredmény</h2>

          <strong>{operatingResult.toLocaleString("hu-HU")} Ft</strong>

          <p>Összes bevétel mínusz beszerzési költség.</p>
        </div>

        {/* =====================================================
            TERMÉKEK
           ===================================================== */}

        <div className="business__card business__card4">
          <span className="business__eyebrow">Termékek</span>

          <h2>Termékek száma</h2>

          <strong>{products.length}</strong>

          <p>Az aktuálisan nyilvántartott termékek száma.</p>
        </div>

        {/* =====================================================
            KÁVÉZÓ PÉNZE
           ===================================================== */}

        <div className="business__card business__card5">
          <span className="business__eyebrow">Pénzügyek</span>

          <h2>Kávézó jelenlegi egyenlege</h2>

          <strong
            className={
              cafeBalance >= 0
                ? "business__balance--positive"
                : "business__balance--negative"
            }
          >
            {cafeBalance.toLocaleString("hu-HU")} Ft
          </strong>

          <p>Értékesítési bevétel mínusz beszerzési költség.</p>
        </div>
      </section>
    </Layout>
  );
};

export default Business;
