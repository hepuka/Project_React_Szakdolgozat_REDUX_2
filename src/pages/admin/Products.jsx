import { useMemo, useState } from "react";
import "./Products.scss";
import Layout from "../../components/Layout";
import Search from "../../components/Search";
import { Link } from "react-router-dom";
import Notiflix from "notiflix";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../../firebase/config";
import { OnlyManager } from "../../components/OnlyAdmin";
import { useSelector } from "react-redux";
import { selectProducts } from "../../Redux/slice/productSlice";

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

const getStockStatus = (stock, minStock) => {
  const currentStock = Number(stock || 0);
  const minimumStock = Number(minStock || 0);

  if (currentStock <= 0) {
    return {
      label: "Elfogyott",
      className: "products__stock--empty",
      icon: "🔴",
    };
  }

  if (currentStock <= minimumStock) {
    return {
      label: "Alacsony készlet",
      className: "products__stock--low",
      icon: "🟡",
    };
  }

  return {
    label: "Készleten",
    className: "products__stock--available",
    icon: "🟢",
  };
};

const Products = () => {
  const data = useSelector(selectProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Összes");

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return data.filter((item) => {
      const name = item?.name?.toLowerCase() || "";
      const category = item?.category?.toLowerCase() || "";
      const description = item?.desc?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        category.includes(searchValue) ||
        description.includes(searchValue);

      const itemCategory = item?.category?.trim() || "";

      const matchesCategory =
        selectedCategory === "Összes" || itemCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [data, search, selectedCategory]);

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

      if (imageURL && imageURL.includes("firebasestorage.googleapis.com")) {
        try {
          await deleteObject(ref(storage, imageURL));
        } catch (storageError) {
          console.warn("A Storage kép nem volt törölhető:", storageError);
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

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("Összes");
  };

  return (
    <Layout>
      <section className="products">
        <header className="products__header">
          <div>
            <span className="products__eyebrow">Coffee Management</span>

            <h1>Termékek</h1>

            <p>A kávézóban elérhető termékek és készletek kezelése.</p>
          </div>

          <OnlyManager>
            <Link to="/add-product/ADD" className="products__addButton">
              <span aria-hidden="true">＋</span>
              Új termék
            </Link>
          </OnlyManager>
        </header>

        <div className="products__toolbar">
          <div className="products__count">
            <div className="products__countIcon">☕</div>

            <div>
              <strong>{filteredProducts.length}</strong>

              <span>
                {selectedCategory === "Összes"
                  ? "termék"
                  : `${selectedCategory} termék`}
              </span>
            </div>
          </div>

          <Search value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="products__categoryBar">
          <button
            type="button"
            className={`products__categoryButton ${
              selectedCategory === "Összes"
                ? "products__categoryButton--active"
                : ""
            }`}
            onClick={() => setSelectedCategory("Összes")}
            aria-pressed={selectedCategory === "Összes"}
          >
            <div className="products__categoryIcon">☕</div>

            <span>Összes</span>
          </button>

          {data.map((item, index) => {
            const category = item?.category?.trim();

            if (!category) {
              return null;
            }

            const firstIndex = data.findIndex(
              (product) => product?.category?.trim() === category,
            );

            if (firstIndex !== index) {
              return null;
            }

            return (
              <button
                key={category}
                type="button"
                className={`products__categoryButton ${
                  selectedCategory === category
                    ? "products__categoryButton--active"
                    : ""
                }`}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
              >
                <div className="products__categoryIcon">☕</div>

                <span>{category}</span>
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="products__empty">
            <div className="products__emptyIcon">☕</div>

            <h2>Nem található termék</h2>

            <p>
              {search
                ? `A(z) „${search}” keresésre nincs találat.`
                : `A(z) „${selectedCategory}” kategóriában nincs termék.`}
            </p>

            {(search || selectedCategory !== "Összes") && (
              <button
                type="button"
                className="products__resetButton"
                onClick={clearFilters}
              >
                Szűrők törlése
              </button>
            )}
          </div>
        ) : (
          <div className="products__cardlist">
            {filteredProducts.map((item) => {
              const image = getProductImage(item);

              const stockStatus = getStockStatus(item.stock, item.minStock);

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

                      <span className="products__price">
                        {Number(item.price || 0).toLocaleString("hu-HU")} Ft
                      </span>
                    </div>

                    <div className="products__meta">
                      <span>
                        <small>Kiszerelés</small>

                        {item.packaging || "—"}
                      </span>
                    </div>

                    <div className="products__stock">
                      <div
                        className={`products__stockStatus ${stockStatus.className}`}
                      >
                        <span>{stockStatus.icon}</span>

                        <strong>{stockStatus.label}</strong>
                      </div>

                      <div className="products__stockInfo">
                        <span>Készlet</span>

                        <strong>{Number(item.stock || 0)} db</strong>
                      </div>

                      <div className="products__stockInfo">
                        <span>Minimum</span>

                        <strong>{Number(item.minStock || 0)} db</strong>
                      </div>
                    </div>

                    {item.desc && (
                      <p className="products__description">{item.desc}</p>
                    )}
                  </div>

                  <OnlyManager>
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
                  </OnlyManager>
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
