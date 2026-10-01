"use client"

import React, { useEffect, useState } from 'react'
import { siteConfig } from '../lib/seo'

const Contact = () => {
  const [reviewQr, setReviewQr] = useState('')

  useEffect(() => {
    let active = true
    import('qrcode')
      .then((QRCode) => QRCode.toDataURL(siteConfig.links.review, { width: 240, margin: 1 }))
      .then((url) => {
        if (active) setReviewQr(url)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  return (
    <div>
        {/* Contact Grid */}
        <div className="contact-grid">
            <a href="tel:8950101037" className="contact-box c-phone">
                <i className="fas fa-phone-volume"></i>
                <h3>Call Us</h3>
                <p>{siteConfig.phone}</p>
            </a>
            <a href={siteConfig.links.whatsapp} target="_blank" rel="noreferrer" className="contact-box c-whatsapp">
                <i className="fab fa-whatsapp"></i>
                <h3>WhatsApp</h3>
                <p>Chat with Dev Nain</p>
            </a>
            <a 
                href={siteConfig.links.maps}
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-box c-loc"
            >
                <i className="fas fa-map-marker-alt"></i>
                <h3>Visit Shop</h3>
                <p>Danoda Kalan</p>
            </a>
            <a href="mailto:dnain81@gmail.com" className="contact-box c-email">
                <i className="fas fa-envelope"></i>
                <h3>Email</h3>
                <p>Send a Mail</p>
            </a>
        </div>

        <div className="review-qr-card">
            {reviewQr && <img src={reviewQr} alt="Google review QR code" width="180" height="180" />}
            <div>
                <h2>Counter par ye QR lagao</h2>
                <p>Customer phone se scan kare to seedha Google review page khulega.</p>
                <a href={siteConfig.links.review} target="_blank" rel="noreferrer">
                    <span>⭐⭐⭐⭐⭐</span> Rate Us on Google
                </a>
            </div>
        </div>

        <div className="form-container contact-address-panel">
            <div className="form-header">
                <h2>Visit Nain CSC & Online Center</h2>
                <p>{siteConfig.address.formatted}</p>
                <p>{siteConfig.phone} • {siteConfig.email}</p>
            </div>
        </div>

        {/* Map Container (Fixed Name) */}
        <div className="map-container">
            <div className="map-container">
            <iframe 
                width="100%" 
                height="100%" 
                id="gmap_canvas" 
                src="https://maps.google.com/maps?q=Nain+CSC+Online+Center+Danoda+Kalan%2C+Jind%2C+Haryana&t=&z=13&ie=UTF8&iwloc=&output=embed" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0"
                title="Shop Map"
                style={{border:0}}
                allowFullScreen="" 
                loading="lazy"
            ></iframe>
        </div>
        </div>

        {/* Form */}
        <div className="form-container">
            <div className="form-header">
                <h2>Send a Message</h2>
                <p>Any query about Forms, Status, or Schemes? Ask here.</p>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <input type="text" className="form-input" placeholder="Your Full Name" required />
                </div>
                <div className="form-group">
                    <input type="tel" className="form-input" placeholder="Mobile Number" required />
                </div>
                <div className="form-group">
                    <textarea className="form-input" rows="5" placeholder="Write your message or query..."></textarea>
                </div>
                <button type="submit" className="submit-btn">
                    <i className="fas fa-paper-plane"></i> Send Message Now
                </button>
            </form>
        </div>
    </div>
  )
}

export default Contact