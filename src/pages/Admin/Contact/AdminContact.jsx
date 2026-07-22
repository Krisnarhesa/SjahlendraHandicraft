import { AlertCircle, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import './AdminContact.css';

const AdminContact = () => {
  const [settings, setSettings] = useState({
    address: '',
    phone: '',
    email: '',
    whatsapp_number: '',
    workshop_hours_weekday: '',
    workshop_hours_weekend: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;

      const settingsMap = {};
      (data || []).forEach(s => { settingsMap[s.key] = s.value; });
      setSettings(prev => ({ ...prev, ...settingsMap }));
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key, value }, { onConflict: 'key' });
        if (error) throw error;
      }
      setMessage({ type: 'success', text: 'Contact settings saved!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="loading-state">Loading contact settings...</div>;

  return (
    <div className="admin-contact">
      <div className="page-header">
        <div>
          <h1>Contact Page</h1>
          <p>Edit the contact information displayed on your website</p>
        </div>
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? <><span className="spinner"></span>Saving...</> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          <AlertCircle size={16} />
          <span>{message.text}</span>
        </div>
      )}

      <div className="settings-grid">
        <div className="content-section">
          <h2>Location & Address</h2>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows="2"
              placeholder="Your business address"
            />
          </div>
        </div>

        <div className="content-section">
          <h2>Contact Details</h2>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+62 813-1666-3377"
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="info@sjahlendra.com"
            />
          </div>
          <div className="form-group">
            <label>WhatsApp Number (for product inquiries)</label>
            <input
              type="text"
              value={settings.whatsapp_number}
              onChange={(e) => handleChange('whatsapp_number', e.target.value)}
              placeholder="+6281316663377"
            />
            <small className="help-text">Format: country code + number without spaces (e.g. +6281316663377)</small>
          </div>
        </div>

        <div className="content-section">
          <h2>Workshop Hours</h2>
          <div className="form-group">
            <label>Weekday Hours</label>
            <input
              type="text"
              value={settings.workshop_hours_weekday}
              onChange={(e) => handleChange('workshop_hours_weekday', e.target.value)}
              placeholder="Mon - Fri: 9am - 5pm"
            />
          </div>
          <div className="form-group">
            <label>Weekend Hours</label>
            <input
              type="text"
              value={settings.workshop_hours_weekend}
              onChange={(e) => handleChange('workshop_hours_weekend', e.target.value)}
              placeholder="Saturday: 9am - 5pm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContact;
