import "./TableProducts.scss";
import {
  SET_SELECTEDPRODUCT,
  selectFilteredProducts,
} from "../Redux/slice/filterSlice";

import { useDispatch, useSelector } from "react-redux";

const TableProducts = () => {
  const dispatch = useDispatch();
  const selectedFilteredProduct = useSelector(selectFilteredProducts);

  const selectedProduct = (item) => {
    const stock = Number(item?.stock || 0);

    if (stock <= 0) {
      return;
    }

    dispatch(
      SET_SELECTEDPRODUCT({
        selectedproduct: item,
      }),
    );
  };

  return (
    <div className="placeorder__card placeorder__tableproducts">
      <div className="tableProducts__header">
        <div>
          <span>Termékek</span>

          <h2>Válaszd ki a terméket</h2>
        </div>

        <span className="tableProducts__count">
          {selectedFilteredProduct.length} db
        </span>
      </div>

      <div className="tableProducts__list">
        {selectedFilteredProduct.length === 0 ? (
          <div className="tableProducts__empty">
            <span>☕</span>

            <h3>Nincs megjeleníthető termék</h3>

            <p>Válassz egy másik kategóriát.</p>
          </div>
        ) : (
          selectedFilteredProduct.map((item) => {
            const stock = Number(item?.stock || 0);
            const isOutOfStock = stock <= 0;

            const isLowStock =
              stock > 0 && stock <= Number(item?.minStock || 0);

            return (
              <button
                type="button"
                key={item.id}
                disabled={isOutOfStock}
                className={`tableProducts__product ${
                  isOutOfStock ? "tableProducts__product--disabled" : ""
                }`}
                onClick={() => selectedProduct(item)}
              >
                <div className="tableProducts__productIcon">☕</div>

                <div className="tableProducts__productContent">
                  <strong>{item.name}</strong>

                  <span>
                    {Number(item.price || 0).toLocaleString("hu-HU")} Ft
                  </span>

                  <small>
                    {isOutOfStock
                      ? "Elfogyott"
                      : isLowStock
                        ? `Alacsony készlet • ${stock} db`
                        : `${stock} db készleten`}
                  </small>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TableProducts;
