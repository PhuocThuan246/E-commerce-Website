import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components chung
import Header from "./components/Header";
import Footer from "./components/Footer";

// Trang khách hàng
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import SuccessPage from "./pages/SuccessPage";
import OrdersPage from "./pages/OrdersPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound"; // thêm dòng này
// Trang quản trị
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminCategories from "./admin/pages/AdminCategories";
import AdminOrders from "./admin/pages/AdminOrders";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminUsers from "./admin/pages/AdminUsers";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Phần khách hàng --- */}
        <Route
          path="/*"
          element={
            <>
              <Header />
              <main style={{ minHeight: "80vh", paddingBottom: 40 }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/success" element={<SuccessPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />

        {/* --- Phần quản trị (Admin) --- */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roleRequired="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="*" element={<NotFound />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
