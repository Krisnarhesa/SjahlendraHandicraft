import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useSettings } from '../../../context/SettingsContext';
import { createSlug } from '../../../utils/slugHelper';
import './ProductListItem.css';

const ProductListItem = ({ product }) => {
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

    const getStockLabel = () => {
        if (product.stock === null || product.stock === undefined) return null;
        if (product.stock === 0) return <span className="list-stock out">Sold Out</span>;
        if (product.stock <= 5) return <span className="list-stock low">Only {product.stock} left</span>;
        return <span className="list-stock ok">{product.stock} in stock</span>;
        return <span className="list-stock ok">{product.stock} in stock</span>;
    };

    const imageUrl = product.image_url ? product.image_url.split(',')[0] : (product.image || 'https://placehold.co/300x300/f0f0f0/999?text=No+Image');

    return (
        <div className="product-list-item">
            <Link to={`/product/${createSlug(product.name)}`} className="product-list-image-container">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="product-list-image"
                    loading="lazy"
                />
                {product.is_best_seller && (
                    <span className="list-best-seller">★ Best Seller</span>
                )}
            </Link>
            <div className="product-list-content">
                <span className="list-category">{product.sub_category || product.main_category || ''}</span>
                <Link to={`/product/${createSlug(product.name)}`} className="product-list-title-link">
                    <h3 className="product-list-title">{product.name}</h3>
                </Link>
                <p className="product-list-description">{product.description}</p>
                <div className="product-list-bottom">
                    {!hidePrice && product.price !== null && product.price !== undefined && (
                        <span className="list-price">{formatPrice(product.price)}</span>
                    )}
                    {!hideStock && getStockLabel()}
                </div>
                <div className="product-list-actions">
                    <Link to={`/product/${createSlug(product.name)}`} className="btn btn-primary read-more-btn">View Details</Link>
                    <button
                        className={`action-btn icon-only-btn ${inCart ? 'in-cart' : ''}`}
                        onClick={handleCartToggle}
                        aria-label={inCart ? "Remove from cart" : "Add to cart"}
                        title={inCart ? "Remove from cart" : "Add to cart"}
                    >
                        <ShoppingCart size={20} fill={inCart ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductListItem;
