import { AlertCircle, UserPlus, Users, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabaseClient';
import './AdminAdmins.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a separate Supabase client instance that doesn't persist the session
// This ensures that when we create a new admin, it doesn't log the current admin out.
const authSupabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

const AdminAdmins = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoadingList(true);
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        // If the table doesn't exist, we don't crash, just log it. 
        // The user must create the table as instructed.
        console.warn('Could not fetch admin_users. Make sure the table exists.', error);
      } else {
        setAdminUsers(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      setLoading(false);
      return;
    }

    try {
      // Create user in Supabase Auth
      const { data, error } = await authSupabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Record in our public admin_users table
      const { error: dbError } = await supabase.from('admin_users').insert([
        { email: email }
      ]);
      
      if (dbError) {
        console.warn('Admin user created in auth, but failed to insert into admin_users table.', dbError);
      }

      setMessage({ 
        type: 'success', 
        text: `Admin created successfully for ${email}. They can now login.` 
      });
      setEmail('');
      setPassword('');
      fetchAdmins(); // Refresh the list
    } catch (err) {
      console.error('Add Admin Error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to create admin account.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdminRecord = async (id) => {
    if (!window.confirm("Are you sure? This only removes them from the list, not from Supabase Auth.")) return;
    try {
      const { error } = await supabase.from('admin_users').delete().eq('id', id);
      if (error) throw error;
      setAdminUsers(adminUsers.filter(u => u.id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete record.");
    }
  };

  return (
    <div className="admin-admins">
      <div className="page-header">
        <div>
          <h1>Manage Admins</h1>
          <p>Create new admin accounts and view registered admins</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          <AlertCircle size={16} />
          <span>{message.text}</span>
        </div>
      )}

      <div className="admins-grid">
        <div className="admin-form-card">
          <h3><UserPlus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Add New Admin</h3>
          <p className="help-text" style={{marginBottom: '16px', fontSize: '0.85rem', color: '#666'}}>
            Ensure <strong>Confirm email</strong> is disabled in your Supabase Dashboard &gt; Authentication &gt; Providers &gt; Email.
          </p>
          <form onSubmit={handleAddAdmin} className="admin-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sjahlendra.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength="6"
              />
            </div>
            <button type="submit" className="add-btn" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        </div>

        <div className="admin-list-card">
          <h3><Users size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Registered Admins</h3>
          
          {loadingList ? (
             <div className="loading-state">Loading admins list...</div>
          ) : adminUsers.length === 0 ? (
            <div className="empty-state-mini">
              No admins found in the table. 
              (Make sure you have created the <code>admin_users</code> table in Supabase)
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Email Address</th>
                    <th>Added On</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td style={{ width: '50px' }}>{index + 1}</td>
                      <td>
                        <strong>{user.email}</strong>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="delete-btn-sm" 
                          onClick={() => handleDeleteAdminRecord(user.id)} 
                          title="Remove from this list"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAdmins;
