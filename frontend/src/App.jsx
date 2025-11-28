import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components chung
import Header from "./components/Header";
import Footer from "./components/Footer";

// Trang khách hàng
import HomePage from "./pages/HomePage";
import ProductCatalog from "./pages/ProductCatalog"; 
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import SuccessPage from "./pages/SuccessPage";
import OrdersPage from "./pages/OrdersPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AccountLayout from "./pages/account/AccountLayout";
import ProfilePage from "./pages/account/ProfilePage";
import AddressPage from "./pages/account/AddressPage";
import ChangePasswordPage from "./pages/account/ChangePasswordPage";
import OrderDetailPage from "./pages/OrderDetailPage";

// Trang quản trị
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminCategories from "./admin/pages/AdminCategories";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminDiscounts from "./admin/pages/AdminDiscounts"; 
import SimpleDashboard from "./admin/pages/AdminSimpleDashboard";
import AdvancedDashboard from "./admin/pages/AdminAdvancedDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

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
                  {/* Thêm route cho trang danh mục sản phẩm */}
                  <Route path="/products" element={<ProductCatalog />} />

                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/success" element={<SuccessPage />} />
          
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                  />
                  <Route path="*" element={<NotFound />} />

                  {/* Khu account */}
                  <Route
                    path="/account/*"
                    element={
                      <ProtectedRoute>
                        <AccountLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="addresses" element={<AddressPage />} />
                    <Route
                      path="change-password"
                      element={<ChangePasswordPage />}
                    />
                    <Route path="orders" element={<OrdersPage />} /> 
                    <Route path="orders/:id" element={<OrderDetailPage />} />
                  </Route>
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
          <Route path="discounts" element={<AdminDiscounts />} /> {/* ROUTE MỚI */}
          <Route path="dashboard/simple" element={<SimpleDashboard />} />
          <Route path="dashboard/advanced" element={<AdvancedDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
