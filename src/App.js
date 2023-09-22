import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Reset from "./pages/auth/Reset";
import Admin from "./pages/admin/Admin";
import Users from "./pages/admin/Users";
import Register from "./pages/auth/Register";
import { REMOVE_ACTIVE_USER, SET_ACTIVE_USER } from "./Redux/slice/authSlice";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { auth } from "./firebase/config";
import Contact from "./pages/admin/Contact";
import Products from "./pages/admin/Products";
import AddProducts from "./pages/admin/AddProducts";
import Orders from "./pages/admin/Orders";
import OrderDetails from "./pages/admin/OrderDetails";
import Business from "./pages/admin/Business";
import Placeorder from "./pages/employees/Placeorder";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const parts = user.displayName.split("|");

        dispatch(
          SET_ACTIVE_USER({
            email: user.email,
            userName: parts[0],
            userRole: parts[1],
            userPin: parts[2],
          })
        );
      } else {
        dispatch(REMOVE_ACTIVE_USER());
      }
    });
  }, [dispatch]);
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/main" element={<Admin />}></Route>
          <Route path="/" element={<Login />}></Route>
          <Route path="/reset" element={<Reset />}></Route>
          <Route path="/register/:id" element={<Register />}></Route>
          <Route path="/add-product/:id" element={<AddProducts />}></Route>
          <Route path="/order-details/:id" element={<OrderDetails />}></Route>
          <Route path="/placeorder/:id" element={<Placeorder />}></Route>
          <Route path="/users" element={<Users />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/products" element={<Products />}></Route>
          <Route path="/orders" element={<Orders />}></Route>
          <Route path="/business" element={<Business />}></Route>
          <Route path="/tables" element={<Placeorder />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
