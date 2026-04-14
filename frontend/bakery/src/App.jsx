import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";

import HomePage from "./pages/HomePage";
import BakeryPage from "./pages/BakeryPage";
import CustomizePage from "./pages/CustomizePage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";

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
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AnnouncementBar />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bakery/:id" element={<BakeryPage />} />
          <Route path="/bakery" element={<BakeryPage />} />
          <Route path="/customize" element={<CustomizePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
        <Footer />
        <Toast />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
