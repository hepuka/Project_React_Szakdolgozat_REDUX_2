import "./Modal.scss";
import { selectUserPin } from "../Redux/slice/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { SET_TABLES } from "../Redux/slice/tableSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Modals = ({ number, setModalIsOpen }) => {
  const userPin = useSelector(selectUserPin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [modalInput, setModalInput] = useState(0);

  useEffect(() => {
    if (modalInput === userPin) {
      dispatch(
        SET_TABLES({
          id: number,
          status: false,
        })
      );
    }
  }, [dispatch, modalInput, number, userPin]);

  const handleClick = () => {
    if (modalInput === userPin) {
      navigate(`/placeorder/${number}`);
      setModalIsOpen(false);
    }
  };
  return (
    <div className="modal">
      <h2>Add meg a személyes PIN kódot!</h2>
      <div>
        <input
          type="text"
          placeholder="Add meg a PIN kódot"
          onChange={(e) => setModalInput(e.target.value)}
        />
      </div>
      <div>
        <button id="signin" onClick={() => handleClick(number)}>
          Tovább
        </button>
        <button id="cancel" onClick={() => setModalIsOpen(false)}>
          Mégse
        </button>
      </div>
    </div>
  );
};

export default Modals;
