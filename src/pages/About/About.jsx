import { useEffect, useState } from 'react';
import Breadcrumbs from '../../components/common/Breadcrumbs/Breadcrumbs';
import { supabase } from '../../lib/supabaseClient';
import './About.css';

// Clean Quill's &nbsp; entities so text-align: justify works properly
const cleanHtml = (html) => {
    if (!html) return html;
    return html.replace(/&nbsp;/g, ' ');
};

const About = () => {
    const [story, setStory] = useState({ title: '', paragraphs: [], image: '' });
    const [sustainability, setSustainability] = useState({ title: '', paragraphs: [] });
    const [team, setTeam] = useState({ title: '', members: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAboutContent();
    }, []);

    const fetchAboutContent = async () => {
        try {
            const { data, error } = await supabase
                .from('site_content')
                .select('*')
                .in('section_key', ['about_story', 'about_sustainability', 'about_team']);

            if (error) throw error;

            (data || []).forEach(item => {
                if (item.section_key === 'about_story') setStory({ title: item.title, ...item.content });
                if (item.section_key === 'about_sustainability') setSustainability({ title: item.title, ...item.content });
                if (item.section_key === 'about_team') setTeam({ title: item.title, ...item.content });
            });
        } catch (error) {
            console.error('Error fetching about content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="container" style={{ padding: '100px 50px', textAlign: 'center' }}>Loading story...</div>;
    }

    return (
        <div className="about-page">
            <div className="container">
                <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'About Us', path: '/about' }]} />

                <section className="about-hero">
                    <h1 className="about-title">{story.title || 'Our Story'}</h1>
                    <div className="about-content">
                        {story.image && (
                            <div className="about-image">
                                <img src={story.image} alt="Our Story" />
                            </div>
                        )}
                        <div className="about-text">
                            <h2>Great Handicraft Bali Indonesia</h2>
                            {story.html_content ? (
                                <div dangerouslySetInnerHTML={{ __html: cleanHtml(story.html_content) }} className="rich-text-content" />
                            ) : (
                                story.paragraphs?.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <section className="about-sustainability">
                    <div className="sustainability-content">
                        <h2>{sustainability.title || 'Sustainability & Impact'}</h2>
                        {sustainability.html_content ? (
                            <div dangerouslySetInnerHTML={{ __html: cleanHtml(sustainability.html_content) }} className="rich-text-content" />
                        ) : (
                            sustainability.paragraphs?.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))
                        )}
                    </div>
                </section>

                {team.members && team.members.length > 0 && (
                    <section className="about-team">
                        <h2 className="team-title">{team.title || 'OUR TEAM'}</h2>
                        <div className="values-content">
                            <p className="values-text">
                                “At our company, we see our employees and partners as more than just team members—they are part of our family. We believe that bringing someone on board means taking on the responsibility to support, nurture, and empower them to grow both personally and professionally.
                            </p>
                            <p className="values-text">
                                We are committed to creating a workplace where everyone feels valued, respected, and inspired to reach their full potential. We understand that success is built on trust and compassion, and we strive to maintain a balance where achieving our business goals never comes at the expense of our team’s well-being.
                            </p>
                            <p className="values-text">
                                For us, success isn’t just about numbers—it’s about the positive impact we have on the lives of our team members. After all, a thriving business grows together with its people, because family always comes first.”
                            </p>
                        </div>
                        <div className="team-grid">
                            {team.members.map((member, i) => (
                                <div key={i} className="team-card">
                                    <img src={member.image || 'https://placehold.co/300x400/f0f0f0/999?text=No+Photo'} alt={member.name} className="team-photo-card" />
                                    <div className="team-info">
                                        <h3>{member.name}</h3>
                                        <p>{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="about-store" style={{ marginTop: '60px', marginBottom: '60px' }}>
                    <h2 className="team-title" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2rem', color: '#4e5837' }}>Our Store</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        <div className="store-image-container" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <img 
                                src="/about/store-front.jpeg" 
                                alt="Sjahlendra Handicraft Store Front"  
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                            />
                        </div>
                        <div className="store-map-container" style={{ width: '100%', minHeight: '400px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <iframe 
                                src="https://maps.google.com/maps?q=SJAHLENDRA+HANDICRAFT&t=&z=17&ie=UTF8&iwloc=&output=embed" 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                style={{ border: 0, minHeight: '400px' }} 
                                allowFullScreen="" 
                                aria-hidden="false" 
                                tabIndex="0"
                                title="Sjahlendra Handicraft Google Maps"
                            ></iframe>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
