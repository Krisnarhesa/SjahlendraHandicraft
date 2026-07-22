import { Facebook, Instagram } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import './Footer.css';

const Footer = () => {
    const [contactInfo, setContactInfo] = useState({ phone: '', email: '' });

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('key, value')
                    .in('key', ['phone', 'email']);
                
                if (error) throw error;
                
                if (data) {
                    const info = {};
                    data.forEach(item => {
                        info[item.key] = item.value;
                    });
                    setContactInfo(prev => ({ ...prev, ...info }));
                }
            } catch (err) {
                console.error('Error fetching footer contact info:', err);
            }
        };

        fetchContactInfo();
    }, []);
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-col">
                    <div className="footer-logo-container">
                        <img src="/logo.svg" alt="Sjahlendra Logo" className="footer-logo-img" />
                        <img src="/logo-text.png" alt="Sjahlendra Handicraft" className="footer-logo-text" />
                    </div>
                    <p className="footer-text">
                        Ethically sourced, sustainably crafted. Bringing the heart of Bali to your home.
                    </p>
                </div>

                <div className="footer-col">
                    <h4>Shop</h4>
                    <ul>
                        {/* Passing state to pre-select category when navigating to Shop */}
                        <li><Link to="/products" state={{ category: 'FURNITURE' }}>Furniture</Link></li>
                        <li><Link to="/products" state={{ category: 'HOME DEC' }}>Home Decor</Link></li>
                        <li><Link to="/products" state={{ category: 'FASHION' }}>Fashion</Link></li>
                        <li><Link to="/products">New Arrivals</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>About</h4>
                    <ul>
                        <li><Link to="/about">Our Story</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Our Social Media</h4>
                    <div className="social-links">
                        <a href="https://www.instagram.com/sjahlendra_handicraft/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                            <Instagram size={20} />
                            <span>Instagram</span>
                        </a>
                        <a href="https://www.facebook.com/sjahlendra.handicraft" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                            <Facebook size={20} />
                            <span>Facebook</span>
                        </a>
                    </div>
                </div>

                <div className="footer-col">
                    <h4>Stay Connected</h4>
                    <div className="contact-details">
                        <p>
                            {contactInfo.phone || '+62 813-1666-3377'}
                        </p>
                        <p>{contactInfo.email || 'info@sjahlendra.com'}</p>
                    </div>
                    <p className="footer-copyright">
                        &copy; {new Date().getFullYear()} Sjahlendra Handicraft. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
