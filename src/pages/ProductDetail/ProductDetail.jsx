import {
  CheckCircle,
  MessageCircle,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/common/Breadcrumbs/Breadcrumbs";
import ProductCard from "../../components/common/ProductCard/ProductCard";
import { useCart } from "../../context/CartContext";
import { useSettings } from "../../context/SettingsContext";
import { supabase } from "../../lib/supabaseClient";
import { createSlug } from "../../utils/slugHelper";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // Contact settings is now part of the global context, but we keep this local state for now
  // or we can refactor to use the global settings
  const [localSettings, setLocalSettings] = useState({ whatsapp_number: "" });
  const { isInCart, addToCart, removeFromCart } = useCart();
  const { settings: globalSettings } = useSettings();
  const hidePrice =
    globalSettings?.hide_price === "true" ||
    globalSettings?.hide_price === true;
  const hideStock =
    globalSettings?.hide_stock === "true" ||
    globalSettings?.hide_stock === true;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductAndSettings();
  }, [name]);

  const fetchProductAndSettings = async () => {
    setLoading(true);
    try {
      // Fetch settings for contact buttons
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", ["whatsapp_number"]);

      const settingsMap = {};
      (settingsData || []).forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      setLocalSettings(settingsMap);

      // Fetch product using the slug (converted to search pattern)
      const searchPattern = name.replace(/-/g, "%");
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("is_hidden", false)
        .ilike("name", `%${searchPattern}%`)
        .single();

      if (productError || !productData) {
        setProduct(null);
        return;
      }

      setProduct(productData);

      // Fetch related products
      if (productData.main_category) {
        const { data: relatedData } = await supabase
          .from("products")
          .select("*")
          .eq("main_category", productData.main_category)
          .eq("is_hidden", false)
          .neq("id", productData.id)
          .limit(4);

        setRelatedProducts(relatedData || []);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppBuy = () => {
    if (!localSettings.whatsapp_number) {
      alert("WhatsApp contact is not configured yet.");
      return;
    }

    // Remove any non-numeric characters from whatsapp number for the link, except leading +
    let cleanNumber = localSettings.whatsapp_number.replace(/[^\d+]/g, "");
    if (cleanNumber.startsWith("0")) {
      cleanNumber = "+62" + cleanNumber.substring(1); // Assuming Indonesian format if starts with 0
    }

    const message = `Hello Sjahlendra Handicraft! I'm interested in buying product:\n\n*${product.name}*\n*Product Code: ${product.code || "-"}*\nLink: ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);

    window.open(
      `https://wa.me/${cleanNumber.replace("+", "")}?text=${encodedMessage}`,
      "_blank",
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "100px 50px", textAlign: "center" }}
      >
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container product-not-found">
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate("/products")}
          className="btn btn-primary"
          style={{ marginTop: "20px" }}
        >
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-page container">
      <Breadcrumbs
        items={[
          { label: "Home", path: "/" },
          { label: "Shop", path: "/products" },
          { label: product.name, path: `/product/${createSlug(product.name)}` },
        ]}
      />

      <div className="product-detail-layout">
        {/* Left: Image */}
        <div className="product-detail-image-section">
          <div className="product-detail-image">
            <img
              src={
                product.image_url
                  ? product.image_url.split(",")[activeImageIndex] || "https://placehold.co/800x800/f0f0f0/999?text=No+Image"
                  : "https://placehold.co/800x800/f0f0f0/999?text=No+Image"
              }
              alt={product.name}
            />
          </div>
          {product.image_url && product.image_url.split(",").length > 1 && (
            <div className="image-thumbnails">
              {product.image_url.split(",").map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  className={`thumbnail ${idx === activeImageIndex ? "active" : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="product-detail-info">
          <h1 className="detail-title">{product.name}</h1>

          {!hidePrice &&
            product.price !== null &&
            product.price !== undefined && (
              <div className="detail-price">{formatPrice(product.price)}</div>
            )}

          {/* Purchase Actions */}
          <div className="purchase-actions">
            <button className="buy-wa-btn" onClick={handleWhatsAppBuy}>
              <MessageCircle size={20} />
              Buy via WhatsApp
            </button>
            <button
              className={`cart-detail-btn ${isInCart(product.id) ? "active" : ""}`}
              onClick={() =>
                isInCart(product.id)
                  ? removeFromCart(product.id)
                  : addToCart(product)
              }
            >
              <ShoppingCart
                size={20}
                fill={isInCart(product.id) ? "currentColor" : "none"}
              />
              {isInCart(product.id) ? "In Cart" : "Add to Cart"}
            </button>
          </div>

          {/* Stock Status */}
          {!hideStock && (
            <div
              className={`detail-status ${product.stock === 0 ? "out-of-stock" : ""}`}
            >
              {product.stock === null || product.stock === undefined ? (
                <>
                  <CheckCircle size={16} color="#2e7d32" />
                  <span>Available to Order</span>
                </>
              ) : product.stock > 0 ? (
                <>
                  <CheckCircle size={16} color="#2e7d32" />
                  <span>In Stock ({product.stock} available)</span>
                </>
              ) : (
                <>
                  <XCircle size={16} color="#c62828" />
                  <span>Out of Stock</span>
                </>
              )}
            </div>
          )}

          {/* Description */}
          <div className="detail-description">
            <h3>Description</h3>
            <p>
              {product.description ||
                "No description available for this product."}
            </p>
            <p style={{ marginTop: "10px" }}>
              Handcrafted with care by our skilled artisans in Bali using
              sustainable materials. Each piece is unique and carries the spirit
              of our heritage.
            </p>
          </div>

          <div className="detail-meta">
            <p className="detail-category">
              Category: <span>{product.main_category || "Uncategorized"}</span>
              {product.sub_category && ` / ${product.sub_category}`}
            </p>
            {product.brand && (
              <p className="detail-brand">
                Brand: <span>{product.brand}</span>
              </p>
            )}
            {product.code && (
              <p className="detail-code">
                Product Code: <span>{product.code}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2 className="section-title">Related Products</h2>
          <div className="products-grid">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
