import { FileText, HelpCircle, Package, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import './AdminDashboard.css';


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalFaqs: 0,
    totalCategories: 0,
    bestSellers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, faqsRes] = await Promise.all([
        supabase.from('products').select('id, main_category, is_best_seller'),
        supabase.from('faqs').select('id', { count: 'exact' }),
      ]);

      const products = productsRes.data || [];
      const categories = new Set(products.map(p => p.main_category));

      setStats({
        totalProducts: products.length,
        totalFaqs: faqsRes.count || 0,
        totalCategories: categories.size,
        bestSellers: products.filter(p => p.is_best_seller).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Categories', value: stats.totalCategories, icon: TrendingUp, color: '#059669', bg: '#ecfdf5' },
    { label: 'Best Sellers', value: stats.bestSellers, icon: TrendingUp, color: '#d97706', bg: '#fffbeb' },
    { label: 'Total FAQs', value: stats.totalFaqs, icon: HelpCircle, color: '#7c3aed', bg: '#f5f3ff' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's an overview of your store.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{loading ? '...' : card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/sj-manage/products" className="action-card">
            <Package size={24} />
            <span>Manage Products</span>
            <p>Add, edit, or remove products</p>
          </Link>
          <Link to="/sj-manage/about" className="action-card">
            <FileText size={24} />
            <span>Edit About Page</span>
            <p>Update your story & team</p>
          </Link>
          <Link to="/sj-manage/faqs" className="action-card">
            <HelpCircle size={24} />
            <span>Manage FAQs</span>
            <p>Add or edit FAQ items</p>
          </Link>
          <Link to="/sj-manage/settings" className="action-card">
            <TrendingUp size={24} />
            <span>Site Settings</span>
            <p>WhatsApp, email & more</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
