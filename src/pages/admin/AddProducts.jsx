import { useCallback, useEffect, useRef, useState } from "react";

import "./AddProducts.scss";

import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";

import { useNavigate, useParams } from "react-router-dom";

import { db } from "../../firebase/config";

import Notiflix from "notiflix";

import Layout from "../../components/Layout";

import detectForm from "../../services/detectForm";

import useFetchDocument from "../../customHooks/useFetchDocument.js";

import CloudinaryUpload from "../../components/CloudinaryUpload";

const categories = [
  { id: 1, name: "Kávé" },
  { id: 2, name: "Italok" },
  { id: 3, name: "Sütemények" },
  { id: 4, name: "Gyümölcslevek" },
  { id: 5, name: "Tea" },
  { id: 6, name: "Péksütemények" },
];

const initialState = {
  name: "",
  imageURL: "",
  imagePublicId: "",
  price: 0,
  category: "",
  packaging: "",
  desc: "",
  stock: 0,
  minStock: 5,
};

const AddProducts = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const productEdit = useFetchDocument("kunpaosproducts", id);

  const isEditMode = id !== "ADD";

  /*
   * Megakadályozza, hogy ugyanazt a Firebase dokumentumot
   * minden rendernél újra betöltsük az űrlapba.
   */
  const initializedIdRef = useRef(null);

  const [product, setProduct] = useState({ ...initialState });

  const [loading, setLoading] = useState(false);

  const [imageUploaded, setImageUploaded] = useState(false);

  // =========================================================
  // FORM INICIALIZÁLÁSA
  // =========================================================

  useEffect(() => {
    /*
     * ÚJ TERMÉK
     */

    if (!isEditMode) {
      if (initializedIdRef.current !== "ADD") {
        setProduct({
          ...initialState,
        });

        setImageUploaded(false);

        initializedIdRef.current = "ADD";
      }

      return;
    }

    /*
     * SZERKESZTÉS
     *
     * Csak akkor töltjük be a Firebase adatot,
     * amikor valóban másik dokumentumot nyitottunk meg.
     */

    if (
      isEditMode &&
      productEdit?.id &&
      initializedIdRef.current !== productEdit.id
    ) {
      setProduct({
        ...initialState,
        ...productEdit,
      });

      setImageUploaded(Boolean(productEdit.imageURL));

      initializedIdRef.current = productEdit.id;
    }
  }, [id, isEditMode, productEdit?.id]);

  // =========================================================
  // INPUT KEZELÉS
  // =========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CLOUDINARY FELTÖLTÉS
  // =========================================================

  const handleCloudinaryUpload = useCallback((imageData) => {
    if (!imageData?.url) {
      Notiflix.Notify.failure(
        "A Cloudinary nem adott vissza érvényes kép URL-t.",
      );

      return;
    }

    setProduct((prev) => ({
      ...prev,

      imageURL: imageData.url,

      imagePublicId: imageData.publicId || "",
    }));

    setImageUploaded(true);
  }, []);

  // =========================================================
  // ÚJ TERMÉK
  // =========================================================

  const addProduct = async (e) => {
    e.preventDefault();

    if (!product.name.trim()) {
      Notiflix.Notify.warning("Add meg a termék nevét!");

      return;
    }

    if (!product.category) {
      Notiflix.Notify.warning("Válassz kategóriát!");

      return;
    }

    if (!product.imageURL) {
      Notiflix.Notify.warning("Adj hozzá egy képet a termékhez!");

      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "kunpaosproducts"), {
        name: product.name.trim(),

        imageURL: product.imageURL,

        imagePublicId: product.imagePublicId || "",

        price: Number(product.price),

        category: product.category,

        packaging: product.packaging.trim(),

        desc: product.desc.trim(),

        stock: Number(product.stock),

        minStock: Number(product.minStock),

        createdAt: Timestamp.now().toDate(),
      });

      Notiflix.Notify.success("Sikeres termék feltöltés!");

      navigate("/products");
    } catch (error) {
      console.error("Add product error:", error);

      Notiflix.Notify.failure("Nem sikerült létrehozni a terméket.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // TERMÉK MÓDOSÍTÁSA
  // =========================================================

  const editProduct = async (e) => {
    e.preventDefault();

    if (!product.name.trim()) {
      Notiflix.Notify.warning("Add meg a termék nevét!");

      return;
    }

    if (!product.category) {
      Notiflix.Notify.warning("Válassz kategóriát!");

      return;
    }

    if (!product.imageURL) {
      Notiflix.Notify.warning("A termékhez nincs kép megadva.");

      return;
    }

    setLoading(true);

    try {
      await setDoc(
        doc(db, "kunpaosproducts", id),
        {
          name: product.name.trim(),

          imageURL: product.imageURL,

          imagePublicId: product.imagePublicId || "",

          price: Number(product.price),

          category: product.category,

          packaging: product.packaging.trim(),

          desc: product.desc.trim(),

          stock: Number(product.stock),

          minStock: Number(product.minStock),

          createdAt: productEdit?.createdAt || Timestamp.now().toDate(),

          editedAt: Timestamp.now().toDate(),
        },
        {
          merge: true,
        },
      );

      Notiflix.Notify.success("Termék adatai módosítva!");

      navigate("/products");
    } catch (error) {
      console.error("Edit product error:", error);

      Notiflix.Notify.failure("Nem sikerült módosítani a terméket.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORM SUBMIT
  // =========================================================

  const handleSubmit = detectForm(id, addProduct, editProduct);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Layout>
      <section className="addProduct">
        {/* ===================================================
            HEADER
           =================================================== */}

        <header className="addProduct__header">
          <div>
            <span className="addProduct__eyebrow">
              {isEditMode ? "Product Management" : "Coffee Management"}
            </span>

            <h1>
              {detectForm(
                id,
                "Új termék hozzáadása",
                "Termék adatainak módosítása",
              )}
            </h1>

            <p>
              {isEditMode
                ? "A kiválasztott termék adatainak frissítése."
                : "Új termék hozzáadása a kávézó kínálatához."}
            </p>
          </div>

          <button
            type="button"
            className="addProduct__backButton"
            onClick={() => navigate("/products")}
            disabled={loading}
          >
            ← Vissza
          </button>
        </header>

        {/* ===================================================
            FORM
           =================================================== */}

        <form
          onSubmit={handleSubmit}
          className="addProduct__form"
          autoComplete="off"
        >
          <div className="addProduct__grid">
            {/* =================================================
                TERMÉK ADATAI
               ================================================= */}

            <div className="addProduct__box">
              <div className="addProduct__boxHeader">
                <div className="addProduct__boxIcon">☕</div>

                <div>
                  <h2>Termék adatai</h2>

                  <p>Az alapvető termékinformációk</p>
                </div>
              </div>

              {/* TERMÉK NEVE */}

              <div className="addProduct__field">
                <label htmlFor="name">Termék neve</label>

                <input
                  id="name"
                  type="text"
                  required
                  name="name"
                  value={product.name ?? ""}
                  placeholder="Pl. Cappuccino"
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              {/* ÁR */}

              <div className="addProduct__field">
                <label htmlFor="price">Egységár (Ft)</label>

                <input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  required
                  name="price"
                  value={product.price ?? ""}
                  placeholder="Pl. 1290"
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              {/* KATEGÓRIA */}

              <div className="addProduct__field">
                <label htmlFor="category">Kategória</label>

                <select
                  id="category"
                  required
                  name="category"
                  value={product.category ?? ""}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="" disabled>
                    -- Válassz kategóriát --
                  </option>

                  {categories.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* KISZERELÉS */}

              <div className="addProduct__field">
                <label htmlFor="packaging">Mennyiség / kiszerelés</label>

                <input
                  id="packaging"
                  type="text"
                  required
                  name="packaging"
                  value={product.packaging ?? ""}
                  placeholder="Pl. 3 dl"
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              {/* STOCK */}

              <div className="addProduct__field">
                <label htmlFor="stock">Aktuális készlet (db)</label>

                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  name="stock"
                  value={product.stock ?? 0}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              {/* MIN STOCK */}

              <div className="addProduct__field">
                <label htmlFor="minStock">Minimum készlet (db)</label>

                <input
                  id="minStock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  name="minStock"
                  value={product.minStock ?? 5}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* =================================================
                LEÍRÁS
               ================================================= */}

            <div className="addProduct__box addProduct__box--description">
              <div className="addProduct__boxHeader">
                <div className="addProduct__boxIcon">📝</div>

                <div>
                  <h2>Leírás</h2>

                  <p>Rövid ismertető a termékről</p>
                </div>
              </div>

              <div className="addProduct__field addProduct__field--description">
                <textarea
                  id="desc"
                  name="desc"
                  value={product.desc ?? ""}
                  required
                  placeholder="Írj néhány mondatot a termékről..."
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* =================================================
                TERMÉKKÉP
               ================================================= */}

            <div className="addProduct__box">
              <div className="addProduct__boxHeader">
                <div className="addProduct__boxIcon">🖼️</div>

                <div>
                  <h2>Termékkép</h2>

                  <p>Tölts fel jó minőségű képet</p>
                </div>
              </div>

              {/* KÉP ELŐNÉZET */}

              <div className="addProduct__imagePreview">
                {product.imageURL ? (
                  <img
                    src={product.imageURL}
                    alt={product.name || "Termék előnézete"}
                  />
                ) : (
                  <div className="addProduct__imagePlaceholder">
                    <span>☕</span>

                    <p>Még nincs kiválasztott kép</p>
                  </div>
                )}
              </div>

              {/* CLOUDINARY */}

              <CloudinaryUpload onUpload={handleCloudinaryUpload} />

              {imageUploaded && (
                <div className="addProduct__imageUploaded">
                  <span>✓</span>
                  Kép sikeresen feltöltve
                </div>
              )}

              <p className="addProduct__imageHint">
                JPG, PNG vagy WebP
                <br />
                Maximum 2 MB
              </p>
            </div>
          </div>

          {/* ===================================================
              ACTION BUTTONS
             =================================================== */}

          <div className="addProduct__actions">
            <button
              type="button"
              className="addProduct__cancelButton"
              onClick={() => navigate("/products")}
              disabled={loading}
            >
              Mégse
            </button>

            <button
              type="submit"
              className="addProduct__submitButton"
              disabled={loading || !product.imageURL}
            >
              {loading ? (
                <>
                  <span className="addProduct__spinner" aria-hidden="true" />
                  Mentés...
                </>
              ) : (
                <>
                  <span aria-hidden="true">{isEditMode ? "✓" : "＋"}</span>

                  {detectForm(id, "Hozzáad", "Módosít")}
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
};

export default AddProducts;
