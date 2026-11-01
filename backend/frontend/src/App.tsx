import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AuthProvider from "./auth/AuthProvider";
import ShopProvider from "./shop/ShopProvider";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import RequireRole from "./components/RequireRole";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AccountPage from "./pages/AccountPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminAuditPage from "./pages/admin/AdminAuditPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="confirm-email" element={<ConfirmEmailPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />

            {/* Лише для увійдених: оформлення замовлення й кабінет */}
            <Route element={<RequireAuth />}>
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order/success" element={<OrderSuccessPage />} />
              <Route path="account" element={<AccountPage />} />

              {/* Адмін-панель: менеджер і адміністратор; користувачі й журнал — лише адміністратор */}
              <Route element={<RequireRole roles={["manager", "admin"]} />}>
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="products" replace />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route element={<RequireRole roles={["admin"]} />}>
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="audit" element={<AdminAuditPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
