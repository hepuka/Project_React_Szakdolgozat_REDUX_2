import { useMemo, useState } from "react";
import "./Products.scss";
import Layout from "../../components/Layout";
import useFetchCollection from "../../customHooks/useFetchCollection";
import Search from "../../components/Search";
import { Link } from "react-router-dom";
import Notiflix from "notiflix";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../../firebase/config";
import { OnlyAdmin } from "../../components/OnlyAdmin";

const FALLBACK_IMAGES = {
  espresso:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
  latte:
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85",
  cappuccino:
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85",
  coffee:
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=85",
};

const getProductImage = (product) => {
  if (product?.imageURL) {
    return product.imageURL;
  }

  const category = product?.category?.toLowerCase() || "";
  const name = product?.name?.toLowerCase() || "";

  if (category.includes("latte") || name.includes("latte")) {
    return FALLBACK_IMAGES.latte;
  }

  if (category.includes("cappuccino") || name.includes("cappuccino")) {
    return FALLBACK_IMAGES.cappuccino;
  }

  if (category.includes("espresso") || name.includes("espresso")) {
    return FALLBACK_IMAGES.espresso;
  }

  return FALLBACK_IMAGES.coffee;
};

const Products = () => {
  const data = useFetchCollection("kunpaosproducts");
  const [search, setSearch] = useState("");
  const categories = useMemo(() => {
    const uniqueCategories = new Set();

    data.forEach((item) => {
      uniqueCategories.add(item.category);
    });

    return Array.from(uniqueCategories);
  }, [data]);

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return data;
    }

    return data.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const category = item.category?.toLowerCase() || "";
      const description = item.desc?.toLowerCase() || "";

      return (
        name.includes(searchValue) ||
        category.includes(searchValue) ||
        description.includes(searchValue)
      );
    });
  }, [data, search]);

  const confirmDelete = (id, imageURL) => {
    Notiflix.Confirm.show(
      "Termék törlése!",
      "Valóban törölni akarja a terméket?",
      "Törlés",
      "Mégse",
      () => deleteProduct(id, imageURL),
      () => {},
      {
        width: "340px",
        borderRadius: "14px",
        titleColor: "#2c1e1a",
        okButtonBackground: "#b15252",
        cssAnimationStyle: "zoom",
      },
    );
  };

  const deleteProduct = async (id, imageURL) => {
    try {
      await deleteDoc(doc(db, "kunpaosproducts", id));

      // Csak akkor próbáljuk törölni a Storage fájlt,
      // ha az URL valóban Firebase Storage URL.
      if (imageURL && imageURL.includes("firebasestorage.googleapis.com")) {
        try {
          const storageRef = ref(storage, imageURL);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.warn(
            "A Firestore dokumentum törölve, de a Storage kép nem volt törölhető:",
            storageError,
          );
        }
      }

      Notiflix.Notify.success("Sikeres termék törlés!");
    } catch (error) {
      console.error("Delete product error:", error);
      Notiflix.Notify.failure("Nem sikerült törölni a terméket.");
    }
  };

  const handleImageError = (event, product) => {
    const fallback = getProductImage({
      ...product,
      imageURL: "",
    });

    if (event.currentTarget.src !== fallback) {
      event.currentTarget.src = fallback;
    }
  };

  return (
    <Layout>
      <section className="products">
        <header className="products__header">
          <div>
            <span className="products__eyebrow">Coffee Management</span>

            <h1>Termékek</h1>

            <p>A kávézóban elérhető termékek kezelése.</p>
          </div>

          <OnlyAdmin>
            <Link to="/add-product/ADD" className="products__addButton">
              <span aria-hidden="true">＋</span>
              Új termék
            </Link>
          </OnlyAdmin>
        </header>

        <div className="products__toolbar">
          <div className="products__count">
            <div className="products__countIcon">☕</div>

            <div>
              <strong>{data.length}</strong>
              <span>termék a kínálatban</span>
            </div>
          </div>

          {/*           {categories.map((item) => (
            <div key={item} className="products__count">
              <div>
                <strong>{item}</strong>
              </div>
            </div>
          ))} */}

          <Search value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="products__empty">
            <div className="products__emptyIcon">☕</div>

            <h2>Nem található termék</h2>

            <p>
              {search
                ? `A(z) „${search}” keresésre nincs találat.`
                : "Még nincs termék rögzítve a rendszerben."}
            </p>
          </div>
        ) : (
          <div className="products__cardlist">
            {filteredProducts.map((item) => {
              const image = getProductImage(item);

              return (
                <article key={item.id} className="products__card">
                  <div className="products__image">
                    <img
                      src={image}
                      alt={item.name || "Termék"}
                      loading="lazy"
                      onError={(event) => handleImageError(event, item)}
                    />

                    {item.category && (
                      <span className="products__category">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div className="products__details">
                    <div className="products__titleRow">
                      <h2>{item.name || "Névtelen termék"}</h2>

                      <span className="products__price">{item.price} Ft</span>
                    </div>

                    <div className="products__meta">
                      <span>
                        <small>Kiszerelés</small>
                        {item.packaging || "—"}
                      </span>
                    </div>

                    {item.desc && (
                      <p className="products__description">{item.desc}</p>
                    )}
                  </div>

                  <OnlyAdmin>
                    <div className="products__buttons">
                      <Link
                        to={`/add-product/${item.id}`}
                        className="products__editButton"
                      >
                        <span aria-hidden="true">✎</span>
                        Módosít
                      </Link>

                      <button
                        type="button"
                        className="products__deleteButton"
                        onClick={() => confirmDelete(item.id, item.imageURL)}
                      >
                        <span aria-hidden="true">⌫</span>
                        Töröl
                      </button>
                    </div>
                  </OnlyAdmin>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Products;
