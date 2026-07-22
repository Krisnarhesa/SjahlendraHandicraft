import { AlertCircle, ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import './ProductForm.css';

const ProductForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    main_category: '',
    sub_category: '',
    price: '',
    brand: 'Sjahlendra Handicraft',
    is_best_seller: false,
    image_url: '',
    stock: '',
    is_hidden: false,
    is_promo: false,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        setCategories(data.map(c => c.name));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setForm({
          name: data.name || '',
          code: data.code || '',
          description: data.description || '',
          category: data.category || '',
          main_category: data.main_category || '',
          sub_category: data.sub_category || '',
          price: data.price || '',
          brand: data.brand || 'Sjahlendra Handicraft',
          is_best_seller: data.is_best_seller || false,
          image_url: data.image_url || '',
          stock: data.stock !== null ? data.stock : '',
          is_hidden: data.is_hidden || false,
          is_promo: data.is_promo || false,
        });
        if (data.image_url) {
          setExistingImages(data.image_url.split(',').filter(url => url.trim() !== ''));
        }
      }
    } catch (err) {
      setError('Product not found.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addFiles(files);
  };

  const addFiles = (files) => {
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      setError('Some images were larger than 5MB and were skipped.');
    }
    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('product')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let finalImageUrls = [...existingImages];

      // Upload new images
      for (const file of imageFiles) {
        const url = await uploadImage(file);
        finalImageUrls.push(url);
      }

      const imageUrl = finalImageUrls.join(',');

      const productData = {
        name: form.name?.trim(),
        code: form.code?.trim(),
        description: form.description?.trim(),
        category: form.category?.trim(),
        main_category: form.main_category?.trim(),
        sub_category: form.sub_category?.trim(),
        price: form.price !== '' ? parseInt(form.price) : null,
        brand: form.brand,
        is_best_seller: form.is_best_seller,
        image_url: imageUrl,
        stock: form.stock !== '' ? parseInt(form.stock) : null,
        is_hidden: form.is_hidden,
        is_promo: form.is_promo,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);
        if (error) throw error;
        setSuccess('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
        setSuccess('Product created successfully!');
        setTimeout(() => navigate('/sj-manage/products'), 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="loading-state">Loading product...</div>;
  }

  return (
    <div className="product-form-page">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/sj-manage/products')}>
          <ArrowLeft size={18} />
          Back to Products
        </button>
        <h1>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <AlertCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          {/* Left Column */}
          <div className="form-section">
            <h3>Product Information</h3>

            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="code">Product Code (Optional)</label>
              <input
                type="text"
                id="code"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. BALI-001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="main_category">Main Category</label>
                <select
                  id="main_category"
                  name="main_category"
                  value={form.main_category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sub_category">Sub Category</label>
                <input
                  type="text"
                  id="sub_category"
                  name="sub_category"
                  value={form.sub_category}
                  onChange={handleChange}
                  placeholder="e.g. Stools, Dreamcatchers"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (IDR)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 850000"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock Quantity (Optional)</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Brand name"
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_best_seller"
                  checked={form.is_best_seller}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Mark as Best Seller
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_hidden"
                  checked={form.is_hidden}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Hide Product (Out of Stock / Temporary Unavailable)
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_promo"
                  checked={form.is_promo}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Show on Promo Banner (Home Page)
              </label>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="form-section">
            <h3>Product Image</h3>

            <div className="images-preview-grid">
              {existingImages.map((url, i) => (
                <div key={'old-'+i} className="image-preview">
                  <img src={url} alt={`Existing ${i}`} />
                  <button type="button" className="remove-image" onClick={() => removeExistingImage(i)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
              {imageFiles.map((file, i) => (
                <div key={'new-'+i} className="image-preview">
                  <img src={URL.createObjectURL(file)} alt={`New ${i}`} />
                  <button type="button" className="remove-image" onClick={() => removeNewImage(i)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div
              className={`image-upload-area`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-placeholder">
                <Upload size={36} />
                <p>Drag & drop images here, or click to browse</p>
                <span>Max 5MB per image • JPG, PNG, WebP</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                hidden
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/sj-manage/products')}>
            Cancel
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? (
              <span className="btn-loading"><span className="spinner"></span>Saving...</span>
            ) : (
              <><Save size={18} /> {isEditing ? 'Update Product' : 'Create Product'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
