import { Filter, FilterX, Grid, List, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from '../../components/common/Breadcrumbs/Breadcrumbs';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import ProductListItem from '../../components/common/ProductListItem/ProductListItem';
import CategorySidebar from '../../components/sections/CategorySidebar/CategorySidebar';
import { supabase } from '../../lib/supabaseClient';
import './Shop.css';

const Shop = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [priceRange, setPriceRange] = useState(3000000); // Max default
    const [activeCategory, setActiveCategory] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

    // Fetch products
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('products').select('*');
            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initialize state from location
    useEffect(() => {
        if (location.state?.category) {
            setActiveCategory(location.state.category);
            setSearchQuery(""); // Clear search if category selected
        }
        if (location.state?.search) {
            setSearchQuery(location.state.search);
            setActiveCategory("All"); // Reset category if searching
        }
    }, [location.state]);

    // Filter Logic
    const filteredProducts = useMemo(() => {
        let result = products.filter(p => !p.is_hidden);

        if (activeCategory !== "All") {
            // Check if activeCategory matches main_category OR sub_category
            result = result.filter(p =>
                p.main_category?.trim() === activeCategory ||
                p.sub_category?.trim() === activeCategory
            );
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        // Sorting
        if (sortBy === "best-seller") {
            // Sort by is_best_seller status first, then by newest
            result.sort((a, b) => {
                if (a.is_best_seller === b.is_best_seller) {
                    return b.id - a.id;
                }
                return a.is_best_seller ? -1 : 1;
            });
        } else {
            // Default to newest arrivals
            result.sort((a, b) => b.id - a.id);
        }

        return result;
    }, [products, activeCategory, sortBy, searchQuery]);

    // Best Sellers Logic (Only show if not searching and has active category or All)
    const bestSellers = useMemo(() => {
        if (searchQuery || viewMode === 'list') return [];
        let result = products.filter(p => p.is_best_seller && !p.is_hidden);

        if (activeCategory !== "All") {
            result = result.filter(p =>
                p.main_category?.trim() === activeCategory ||
                p.sub_category?.trim() === activeCategory
            );
        }
        return result;
    }, [products, activeCategory, searchQuery, viewMode]);

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Reset page to 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, sortBy, searchQuery]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
    const currentProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return <div className="container" style={{ padding: '100px 50px', textAlign: 'center' }}>Loading products...</div>;
    }

    return (
        <div className="shop-page container">
            <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Shop', path: '/products' }]} />

            <div className="shop-header">
                <h1 className="page-title">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop Our Collection'}
                </h1>
                <button
                    className="mobile-filter-toggle btn btn-outline"
                    onClick={() => setIsMobileFilterOpen(true)}
                >
                    <Filter size={18} /> Filters
                </button>
            </div>

            <div className="shop-layout">
                {/* Sidebar */}
                <aside className={`shop-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
                    <div className="sidebar-header mobile-only">
                        <h3>Filters</h3>
                        <button onClick={() => setIsMobileFilterOpen(false)} aria-label="Close filters">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="filter-group">
                        <CategorySidebar
                            activeCategory={activeCategory}
                            onSelectCategory={(cat) => {
                                setActiveCategory(cat);
                                setSearchQuery(""); // Clear search when picking category manually
                                setIsMobileFilterOpen(false);
                            }}
                        />
                    </div>

                </aside>

                {/* Main Content */}
                <main className="shop-main">
                    {/* Best Sellers Section */}
                    {bestSellers.length > 0 && (
                        <section className="best-sellers-section">
                            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
                                Best Sellers
                            </h2>
                            <div className="products-grid" style={{ marginBottom: '40px' }}>
                                {bestSellers.map(product => (
                                    <ProductCard key={product.id} product={product} hidePrice={true} />
                                ))}
                            </div>
                            <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />
                        </section>
                    )}

                    <div className="shop-controls">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <p className="product-count" style={{ margin: 0 }}>{filteredProducts.length} items</p>
                            {(searchQuery || activeCategory !== "All") && (
                                <button 
                                    className="clear-filter-link"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setActiveCategory("All");
                                    }}
                                    title="Clear all filters"
                                    aria-label="Clear all filters"
                                >
                                    <FilterX size={20} />
                                </button>
                            )}
                        </div>

                        <div className="controls-right" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <select
                                className="sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">New Arrivals</option>
                                <option value="best-seller">Best Sellers</option>
                            </select>

                            <div className="view-toggle">
                                <span style={{ marginRight: '10px', color: '#666', fontSize: '0.9rem' }}>View</span>
                                <button
                                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    aria-label="Grid View"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: viewMode === 'grid' ? 'var(--color-accent)' : '#ccc', padding: '5px' }}
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    aria-label="List View"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: viewMode === 'list' ? 'var(--color-accent)' : '#ccc', padding: '5px' }}
                                >
                                    <List size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={viewMode === 'grid' ? "products-grid" : "products-list"}>
                        {currentProducts.length > 0 ? (
                            currentProducts.map(product => (
                                viewMode === 'grid' ? (
                                    <ProductCard key={product.id} product={product} hidePrice={true} />
                                ) : (
                                    <ProductListItem key={product.id} product={product} />
                                )
                            ))
                        ) : (
                            <p className="no-products">No products found matching your criteria.</p>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            {/* Page Numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* Next Page Button */}
                            <button
                                className="pagination-btn next-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next Page &gt;
                            </button>
                        </div>
                    )}
                </main>

                {/* Mobile Filter Overlay */}
                {isMobileFilterOpen && (
                    <div
                        className="mobile-filter-overlay"
                        onClick={() => setIsMobileFilterOpen(false)}
                    ></div>
                )}
            </div>
        </div>
    );
};

export default Shop;
