import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Reset from "./pages/auth/Reset";
import Admin from "./pages/admin/Admin";
import Users from "./pages/admin/Users";
import Register from "./pages/auth/Register";
import Contact from "./pages/admin/Contact";
import Products from "./pages/admin/Products";
import AddProducts from "./pages/admin/AddProducts";
import Orders from "./pages/admin/Orders";
import OrderDetails from "./pages/admin/OrderDetails";
import Business from "./pages/admin/Business";
import Placeorder from "./pages/employees/Placeorder";
import ProductOrder from "./pages/admin/ProductOrder";
import Expenses from "./pages/admin/Expenses";

import ProtectedRoute from "./components/ProtectedRoute";
import { PERMISSIONS } from "./config/permissions";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* ===============================================
              NYILVÁNOS ÚTVONALAK
             =============================================== */}

          <Route path="/" element={<Login />} />
          <Route path="/reset" element={<Reset />} />

          {/* ===============================================
              FŐOLDAL
             =============================================== */}

          <Route element={<ProtectedRoute permission={PERMISSIONS.MAIN_READ} />}>
            <Route path="/main" element={<Admin />} />
          </Route>

          {/* ===============================================
              FELHASZNÁLÓK
             =============================================== */}

          <Route
            element={<ProtectedRoute permission={PERMISSIONS.USERS_READ} />}
          >
            <Route path="/users" element={<Users />} />
          </Route>

          <Route
            element={<ProtectedRoute permission={PERMISSIONS.USERS_CREATE} />}
          >
            <Route path="/register/ADD" element={<Register />} />
          </Route>

          <Route
            element={<ProtectedRoute permission={PERMISSIONS.USERS_UPDATE} />}
          >
            <Route path="/register/:id" element={<Register />} />
          </Route>

          {/* ===============================================
              TERMÉKEK
             =============================================== */}

          <Route
            element={<ProtectedRoute permission={PERMISSIONS.PRODUCTS_READ} />}
          >
            <Route path="/products" element={<Products />} />
          </Route>

          <Route
            element={<ProtectedRoute permission={PERMISSIONS.PRODUCTS_CREATE} />}
          >
            <Route path="/add-product/ADD" element={<AddProducts />} />
          </Route>

          <Route
            element={<ProtectedRoute permission={PERMISSIONS.PRODUCTS_UPDATE} />}
          >
            <Route path="/add-product/:id" element={<AddProducts />} />
            <Route path="/product-order/:id" element={<ProductOrder />} />
          </Route>

          {/* ===============================================
              RENDELÉSEK
             =============================================== */}

          <Route
            element={<ProtectedRoute permission={PERMISSIONS.ORDERS_READ} />}
          >
            <Route path="/orders" element={<Orders />} />
            <Route path="/order-details/:id" element={<OrderDetails />} />
          </Route>

          {/* ===============================================
              PÉNZÜGYEK
             =============================================== */}

          <Route
            element={<ProtectedRoute permission={PERMISSIONS.BUSINESS_READ} />}
          >
            <Route path="/business" element={<Business />} />
          </Route>

          <Route
            element={<ProtectedRoute permission={PERMISSIONS.EXPENSES_READ} />}
          >
            <Route path="/expenses" element={<Expenses />} />
          </Route>

          {/* ===============================================
              HIBABEJELENTÉS
             =============================================== */}

          <Route
            element={<ProtectedRoute permission={PERMISSIONS.CONTACT_READ} />}
          >
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* ===============================================
              ASZTALOK / RENDELÉSFELVÉTEL
             =============================================== */}

          <Route
            element={<ProtectedRoute permission={PERMISSIONS.TABLES_USE} />}
          >
            <Route path="/tables" element={<Placeorder />} />
            <Route path="/placeorder/:id" element={<Placeorder />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
