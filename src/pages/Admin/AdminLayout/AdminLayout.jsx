import {
    ChevronRight,
    FileText,
    HelpCircle,
    Image,
    LayoutDashboard,
    LogOut, Menu,
    MessageSquare,
    Package,
    Settings,
    Users,
    X
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/sj-manage/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { path: '/sj-manage/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/sj-manage/products', icon: Package, label: 'Products' },
    { path: '/sj-manage/categories', icon: Package, label: 'Categories Tracker' },
    { path: '/sj-manage/carousel', icon: Image, label: 'Carousel Manager' },
    { path: '/sj-manage/about', icon: FileText, label: 'About Page' },
    { path: '/sj-manage/contact', icon: MessageSquare, label: 'Contact Page' },
    { path: '/sj-manage/faqs', icon: HelpCircle, label: 'FAQs' },
    { path: '/sj-manage/settings', icon: Settings, label: 'Settings' },
    { path: '/sj-manage/admins', icon: Users, label: 'Manage Admins' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h2>SH Admin</h2>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              <ChevronRight size={16} className="nav-arrow" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <span className="user-name">Admin</span>
              <span className="user-email">{user?.email || 'admin'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="topbar-right">
            <a href="/" target="_blank" rel="noopener noreferrer" className="view-site-btn">
              View Site ↗
            </a>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
