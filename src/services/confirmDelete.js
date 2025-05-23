import Notiflix from "notiflix";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

const deleteUser = async (id) => {
  try {
    await deleteDoc(doc(db, "users", id));
    Notiflix.Notify.success("Sikeres felhasználótörlés!");
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
};

export const confirmDelete = (id) => {
  Notiflix.Confirm.show(
    "Felhasználó törlése!",
    "Valóban törölni akarja a felhasználót?",
    "Törlés",
    "Mégse",

    function okCb() {
      deleteUser(id);
    },

    function cancelCb() {
      console.log("Törlés elutasítva!");
    },
    {
      width: "320px",
      borderRadius: "8px",
      titleColor: "red",
      okButtonBackground: "red",
      cssAnimationStyle: "zoom",
    }
  );
};
