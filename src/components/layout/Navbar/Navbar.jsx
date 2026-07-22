import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

import { useCart } from "../../../context/CartContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { cart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate("/products", { state: { search: searchQuery } });
      setIsSearchOpen(false);
      setSearchQuery("");
      setIsOpen(false);
    } else {
      // If empty and open, close it (toggle behavior)
      setIsSearchOpen(!isSearchOpen);
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <img
            src="/logo.svg"
            alt="Sjahlendra Logo"
            className="logo-img"
            width="38"
            height="38"
          />
          <img
            src="/logo-text.png"
            alt="Sjahlendra Handicraft"
            className="logo-text-img"
            width="120"
            height="34"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="nav-links desktop-link">
          <Link to="/">Home</Link>
          <Link to="/products">Shop</Link>
          <Link to="/about">About Us</Link>
          <Link to="/faqs">FAQs</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {/* Icons */}
        <div className="nav-icons">
          <div className={`search-container ${isSearchOpen ? "open" : ""}`}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={() =>
                isSearchOpen ? handleSearch() : setIsSearchOpen(true)
              }
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
          <Link to="/cart" className="nav-icon-link" aria-label="Cart">
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="cart-badge">{cart.length}</span>
            )}
          </Link>
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/products" onClick={() => setIsOpen(false)}>
            Shop
          </Link>
          <Link to="/about" onClick={() => setIsOpen(false)}>
            About Us
          </Link>
          <Link to="/faqs" onClick={() => setIsOpen(false)}>
            FAQs
          </Link>
          <Link to="/contact" onClick={() => setIsOpen(false)}>
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
