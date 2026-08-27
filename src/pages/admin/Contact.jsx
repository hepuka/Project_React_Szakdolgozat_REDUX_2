import { useRef, useState } from "react";
import "./Contact.scss";
import Layout from "../../components/Layout";

import { FaPhoneAlt, FaEnvelope, FaTwitter } from "react-icons/fa";

import { GoLocation } from "react-icons/go";

import Notiflix from "notiflix";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const form = useRef();
  const [loading, setLoading] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await emailjs.sendForm(
        "service_4661qd7",
        "template_wjdie3h",
        form.current,
        "_geOTjcVpuDwzlJcL",
      );

      Notiflix.Notify.success("Üzenet sikeresen elküldve!");

      form.current.reset();
    } catch (error) {
      console.error("Email sending error:", error);

      Notiflix.Notify.failure("Nem sikerült elküldeni az üzenetet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="contact">
        <header className="contact__header">
          <div>
            <span className="contact__eyebrow">Support & Contact</span>

            <h1>Kapcsolat / Hibabejelentés</h1>

            <p>
              Kérdésed vagy problémád van? Küldj nekünk üzenetet, vagy keresd
              ügyfélszolgálatunkat az alábbi elérhetőségeken.
            </p>
          </div>
        </header>

        <div className="contact__content">
          <section className="contact__card contact__details">
            <div className="contact__cardHeader">
              <div className="contact__cardIcon">💬</div>

              <div>
                <h2>Lépjen kapcsolatba velünk</h2>

                <p>
                  Örömmel segítünk a rendszer használatával és a felmerülő
                  problémákkal kapcsolatban.
                </p>
              </div>
            </div>

            <div className="contact__infoList">
              <a href="tel:+36301111222" className="contact__infoItem">
                <div className="contact__infoIcon">
                  <FaPhoneAlt />
                </div>

                <div>
                  <span>Telefon</span>

                  <strong>+36 30 111 1222</strong>
                </div>
              </a>

              <a
                href="mailto:support@hepukadev.com"
                className="contact__infoItem"
              >
                <div className="contact__infoIcon">
                  <FaEnvelope />
                </div>

                <div>
                  <span>E-mail</span>

                  <strong>support@hepukadev.com</strong>
                </div>
              </a>

              <div className="contact__infoItem">
                <div className="contact__infoIcon">
                  <GoLocation />
                </div>

                <div>
                  <span>Helyszín</span>

                  <strong>Debrecen, Magyarország</strong>
                </div>
              </div>

              <a
                href="https://twitter.com/hepuka"
                target="_blank"
                rel="noreferrer"
                className="contact__infoItem"
              >
                <div className="contact__infoIcon">
                  <FaTwitter />
                </div>

                <div>
                  <span>Twitter / X</span>

                  <strong>@hepuka</strong>
                </div>
              </a>
            </div>

            <div className="contact__supportBox">
              <span className="contact__supportIcon">☕</span>

              <div>
                <strong>KunPao's Coffee Support</strong>

                <p>
                  Igyekszünk minden megkeresésre a lehető leghamarabb
                  válaszolni.
                </p>
              </div>
            </div>
          </section>

          <section className="contact__card contact__formCard">
            <div className="contact__cardHeader">
              <div className="contact__cardIcon">✉</div>

              <div>
                <h2>Üzenet küldése</h2>

                <p>
                  Töltsd ki az űrlapot, és elküldjük üzenetedet
                  ügyfélszolgálatunknak.
                </p>
              </div>
            </div>

            <form ref={form} onSubmit={sendEmail} className="contact__form">
              <div className="contact__field">
                <label htmlFor="user_name">Név</label>

                <input
                  id="user_name"
                  type="text"
                  name="user_name"
                  placeholder="Add meg a neved"
                  required
                  disabled={loading}
                />
              </div>

              <div className="contact__field">
                <label htmlFor="user_email">E-mail cím</label>

                <input
                  id="user_email"
                  type="email"
                  name="user_email"
                  placeholder="email@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="contact__field">
                <label htmlFor="subject">Tárgy</label>

                <input
                  id="subject"
                  type="text"
                  name="subject"
                  placeholder="Miben segíthetünk?"
                  required
                  disabled={loading}
                />
              </div>

              <div className="contact__field">
                <label htmlFor="message">Üzenet</label>

                <textarea
                  id="message"
                  name="message"
                  placeholder="Írd le részletesen a problémát vagy kérdésedet..."
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="contact__submitButton"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="contact__spinner" aria-hidden="true" />
                    Küldés...
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">✈</span>
                    Üzenet elküldése
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
