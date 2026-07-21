import { AlertCircle, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import './AdminLogin.css'; // Reusing the same CSS

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Need to define the redirectTo URL based on the current environment
      const redirectTo = `${window.location.origin}/sj-manage/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        throw error;
      }

      setSuccess('Reset password link sent! Please check your email inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-branding">
          <div className="login-logo">
            <Mail size={32} />
          </div>
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="login-success" style={{
            display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5',
            border: '1px solid #a7f3d0', color: '#059669', padding: '12px 16px',
            borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px'
          }}>
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sjahlendra.com"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Sending Link...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="login-footer" style={{ marginTop: '20px' }}>
          <button 
            type="button" 
            onClick={() => navigate('/sj-manage/login')}
            style={{
              background: 'none', border: 'none', color: '#1E9A8B', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', gap: '4px', width: '100%', 
              fontSize: '0.9rem', fontWeight: '500'
            }}
          >
            <ArrowLeft size={16} /> Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
