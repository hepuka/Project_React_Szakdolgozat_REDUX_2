import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  doc,
  onSnapshot,
  runTransaction,
  collection,
  Timestamp,
} from "firebase/firestore";

import Layout from "../../components/Layout";

import Notiflix from "notiflix";

import { db } from "../../firebase/config";

import "./ProductOrder.scss";

const ProductOrder = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(false);

  // =========================================================
  // TERMÉK BETÖLTÉSE
  // =========================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    const productRef = doc(db, "kunpaosproducts", id);

    const unsubscribe = onSnapshot(
      productRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setProduct(null);
          return;
        }

        setProduct({
          id: snapshot.id,
          ...snapshot.data(),
        });
      },
      (error) => {
        console.error("Product listener error:", error);

        Notiflix.Notify.failure("Nem sikerült betölteni a terméket.");
      },
    );

    return () => {
      unsubscribe();
    };
  }, [id]);

  // =========================================================
  // ÁRKALKULÁCIÓ
  // =========================================================

  const originalPrice = Number(product?.price || 0);

  /*
   * Beszerzési ár:
   * eredeti ár - 15%
   *
   * 100% - 15% = 85%
   */

  const purchasePrice = Math.round(originalPrice * 0.85);

  const totalPrice = purchasePrice * quantity;

  // =========================================================
  // MENNYISÉG MÓDOSÍTÁSA
  // =========================================================

  const handleQuantityChange = (e) => {
    const value = e.target.value;

    /*
     * Üres mezőt is engedünk szerkesztés közben,
     * így a felhasználó szabadon átírhatja az értéket.
     */
    if (value === "") {
      setQuantity("");
      return;
    }

    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      setQuantity(Math.max(1, Math.floor(numericValue)));
    }
  };

  // =========================================================
  // RENDELÉS
  // =========================================================

  const handleOrder = async (e) => {
    e.preventDefault();

    if (!product) {
      Notiflix.Notify.failure("A termék nem található.");

      return;
    }

    /*
     * Az input átmenetileg lehet üres,
     * ezért itt újra ellenőrizzük.
     */

    const orderQuantity = Number(quantity);

    if (!Number.isInteger(orderQuantity) || orderQuantity <= 0) {
      Notiflix.Notify.warning(
        "Adj meg 1 vagy több darabos érvényes mennyiséget.",
      );

      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const productRef = doc(db, "kunpaosproducts", id);

      const purchaseRef = doc(collection(db, "stockPurchases"));

      await runTransaction(db, async (transaction) => {
        // =================================================
        // LEGFRISSEBB TERMÉKADAT
        // =================================================

        const productSnapshot = await transaction.get(productRef);

        if (!productSnapshot.exists()) {
          throw new Error("A termék már nem található.");
        }

        const currentProduct = productSnapshot.data();

        const currentStock = Number(currentProduct.stock || 0);

        const currentPrice = Number(currentProduct.price || 0);

        // =================================================
        // BESZERZÉSI ÁR
        // =================================================

        const currentPurchasePrice = Math.round(currentPrice * 0.85);

        const purchaseTotal = currentPurchasePrice * orderQuantity;

        // =================================================
        // KÉSZLET NÖVELÉSE
        // =================================================

        transaction.update(productRef, {
          stock: currentStock + orderQuantity,

          editedAt: Timestamp.now().toDate(),
        });

        // =================================================
        // BESZERZÉS NAPLÓZÁSA
        // =================================================

        transaction.set(purchaseRef, {
          productId: id,

          productName: currentProduct.name,

          quantity: orderQuantity,

          originalPrice: currentPrice,

          purchasePrice: currentPurchasePrice,

          discountPercent: 15,

          total: purchaseTotal,

          createdAt: Timestamp.now().toDate(),
        });
      });

      Notiflix.Notify.success(
        `Sikeres rendelés! ${orderQuantity} db ${product.name} hozzáadva a készlethez.`,
      );

      navigate("/products");
    } catch (error) {
      console.error("Stock purchase error:", error);

      Notiflix.Notify.failure(
        error.message || "Nem sikerült leadni a rendelést.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // TERMÉK NEM TALÁLHATÓ
  // =========================================================

  if (!product) {
    return (
      <Layout>
        <section className="productOrder">
          <div className="productOrder__notFound">
            <span>☕</span>

            <h1>A termék nem található</h1>

            <button type="button" onClick={() => navigate("/products")}>
              Vissza a termékekhez
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="productOrder">
        {/* ===================================================
            HEADER
           =================================================== */}

        <header className="productOrder__header">
          <div>
            <span className="productOrder__eyebrow">Készletfeltöltés</span>

            <h1>Termék rendelése</h1>

            <p>Rendelj utánpótlást a kritikus készletszintű termékhez.</p>
          </div>
        </header>

        {/* ===================================================
            CONTENT
           =================================================== */}

        <div className="productOrder__content">
          {/* =================================================
              TERMÉK
             ================================================= */}

          <article className="productOrder__productCard">
            <div className="productOrder__image">
              {product.imageURL ? (
                <img src={product.imageURL} alt={product.name} />
              ) : (
                <span>☕</span>
              )}
            </div>

            <div className="productOrder__productInfo">
              <span>{product.category}</span>

              <h2>{product.name}</h2>

              <div className="productOrder__productMeta">
                <div>
                  <small>Aktuális készlet</small>

                  <strong>{Number(product.stock || 0)} db</strong>
                </div>

                <div>
                  <small>Minimum készlet</small>

                  <strong>{Number(product.minStock || 0)} db</strong>
                </div>
              </div>
            </div>
          </article>

          {/* =================================================
              ORDER FORM
             ================================================= */}

          <form className="productOrder__form" onSubmit={handleOrder}>
            <div className="productOrder__formHeader">
              <span>Rendelés</span>

              <h2>Utánpótlás</h2>
            </div>

            {/* =============================================
                EREDETI ÁR
               ============================================= */}

            <div className="productOrder__priceRow">
              <span>Eredeti ár</span>

              <strong>{originalPrice.toLocaleString("hu-HU")} Ft</strong>
            </div>

            {/* =============================================
                BESZERZÉSI ÁR
               ============================================= */}

            <div className="productOrder__discount">
              <div>
                <span>Beszerzési ár</span>

                <small>15% kedvezmény</small>
              </div>

              <strong>{purchasePrice.toLocaleString("hu-HU")} Ft / db</strong>
            </div>

            {/* =============================================
                RENDELÉSI MENNYISÉG
               ============================================= */}

            <div className="productOrder__field">
              <label htmlFor="quantity">Rendelési mennyiség</label>

              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={handleQuantityChange}
                disabled={loading}
                required
                className="productOrder__quantityInput"
              />

              <small className="productOrder__fieldHint">
                Add meg, hány darabot szeretnél rendelni.
              </small>
            </div>

            {/* =============================================
                ÖSSZESEN
               ============================================= */}

            <div className="productOrder__total">
              <span>Beszerzés összesen</span>

              <strong>
                {(purchasePrice * Number(quantity || 0)).toLocaleString(
                  "hu-HU",
                )}{" "}
                Ft
              </strong>
            </div>

            {/* =============================================
                GOMBOK
               ============================================= */}

            <div className="productOrder__buttons">
              <button
                type="button"
                className="productOrder__cancel"
                onClick={() => navigate("/products")}
                disabled={loading}
              >
                Mégse
              </button>

              <button
                type="submit"
                className="productOrder__submit"
                disabled={loading}
              >
                {loading ? "Rendelés..." : "✓ Rendelés leadása"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default ProductOrder;
