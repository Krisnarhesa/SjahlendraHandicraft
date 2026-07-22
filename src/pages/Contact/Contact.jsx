import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import Breadcrumbs from '../../components/common/Breadcrumbs/Breadcrumbs';
import { supabase } from '../../lib/supabaseClient';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [settings, setSettings] = useState({
        address: '',
        phone: '',
        email: '',
        workshop_hours_weekday: '',
        workshop_hours_weekend: ''
    });

    const [loading, setLoading] = useState(true);

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
        } catch (error) {
            console.error('Error fetching contact settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const targetEmail = settings.email || 'info@sjahlendra.com';
        
        // Construct mailto link
        const subject = encodeURIComponent(`Contact Form: ${formData.subject}`);
        const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);

        // Open email client
        window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

        alert('Opening your email client to send the message...');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    if (loading) {
        return <div className="container" style={{ padding: '100px 50px', textAlign: 'center' }}>Loading contact information...</div>;
    }

    return (
        <div className="contact-page">
            <div className="container">
                <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Contact', path: '/contact' }]} />

                <div className="contact-header">
                    <h1>We’d Love To Hear From You</h1>
                    <p>Have a question about our products or want to discuss a custom order? Get in touch with us.</p>
                </div>

                <div className="contact-container">
                    <div className="contact-info-section">
                        <div className="info-card">
                            <h3>Find us Here</h3>
                            <div className="info-item">
                                <MapPin className="info-icon" />
                                <p>{settings.address || 'Ubud, Gianyar, Bali'}</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <h3>Get In Touch</h3>
                            <div className="info-item">
                                <Phone className="info-icon" />
                                <p>{settings.phone || '+62 813-1666-3377'}</p>
                            </div>
                            <div className="info-item">
                                <Mail className="info-icon" />
                                <p>{settings.email || 'yulishie@yahoo.com'}</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <h3>Workshop Hours</h3>
                            <div className="info-item">
                                <Clock className="info-icon" />
                                <div>
                                    <p>{settings.workshop_hours_weekday || 'Mon - Fri: 9am - 8pm'}</p>
                                    <p>{settings.workshop_hours_weekend || 'Saturday: 10am - 4pm'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-section">
                        <h2>Take the first step, we will take care for the rest</h2>
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your Email"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="Subject"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    placeholder="How can we help you?"
                                    rows="5"
                                ></textarea>
                            </div>
                            <button type="submit" className="submit-btn btn-primary">
                                Send Message <Send size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
