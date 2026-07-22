import { AlertCircle, ArrowDown, ArrowUp, Edit2, Eye, EyeOff, Image, Plus, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import './AdminCarousel.css';

const AdminCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteId, setDeleteId] = useState(null);
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    link: '/products',
    link_label: 'Shop Now',
    category: '',
    is_active: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setSlides(data || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load carousel slides.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredSlides = slides.filter(s => s.type === activeTab);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 5MB' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 5MB' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `carousel/${fileName}`;
    const { error } = await supabase.storage.from('product').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('product').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const deleteOldImage = async (url) => {
    if (url && url.includes('/storage/v1/object/public/product/')) {
      try {
        const path = url.split('/storage/v1/object/public/product/')[1];
        if (path) await supabase.storage.from('product').remove([path]);
      } catch (e) { console.warn('Failed to delete old image:', e); }
    }
  };

  const resetForm = () => {
    setForm({ title: '', subtitle: '', description: '', link: '/products', link_label: 'Shop Now', category: '', is_active: true });
    setImageFile(null);
    setImagePreview('');
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (slide) => {
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      link: slide.link || '/products',
      link_label: slide.link_label || 'Shop Now',
      category: slide.category || '',
      is_active: slide.is_active !== false,
    });
    setImagePreview(slide.image_url || '');
    setEditId(slide.id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let imageUrl = imagePreview;

      if (imageFile) {
        if (isEditing) {
          const old = slides.find(s => s.id === editId);
          if (old?.image_url) await deleteOldImage(old.image_url);
        }
        imageUrl = await uploadImage(imageFile);
      }

      if (!imageUrl && !isEditing) {
        setMessage({ type: 'error', text: 'Please upload an image.' });
        setLoading(false);
        return;
      }

      const maxOrder = filteredSlides.reduce((max, s) => Math.max(max, s.sort_order || 0), 0);

      const saveData = {
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        link: form.link,
        link_label: form.link_label,
        category: form.category,
        is_active: form.is_active,
        image_url: imageUrl,
        type: activeTab,
      };

      if (isEditing) {
        const { error } = await supabase.from('carousel_slides').update(saveData).eq('id', editId);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Slide updated!' });
      } else {
        saveData.sort_order = maxOrder + 1;
        const { error } = await supabase.from('carousel_slides').insert([saveData]);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Slide added!' });
      }

      fetchSlides();
      resetForm();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save slide.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const slide = slides.find(s => s.id === id);
      if (slide?.image_url) await deleteOldImage(slide.image_url);
      const { error } = await supabase.from('carousel_slides').delete().eq('id', id);
      if (error) throw error;
      setSlides(slides.filter(s => s.id !== id));
      setMessage({ type: 'success', text: 'Slide deleted.' });
      setDeleteId(null);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete.' });
    }
  };

  const handleToggleActive = async (slide) => {
    try {
      await supabase.from('carousel_slides').update({ is_active: !slide.is_active }).eq('id', slide.id);
      fetchSlides();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to toggle.' });
    }
  };

  const handleMove = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= filteredSlides.length) return;

    const current = filteredSlides[index];
    const target = filteredSlides[targetIdx];

    try {
      await supabase.from('carousel_slides').update({ sort_order: target.sort_order }).eq('id', current.id);
      await supabase.from('carousel_slides').update({ sort_order: current.sort_order }).eq('id', target.id);
      fetchSlides();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reorder.' });
    }
  };

  return (
    <div className="admin-carousel">
      <div className="page-header">
        <div>
          <h1>Carousel Manager</h1>
          <p>Manage hero and promo banner slides</p>
        </div>
        <button className="add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={18} /> Add Slide
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          <AlertCircle size={16} />
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="carousel-tabs">
        <button className={`tab ${activeTab === 'hero' ? 'active' : ''}`} onClick={() => setActiveTab('hero')}>
          Hero Slides ({slides.filter(s => s.type === 'hero').length})
        </button>
        <button className={`tab ${activeTab === 'mid_banner' ? 'active' : ''}`} onClick={() => setActiveTab('mid_banner')}>
          Mid Banner ({slides.filter(s => s.type === 'mid_banner').length})
        </button>
        <button className={`tab ${activeTab === 'low_banner' ? 'active' : ''}`} onClick={() => setActiveTab('low_banner')}>
          Low Banner ({slides.filter(s => s.type === 'low_banner').length})
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="slide-form-card">
          <div className="form-card-header">
            <h3>{isEditing ? 'Edit Slide' : 'Add New Slide'}</h3>
            <button className="close-form-btn" onClick={resetForm}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="slide-form">
            <div className="slide-form-grid">
              <div className="form-left">
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="Slide title" />
                </div>
                <div className="form-group">
                  <label>Subtitle</label>
                  <input type="text" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Subtitle text" />
                </div>
                {(activeTab === 'hero' || activeTab === 'mid_banner' || activeTab === 'low_banner') && (
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief description" rows="2" />
                  </div>
                )}
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Link URL</label>
                    <input type="text" name="link" value={form.link} onChange={handleChange} placeholder="/products" />
                  </div>
                  <div className="form-group">
                    <label>Button Label</label>
                    <input type="text" name="link_label" value={form.link_label} onChange={handleChange} placeholder="Shop Now" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category Filter</label>
                  <input type="text" name="category" value={form.category} onChange={handleChange} placeholder="e.g. FASHION" />
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                    <span className="checkmark"></span>
                    Active (visible on website)
                  </label>
                </div>
              </div>
              <div className="form-right">
                <label>Slide Image *</label>
                <div
                  className={`slide-image-upload ${imagePreview ? 'has-image' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => !imagePreview && fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="slide-image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button type="button" className="remove-img" onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(''); }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="slide-upload-placeholder">
                      <Upload size={32} />
                      <p>Click or drag image</p>
                      <span>Recommended: 1920×800px</span>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} hidden />
                </div>
                {imagePreview && (
                  <button type="button" className="change-slide-img-btn" onClick={() => fileInputRef.current?.click()}>
                    Change Image
                  </button>
                )}
              </div>
            </div>
            <div className="form-actions-2">
              <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Update Slide' : 'Add Slide'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slides List */}
      {loading && slides.length === 0 ? (
        <div className="loading-state">Loading slides...</div>
      ) : filteredSlides.length === 0 ? (
        <div className="empty-state">
          <Image size={48} />
          <h3>No {activeTab} slides</h3>
          <p>Click "Add Slide" to create your first {activeTab} banner.</p>
        </div>
      ) : (
        <div className="slides-grid">
          {filteredSlides.map((slide, idx) => (
            <div key={slide.id} className={`slide-card ${!slide.is_active ? 'inactive' : ''}`}>
              <div className="slide-card-image">
                <img 
                  src={slide.image_url || 'https://placehold.co/400x200/f0f0f0/999?text=No+Image'} 
                  alt={slide.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/400x200/f0f0f0/999?text=Image+Not+Found';
                  }} 
                />
                {!slide.is_active && <span className="inactive-badge">Hidden</span>}
              </div>
              <div className="slide-card-body">
                <h4>{slide.title}</h4>
                {slide.subtitle && <p className="slide-subtitle">{slide.subtitle}</p>}
              </div>
              <div className="slide-card-actions">
                <button className="order-btn-sm" onClick={() => handleMove(idx, 'up')} disabled={idx === 0}><ArrowUp size={14} /></button>
                <button className="order-btn-sm" onClick={() => handleMove(idx, 'down')} disabled={idx === filteredSlides.length - 1}><ArrowDown size={14} /></button>
                <button className="icon-btn" onClick={() => handleToggleActive(slide)} title={slide.is_active ? 'Hide' : 'Show'}>
                  {slide.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button className="icon-btn edit" onClick={() => handleEdit(slide)}><Edit2 size={14} /></button>
                <button className="icon-btn delete" onClick={() => setDeleteId(slide.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Slide</h3>
            <p>Are you sure? The slide image will also be removed.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-delete" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCarousel;
