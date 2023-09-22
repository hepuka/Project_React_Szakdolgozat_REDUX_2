import React, { useRef } from "react";
import "./Contact.scss";
import Layout from "../../components/Layout";
import { FaPhoneAlt, FaEnvelope, FaTwitter } from "react-icons/fa";
import { GoLocation } from "react-icons/go";
import Notiflix from "notiflix";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();
    // console.log(form.current);

    emailjs
      .sendForm(
        "service_4661qd7",
        "template_wjdie3h",
        form.current,
        "_geOTjcVpuDwzlJcL"
      )
      .then(
        (result) => {
          Notiflix.Notify.success("Üzenet elküldve!");
        },
        (error) => {
          Notiflix.Notify.failure(error.message);
        }
      );
    e.target.reset();
  };

  return (
    <Layout>
      <div className="contact">
        <h1>Kapcsolat / Hibabejelentés</h1>
        <div className="contact__card contact__details">
          <h3>Lépjen kapcsolatba velünk</h3>
          <p>
            Kérjük töltse ki az űrlapot vagy keressen minket az alábbi
            elérhetőségeken
          </p>
          <div className="contact__icons">
            <span>
              <FaPhoneAlt />
              <p>+3630 1111 222</p>
            </span>
            <span>
              <FaEnvelope />
              <p>support@hepukadev.com</p>
            </span>
            <span>
              <GoLocation />
              <p>Debrecen, HUNGARY</p>
            </span>
            <span>
              <FaTwitter />
              <p>@hepuka</p>
            </span>
          </div>
        </div>
        <div className="contact__card contact__form">
          <form ref={form} onSubmit={sendEmail}>
            <label>Név</label>
            <input type="text" name="user_name" required />
            <label>Email</label>
            <input type="email" name="user_email" required />
            <label>Tárgy</label>
            <input type="text" name="subject" required />
            <label>Üzenet</label>
            <textarea name="message" cols="30" rows="10"></textarea>
            <button type="submit" className="login__signInButton">
              Küldés
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
