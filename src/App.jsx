import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Footer from "./components/layout/Footer/Footer";
import Navbar from "./components/layout/Navbar/Navbar";
import ScrollToTop from "./components/layout/ScrollToTop";
import { CartProvider } from "./context/CartContext";
import { SettingsProvider } from "./context/SettingsContext";
import About from "./pages/About/About";
import Cart from "./pages/Cart/Cart";
import Contact from "./pages/Contact/Contact";
import FAQs from "./pages/FAQs/FAQs";
import Home from "./pages/Home/Home";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Shop from "./pages/Shop/Shop";

// Admin imports
import ProtectedRoute from "./components/common/ProtectedRoute/ProtectedRoute";
import AdminAbout from "./pages/Admin/About/AdminAbout";
import AdminLayout from "./pages/Admin/AdminLayout/AdminLayout";
import AdminLogin from "./pages/Admin/AdminLogin/AdminLogin";
import AdminCarousel from "./pages/Admin/Carousel/AdminCarousel";
import AdminCategories from "./pages/Admin/Categories/AdminCategories";
import AdminContact from "./pages/Admin/Contact/AdminContact";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import AdminFAQs from "./pages/Admin/FAQs/AdminFAQs";
import AdminProducts from "./pages/Admin/Products/AdminProducts";
import ProductForm from "./pages/Admin/Products/ProductForm";
import AdminSettings from "./pages/Admin/Settings/AdminSettings";
import AdminAdmins from "./pages/Admin/Admins/AdminAdmins";
import AdminForgotPassword from "./pages/Admin/AdminLogin/AdminForgotPassword";
import AdminResetPassword from "./pages/Admin/AdminLogin/AdminResetPassword";

import NotFound from "./pages/NotFound/NotFound";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <SettingsProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />
            <Route
              path="/products"
              element={
                <PublicLayout>
                  <Shop />
                </PublicLayout>
              }
            />
            <Route
              path="/product/:name"
              element={
                <PublicLayout>
                  <ProductDetail />
                </PublicLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <PublicLayout>
                  <Cart />
                </PublicLayout>
              }
            />
            <Route
              path="/about"
              element={
                <PublicLayout>
                  <About />
                </PublicLayout>
              }
            />
            <Route
              path="/faqs"
              element={
                <PublicLayout>
                  <FAQs />
                </PublicLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicLayout>
                  <Contact />
                </PublicLayout>
              }
            />

            {/* Admin Login (no layout) */}
            <Route path="/sj-manage/login" element={<AdminLogin />} />
            <Route path="/sj-manage/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/sj-manage/reset-password" element={<AdminResetPassword />} />

            {/* Admin Protected Routes */}
            <Route
              path="/sj-manage"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="carousel" element={<AdminCarousel />} />
              <Route path="about" element={<AdminAbout />} />
              <Route path="contact" element={<AdminContact />} />
              <Route path="faqs" element={<AdminFAQs />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="admins" element={<AdminAdmins />} />
            </Route>

            {/* Catch-all */}
            <Route
              path="*"
              element={
                <PublicLayout>
                  <NotFound />
                </PublicLayout>
              }
            />
          </Routes>
          <Analytics />
          <SpeedInsights />
        </CartProvider>
      </SettingsProvider>
    </Router>
  );
}

// Public layout wrapper with Navbar and Footer
function PublicLayout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default App;
