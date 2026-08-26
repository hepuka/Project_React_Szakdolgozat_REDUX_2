import React from "react";
import "./Footer.scss";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <span>© 2022 - {year} Kun-Fagyal Zoltán</span>

      <span className="footer__separator">•</span>

      <span>Minden jog fenntartva!</span>
    </footer>
  );
};

export default Footer;
