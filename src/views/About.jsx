import React from 'react';
import Link from 'next/link';
import { siteConfig, withBasePath } from '../lib/seo';

const About = () => {
  return (
    <div className="about-section">
        <div className="profile-card">
            <img src={withBasePath('/images/Photo.jpg')} alt="Dev Nain" className="profile-img" />
            
            <div className="profile-info">
                <h2>Hello, I'm Dev Nain</h2>
                <p>
                    Welcome to <b>Nain CSC & Online Center</b>. Nain CSC Center, also known as Nain Photostate Danoda,
                    is my local digital service desk in Danoda Kalan. My goal is to provide easy access to government schemes,
                    jobs, and digital services for everyone.
                </p>
                
                {/* 👇 Link Updated: Ab ye '/my-resume' par jayega */}
                <Link href="/my-resume" className="resume-btn" style={{textDecoration: 'none'}}>
                    <i className="fas fa-file-alt"></i> View My Resume
                </Link>

                <div className="about-cta-row">
                    <a href="tel:8950101037" className="about-cta-btn call"><i className="fas fa-phone-alt"></i> Call Now</a>
                    <a href={siteConfig.links.whatsapp} target="_blank" rel="noreferrer" className="about-cta-btn wa"><i className="fab fa-whatsapp"></i> WhatsApp</a>
                    <a href={siteConfig.links.maps} target="_blank" rel="noreferrer" className="about-cta-btn map"><i className="fas fa-map-marker-alt"></i> Directions</a>
                </div>

            </div>
        </div>

        <div className="about-stats-grid">
            <div className="about-stat-card"><strong>3+</strong><span>Years Service</span></div>
            <div className="about-stat-card"><strong>5000+</strong><span>Forms Processed</span></div>
            <div className="about-stat-card"><strong>99%</strong><span>Trusted Support</span></div>
            <div className="about-stat-card"><strong>24x7</strong><span>Online Access</span></div>
        </div>

        <div className="about-timeline-card">
            <h3><i className="fas fa-stream"></i> Journey Timeline</h3>
            <ul className="about-timeline-list">
                <li><span>2022</span> Shop started in Danoda Kalan with core online services.</li>
                <li><span>2023</span> Government forms, ID correction and pension services expanded.</li>
                <li><span>2024</span> Web platform launched for easy links and public help.</li>
                <li><span>2025+</span> Fast digital support with new tools and live updates.</li>
            </ul>
        </div>

        <div className="shop-details">
            <h3><i className="fas fa-store"></i> About Our Shop</h3>
            <p>
                हम पिछले 3 वर्षों से दनोदा कलां में भरोसेमंद ऑनलाइन सेवाएं प्रदान कर रहे हैं। हमारे यहाँ सभी प्रकार के ऑनलाइन फॉर्म, आधार कार्ड, पैन कार्ड, और सरकारी योजनाओं के फॉर्म भरे जाते हैं।
            </p>
            <p>
                <b>Speciality:</b> Family ID Correction, Old Age Pension, Urgent Printouts & Lamination.
            </p>
            <p>
                <b>Address:</b> {siteConfig.address.formatted}
            </p>

            <hr style={{border: 0, borderTop: '1px solid #eee', margin: '20px 0'}} />

            <h3><i className="fas fa-code"></i> About This Website</h3>
            <p>
                This website is designed and developed by me (Dev Nain) to help students and villagers get direct links to important forms without visiting the shop for small queries.
            </p>
        </div>
    </div>
  )
}

export default About;