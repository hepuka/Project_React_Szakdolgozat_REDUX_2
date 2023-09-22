import React from "react";
import "./Footer.scss";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <div className="footer">
      <h2>
        &copy; 2022 - {year}, Készítette: Kun-Fagyal Zoltán mérnökinformatikus -
        Minden jog fenntartva!
      </h2>
    </div>
  );
};

export default Footer;
