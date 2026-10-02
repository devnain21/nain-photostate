"use client"

import React, { useEffect, useState } from 'react';
import { siteConfig } from '../lib/seo';

const FloatingProTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'sendTo'
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    const updateFloatingVisibility = () => {
      const isMobile = window.innerWidth <= 768;
      const shouldShow = !isMobile || window.scrollY > 260;

      setShowFloatingButton(shouldShow);

      if (!shouldShow) {
        setIsOpen(false);
      }
    };

    updateFloatingVisibility();
    window.addEventListener('scroll', updateFloatingVisibility, { passive: true });
    window.addEventListener('resize', updateFloatingVisibility);

    return () => {
      window.removeEventListener('scroll', updateFloatingVisibility);
      window.removeEventListener('resize', updateFloatingVisibility);
    };
  }, []);

  const openCustomerChat = (customMsg) => {
    const defaultMsg = 'नमस्ते देव नैन जी! 🙏\nमुझे Nain CSC से ऑनलाइन फॉर्म / दस्तावेज़ का काम करवाना है।';
    const text = customMsg || defaultMsg;
    const cleanPhone = siteConfig.phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const sendWhatsAppToCustomer = () => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setErrorMsg('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें!');
      return;
    }
    setErrorMsg('');

    const message = `नमस्कार! 🙏\n*Nain CSC & Online Center* में आपका स्वागत है।\n\nकृपया अपना ऑनलाइन फॉर्म भरने के लिए अपने ज़रूरी दस्तावेज़ (Documents) यहाँ भेजें।\n\n🔔 *ज़रूरी सूचना:*\nनौकरी, एडमिट कार्ड और सरकारी योजनाओं की सबसे तेज़ अपडेट पाने के लिए अभी हमारे WhatsApp ग्रुप से जुड़ें 👇\nhttps://chat.whatsapp.com/JTO6kT4j8ykEIgRAVdpags\n\nधन्यवाद!`;
    const url = `https://wa.me/91${cleanDigits}?text=${encodeURIComponent(message)}`;
    window.open(url, 'whatsapp_direct_tab');
    setPhone('');
    setIsOpen(false);
  };

  return (
    <div className="floating-pro-container">
      {isOpen && (
        <div className="pro-widget-glass" role="dialog" aria-label="WhatsApp Assistant">
          <div className="widget-header" style={{ background: '#128C7E' }}>
            <h4><i className="fab fa-whatsapp"></i> Nain CSC WhatsApp</h4>
            <button type="button" onClick={() => setIsOpen(false)} className="close-btn" aria-label="Close widget">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="widget-tabs">
            <button
              type="button"
              className={activeTab === 'chat' ? 'active' : ''}
              onClick={() => { setActiveTab('chat'); setErrorMsg(''); }}
            >
              <i className="fas fa-comments"></i> सहायता लें
            </button>
            <button
              type="button"
              className={activeTab === 'sendTo' ? 'active' : ''}
              onClick={() => { setActiveTab('sendTo'); setErrorMsg(''); }}
            >
              <i className="fas fa-paper-plane"></i> नंबर पर भेजें
            </button>
          </div>

          <div className="widget-content">
            {activeTab === 'chat' ? (
              <div className="whatsapp-tab animation-fade">
                <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  देव नैन से सीधे WhatsApp पर जुड़ें
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    className="wa-quick-chip"
                    onClick={() => openCustomerChat('नमस्ते! मुझे ऑनलाइन फॉर्म भरवाना है। क्या-क्या डॉक्यूमेंट लगेंगे?')}
                  >
                    📄 नया फॉर्म भरना है
                  </button>
                  <button
                    type="button"
                    className="wa-quick-chip"
                    onClick={() => openCustomerChat('नमस्ते! मुझे Family ID / Parivar Pehchan Patra में सुधार या अपडेट करवाना है।')}
                  >
                    🆔 Family ID / PPP अपडेट
                  </button>
                  <button
                    type="button"
                    className="wa-quick-chip"
                    onClick={() => openCustomerChat('नमस्ते! मुझे कॉलेज फॉर्म / स्कॉलरशिप के बारे में जानकारी चाहिए।')}
                  >
                    🎓 कॉलेज / स्कॉलरशिप फॉर्म
                  </button>
                </div>

                <button
                  type="button"
                  className="send-wa-btn"
                  onClick={() => openCustomerChat()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <i className="fab fa-whatsapp" style={{ fontSize: '18px' }}></i> WhatsApp चैट शुरू करें
                </button>
              </div>
            ) : (
              <div className="whatsapp-tab animation-fade">
                <p>बिना नंबर सेव किए ग्राहक को लिंक या मैसेज भेजें</p>
                <div className="input-group">
                  <span className="country-code">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && sendWhatsAppToCustomer()}
                  />
                </div>
                {errorMsg && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '-8px 0 10px 0', textAlign: 'left' }}>
                    {errorMsg}
                  </p>
                )}
                <button type="button" className="send-wa-btn" onClick={sendWhatsAppToCustomer}>
                  <i className="fab fa-whatsapp"></i> मैसेज भेजें
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {showFloatingButton && (
        <button
          type="button"
          className="floating-action-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close WhatsApp widget' : 'Open WhatsApp widget'}
        >
          {isOpen ? <i className="fas fa-times"></i> : <i className="fab fa-whatsapp" style={{ fontSize: '30px' }}></i>}
        </button>
      )}
    </div>
  );
};

export default FloatingProTools;
