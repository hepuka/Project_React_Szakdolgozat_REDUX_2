import { useEffect, useState } from "react";
import "./AddProducts.scss";
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../../firebase/config";
import Notiflix from "notiflix";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import Layout from "../../components/Layout";
import detectForm from "../../services/detectForm";
import useFetchDocument from "../../customHooks/useFetchDocument.js";

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
  price: "",
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

  const [uploadProgress, setUploadProgress] = useState(0);
  const [product, setProduct] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && productEdit) {
      setProduct({ ...initialState, ...productEdit });
    } else if (!isEditMode) {
      setProduct({ ...initialState });
    }

    setUploadProgress(0);
  }, [id, productEdit, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Notiflix.Notify.failure("Csak képfájl tölthető fel.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Notiflix.Notify.failure("A kép mérete legfeljebb 5 MB lehet.");
      e.target.value = "";
      return;
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageRef = ref(
      storage,
      `kunpaosCoffee/${Date.now()}_${safeFileName}`,
    );

    const uploadTask = uploadBytesResumable(storageRef, file);
    setUploadProgress(0);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        console.error("Image upload error:", error);
        setUploadProgress(0);
        Notiflix.Notify.failure("Nem sikerült feltölteni a képet.");
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          setProduct((prev) => ({
            ...prev,
            imageURL: downloadURL,
          }));

          setUploadProgress(100);
          Notiflix.Notify.success("Sikeres képfeltöltés!");
        } catch (error) {
          console.error("Get download URL error:", error);
          setUploadProgress(0);
          Notiflix.Notify.failure(
            "Nem sikerült lekérni a feltöltött kép címét.",
          );
        }
      },
    );
  };

  const addProduct = async (e) => {
    e.preventDefault();

    if (uploadProgress > 0 && uploadProgress < 100) {
      Notiflix.Notify.warning("Várd meg a kép feltöltésének befejezését!");
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

  const editProduct = async (e) => {
    e.preventDefault();

    if (uploadProgress > 0 && uploadProgress < 100) {
      Notiflix.Notify.warning("Várd meg a kép feltöltésének befejezését!");
      return;
    }

    setLoading(true);

    try {
      const oldImageURL = productEdit?.imageURL;
      const newImageURL = product.imageURL;

      await setDoc(
        doc(db, "kunpaosproducts", id),
        {
          name: product.name.trim(),
          imageURL: product.imageURL,
          price: Number(product.price),
          category: product.category,
          packaging: product.packaging.trim(),
          desc: product.desc.trim(),

          stock: Number(product.stock),
          minStock: Number(product.minStock),

          createdAt: productEdit.createdAt,
          editedAt: Timestamp.now().toDate(),
        },
        { merge: true },
      );

      if (
        oldImageURL &&
        newImageURL &&
        oldImageURL !== newImageURL &&
        oldImageURL.includes("firebasestorage.googleapis.com")
      ) {
        try {
          await deleteObject(ref(storage, oldImageURL));
        } catch (storageError) {
          console.warn("A régi kép nem volt törölhető:", storageError);
        }
      }

      Notiflix.Notify.success("Termék adatai módosítva!");
      navigate("/products");
    } catch (error) {
      console.error("Edit product error:", error);
      Notiflix.Notify.failure("Nem sikerült módosítani a terméket.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = detectForm(id, addProduct, editProduct);

  return (
    <Layout>
      <section className="addProduct">
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

        <form
          onSubmit={handleSubmit}
          className="addProduct__form"
          autoComplete="off"
        >
          <div className="addProduct__grid">
            <div className="addProduct__box">
              <div className="addProduct__boxHeader">
                <div className="addProduct__boxIcon">☕</div>
                <div>
                  <h2>Termék adatai</h2>
                  <p>Az alapvető termékinformációk</p>
                </div>
              </div>

              <div className="addProduct__field">
                <label htmlFor="name">Termék neve</label>
                <input
                  id="name"
                  type="text"
                  required
                  name="name"
                  value={product.name || ""}
                  placeholder="Pl. Cappuccino"
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

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

              <div className="addProduct__field">
                <label htmlFor="category">Kategória</label>
                <select
                  id="category"
                  required
                  name="category"
                  value={product.category || ""}
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

              <div className="addProduct__field">
                <label htmlFor="packaging">Mennyiség / kiszerelés</label>
                <input
                  id="packaging"
                  type="text"
                  required
                  name="packaging"
                  value={product.packaging || ""}
                  placeholder="Pl. 3 dl"
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="addProduct__field">
                <label htmlFor="stock">Aktuális készlet (db)</label>

                <input
                  id="stock"
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  required
                  value={product.stock ?? 0}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="addProduct__field">
                <label htmlFor="minStock">Minimum készlet (db)</label>

                <input
                  id="minStock"
                  type="number"
                  name="minStock"
                  min="0"
                  step="1"
                  required
                  value={product.minStock ?? 5}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

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
                  value={product.desc || ""}
                  required
                  placeholder="Írj néhány mondatot a termékről..."
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="addProduct__box">
              <div className="addProduct__boxHeader">
                <div className="addProduct__boxIcon">🖼️</div>
                <div>
                  <h2>Termékkép</h2>
                  <p>Tölts fel jó minőségű képet</p>
                </div>
              </div>

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

              {uploadProgress > 0 && (
                <div className="addProduct__progress">
                  <div className="addProduct__progressTop">
                    <span>Képfeltöltés</span>
                    <strong>{uploadProgress}%</strong>
                  </div>

                  <div className="addProduct__progressTrack">
                    <div
                      className="addProduct__progressBar"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <label htmlFor="image" className="addProduct__uploadButton">
                <span aria-hidden="true">↑</span>
                Kép kiválasztása
              </label>

              <input
                id="image"
                className="addProduct__fileInput"
                type="file"
                accept="image/*"
                name="image"
                onChange={handleImageChange}
                disabled={loading}
              />

              <p className="addProduct__imageHint">
                JPG, PNG vagy WebP • maximum 5 MB
              </p>
            </div>
          </div>

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
              disabled={loading || (uploadProgress > 0 && uploadProgress < 100)}
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
