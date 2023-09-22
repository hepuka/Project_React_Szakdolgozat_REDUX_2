import React from "react";
import "./Search.scss";

const Search = ({ value, onChange }) => {
  return (
    <div className="search">
      <input
        type="text"
        placeholder="Keresés Név és Kategória alapján"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Search;
