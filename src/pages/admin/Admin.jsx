import "./Admin.scss";
import Layout from "../../components/Layout";

const Admin = () => {
  return (
    <Layout>
      <section className="admin">
        <div className="admin__hero">
          <div className="admin__logo">
            <img
              src="https://freesvg.org/img/1667812423coffee-shop-logo-concept.png"
              alt="KunPao's Coffee logo"
            />
          </div>

          <span className="admin__eyebrow">Coffee Management System</span>

          <h1>KunPao's Coffee</h1>

          <p>
            Üdvözlünk a kávézó menedzsment rendszerében.
            <br />
            Válassz egy funkciót az oldalsó menüből a folytatáshoz.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Admin;
