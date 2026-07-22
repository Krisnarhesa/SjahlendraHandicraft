import { FileText, HelpCircle, Package, TrendingUp, Users, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '../../../lib/supabaseClient';
import './AdminDashboard.css';

const visitorData = [
  { name: 'Mon', visitors: 120, pageviews: 240 },
  { name: 'Tue', visitors: 150, pageviews: 280 },
  { name: 'Wed', visitors: 180, pageviews: 310 },
  { name: 'Thu', visitors: 110, pageviews: 220 },
  { name: 'Fri', visitors: 200, pageviews: 400 },
  { name: 'Sat', visitors: 250, pageviews: 480 },
const visitorData = [
  { name: 'Mon', visitors: 120, pageviews: 240 },
  { name: 'Tue', visitors: 150, pageviews: 280 },
  { name: 'Wed', visitors: 180, pageviews: 310 },
  { name: 'Thu', visitors: 110, pageviews: 220 },
  { name: 'Fri', visitors: 200, pageviews: 400 },
  { name: 'Sat', visitors: 250, pageviews: 480 },
  { name: 'Sun', visitors: 210, pageviews: 390 },
];

const countryData = [
  { name: 'Indonesia', visitors: 450 },
  { name: 'United States', visitors: 120 },
  { name: 'Australia', visitors: 85 },
  { name: 'Singapore', visitors: 60 },
  { name: 'Malaysia', visitors: 40 },
];

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

      <div className="analytics-section">
        <div className="analytics-header">
          <h2>Traffic Overview</h2>
          <select className="date-range-select">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
        <div className="analytics-grid">
          <div className="chart-container">
            <h3 className="chart-title">Visitors & Page Views</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={visitorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#525633" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#525633" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C58970" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#C58970" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="pageviews" stroke="#C58970" fillOpacity={1} fill="url(#colorPageviews)" name="Page Views" />
                <Area type="monotone" dataKey="visitors" stroke="#525633" fillOpacity={1} fill="url(#colorVisitors)" name="Unique Visitors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container country-chart">
            <h3 className="chart-title"><MapPin size={16} /> Top Countries</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 500 }} width={90} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="visitors" fill="#525633" radius={[0, 4, 4, 0]} barSize={24} name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
