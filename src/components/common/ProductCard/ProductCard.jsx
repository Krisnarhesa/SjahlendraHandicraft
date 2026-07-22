import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useSettings } from '../../../context/SettingsContext';
import { createSlug } from '../../../utils/slugHelper';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { isInCart, addToCart, removeFromCart } = useCart();
    const { settings } = useSettings();
    const inCart = isInCart(product.id);
    const hidePrice = settings?.hide_price === 'true' || settings?.hide_price === true;
    const hideStock = settings?.hide_stock === 'true' || settings?.hide_stock === true;

    const handleCartToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (inCart) {
            removeFromCart(product.id);
        } else {
            addToCart(product);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStockInfo = () => {
        if (product.stock === null || product.stock === undefined) return null;
        if (product.stock === 0) return { label: 'Sold Out', className: 'stock-out' };
        if (product.stock <= 5) return { label: `Only ${product.stock} left`, className: 'stock-low' };
        return { label: `${product.stock} in stock`, className: 'stock-ok' };
    };

    const stockInfo = getStockInfo();
    const imageUrl = product.image_url ? product.image_url.split(',')[0] : (product.image || 'https://placehold.co/400x400/f0f0f0/999?text=No+Image');

    return (
        <div className="product-card">
            <Link to={`/product/${createSlug(product.name)}`} className="product-image-container">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                />
                {/* Wishlist Button */}
                <button
                    className={`cart-btn ${inCart ? 'active' : ''}`}
                    onClick={handleCartToggle}
                    aria-label={inCart ? "Remove from cart" : "Add to cart"}
                >
                    <ShoppingCart size={16} fill={inCart ? "currentColor" : "none"} />
                </button>

                {/* Best Seller Badge */}
                {product.is_best_seller && (
                    <span className="best-seller-badge">★ Best Seller</span>
                )}

                {/* Stock Badge */}
                {!hideStock && stockInfo && stockInfo.className === 'stock-out' && (
                    <div className="sold-out-overlay">
                        <span>Sold Out</span>
                    </div>
                )}
            </Link>

            <div className="product-info">
                <span className="product-category">{product.sub_category || product.main_category || ''}</span>
                <Link to={`/product/${createSlug(product.name)}`} className="product-title-link">
                    <h3 className="product-title">{product.name}</h3>
                </Link>
                <div className="product-bottom">
                    {!hidePrice && product.price !== null && product.price !== undefined && (
                        <span className="product-price">{formatPrice(product.price)}</span>
                    )}
                    {!hideStock && stockInfo && stockInfo.className !== 'stock-out' && (
                        <span className={`stock-badge ${stockInfo.className}`}>
                            {stockInfo.label}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
