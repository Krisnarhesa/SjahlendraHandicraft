import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import './CategorySidebar.css';

const CategorySidebar = ({ activeCategory, onSelectCategory }) => {
    const [categoryStructure, setCategoryStructure] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        buildCategoryTree();
    }, []);

    const buildCategoryTree = async () => {
        try {
            // Fetch all products to build the category hierarchy
            const { data: products, error } = await supabase
                .from('products')
                .select('main_category, sub_category');

            if (error) throw error;

            // Build hierarchy from products
            const tree = {};
            (products || []).forEach(p => {
                const main = p.main_category?.trim();
                if (!main) return;

                if (!tree[main]) {
                    tree[main] = new Set();
                }
                if (p.sub_category) {
                    tree[main].add(p.sub_category.trim());
                }
            });

            // Convert to array sorted alphabetically
            const structure = Object.keys(tree)
                .sort()
                .map(name => ({
                    name,
                    sub: Array.from(tree[name]).sort()
                }));

            setCategoryStructure(structure);

            // Auto-expand all categories by default
            const expandAll = {};
            structure.forEach(cat => { expandAll[cat.name] = true; });
            setExpanded(expandAll);
        } catch (err) {
            console.error('Error building category tree:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (name) => {
        setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
    };

    return (
        <div className="category-sidebar-component">
            <h3 className="category-sidebar-title">CATEGORIES</h3>
            {loading ? (
                <div style={{ padding: '10px 0', color: '#999', fontSize: '0.9rem' }}>Loading...</div>
            ) : (
                <ul className="category-root-list">
                    {categoryStructure.map((mainCat) => {
                        const hasSub = mainCat.sub && mainCat.sub.length > 0;
                        const isExpanded = expanded[mainCat.name];
                        const isActiveMain = activeCategory === mainCat.name;

                        return (
                            <li key={mainCat.name} className="category-root-item">
                                <div className="category-root-header">
                                    <button
                                        className={`category-main-btn ${isActiveMain ? 'active' : ''}`}
                                        onClick={() => onSelectCategory(mainCat.name)}
                                    >
                                        {mainCat.name}
                                    </button>
                                    {hasSub && (
                                        <button
                                            className="toggle-icon-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpand(mainCat.name);
                                            }}
                                        >
                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                    )}
                                </div>

                                {hasSub && isExpanded && (
                                    <ul className="category-sub-list">
                                        {mainCat.sub.map(subCat => (
                                            <li key={subCat} className="category-sub-item">
                                                <button
                                                    className={`category-sub-btn ${activeCategory === subCat ? 'active' : ''}`}
                                                    onClick={() => onSelectCategory(subCat)}
                                                >
                                                    {subCat}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default CategorySidebar;
