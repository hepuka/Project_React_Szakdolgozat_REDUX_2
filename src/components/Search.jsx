import React from "react";
import "./Search.scss";

const Search = ({ value, onChange }) => {
  return (
    <div className="search">
      <span className="search__icon" aria-hidden="true">
        ⌕
      </span>

      <input
        type="search"
        aria-label="Termékek keresése"
        placeholder="Keresés név, kategória vagy leírás alapján"
        value={value}
        onChange={onChange}
      />

      {value && (
        <button
          type="button"
          className="search__clear"
          aria-label="Keresés törlése"
          onClick={() =>
            onChange({
              target: { value: "" },
            })
          }
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Search;
