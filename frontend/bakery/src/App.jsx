import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import AuthModal from "./components/AuthModal";

import HomePage from "./pages/HomePage";
import BakeryPage from "./pages/BakeryPage";
import CustomizePage from "./pages/CustomizePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import ProductPage from "./pages/ProductPage";
import BakeryRegistrationPage from "./pages/BakeryRegistrationPage";
import AdminPage from "./pages/AdminPage";
import BakeryDashboard from "./pages/BakeryDashboard";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <ScrollToTop />
          <header className="header-fixed">
            <AnnouncementBar />
            <Navbar />
          </header>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/bakery/:id" element={<BakeryPage />} />
              <Route path="/bakery" element={<BakeryPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/customize/:productId" element={<CustomizePage />} />
              <Route path="/customize" element={<CustomizePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={["customer", "bakeryOwner"]}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/register-bakery" element={<BakeryRegistrationPage />} />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/bakery/dashboard" element={
                <ProtectedRoute allowedRoles={["bakeryOwner"]}>
                  <BakeryDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
          <AuthModal />
          <Toast />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
