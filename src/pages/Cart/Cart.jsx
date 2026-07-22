import {
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingCart as ShoppingCartIcon,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useSettings } from "../../context/SettingsContext";
import { createSlug } from "../../utils/slugHelper";
import "./Cart.css";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { settings } = useSettings();

  const generateCheckoutMessage = () => {
    let message =
      "Hello Sjahlendra Handicraft! I would like to order the following items:\n\n";
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      if (item.code) message += `   Code: ${item.code}\n`;
      message += `   Qty: ${item.quantity || 1}\n\n`;
    });
    message +=
      "Please let me know the availability and shipping costs. Thank you!";
    return message;
  };

  const handleWhatsAppCheckout = () => {
    const whatsappNumber = settings?.whatsapp_number || "";
    if (!whatsappNumber) {
      alert("WhatsApp contact is not configured.");
      return;
    }

    let cleanNumber = whatsappNumber.replace(/[^\d+]/g, "");
    if (cleanNumber.startsWith("0")) {
      cleanNumber = "62" + cleanNumber.substring(1);
    } else if (cleanNumber.startsWith("+")) {
      cleanNumber = cleanNumber.substring(1);
    }

    const message = encodeURIComponent(generateCheckoutMessage());
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page-empty container">
        <div className="empty-cart-card">
          <div className="empty-cart-icon">
            <ShoppingCartIcon size={80} strokeWidth={1} />
          </div>
          <h2 className="empty-cart-title">Your cart is empty</h2>
          <p className="empty-cart-text">
            Explore our unique handcrafted collection and find something special
            for your home.
          </p>
          <Link to="/products" className="btn btn-primary start-shopping-btn">
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <header className="cart-header">
        <span className="cart-subtitle">Your Selection</span>
        <h1 className="cart-title">Shopping Cart</h1>
        <div className="cart-count-info">
          {cart.length} {cart.length === 1 ? "unique piece" : "unique pieces"}{" "}
          in your selection
        </div>
      </header>

      <div className="cart-content">
        <div className="cart-items-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-card">
              <div className="cart-item-image">
                <img
                  src={
                    (item.image_url && item.image_url.split(',')[0]) ||
                    "https://placehold.co/100x100/f0f0f0/999?text=No+Image"
                  }
                  alt={item.name}
                />
              </div>
              <div className="cart-item-details">
                <div className="cart-item-main">
                  <Link
                    to={`/product/${createSlug(item.name)}`}
                    className="cart-item-name"
                  >
                    {item.name}
                  </Link>
                  {item.code && (
                    <span className="cart-item-code">
                      Product Code: {item.code}
                    </span>
                  )}
                </div>

                <div className="cart-item-controls">
                  <div className="cart-item-quantity">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, (item.quantity || 1) - 1)
                      }
                      className="qty-btn"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity || 1}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, (item.quantity || 1) + 1)
                      }
                      className="qty-btn"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="remove-item-btn"
                    title="Remove selection"
                  >
                    <Trash2 size={18} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="cart-footer-actions">
            <Link to="/products" className="continue-shopping">
              <Plus size={18} />
              <span>Add More Items</span>
            </Link>
            <button onClick={clearCart} className="clear-cart-btn">
              Clear All Selection
            </button>
          </div>
        </div>

        <div className="cart-inquiry-sidebar">
          <div className="inquiry-card">
            <h3 className="inquiry-title">Inquiry Summary</h3>
            <p className="inquiry-description">
              Since our products are handcrafted and unique, please proceed to
              checkout to check current availability and shipping costs for your
              location.
            </p>

            <div className="checkout-methods">
              <button
                onClick={handleWhatsAppCheckout}
                className="btn-checkout wa-method"
              >
                <MessageCircle size={20} />
                <span>Inquire via WhatsApp</span>
              </button>
            </div>

            <div className="inquiry-footer">
              <Package size={16} />
              <span>Safe worldwide shipping available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
