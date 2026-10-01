"use client"

import React, { useEffect, useState } from 'react';

const FloatingProTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
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

  const sendWhatsApp = () => {
    if (phone.length !== 10) {
      alert('⚠️ कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें!');
      return;
    }
    
    // 🚀 आपका नया VIP और शानदार मार्केटिंग मैसेज 🚀
    const message = `नमस्कार! 🙏\n*Nain CSC & Online Center* में आपका स्वागत है।\n\nकृपया अपना ऑनलाइन फॉर्म भरने के लिए अपने ज़रूरी दस्तावेज़ (Documents) यहाँ भेजें।\n\n🔔 *ज़रूरी सूचना:*\nनौकरी, एडमिट कार्ड और सरकारी योजनाओं की सबसे तेज़ अपडेट पाने के लिए अभी हमारे WhatsApp ग्रुप से जुड़ें 👇\nhttps://chat.whatsapp.com/JTO6kT4j8ykEIgRAVdpags\n\nधन्यवाद!`;
    
    // WhatsApp का फास्ट API लिंक
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    
    // ब्राउज़र को एक ही टैब इस्तेमाल करने का निर्देश
    window.open(url, 'whatsapp_direct_tab'); 
    
    setPhone(''); // भेजने के बाद बॉक्स खाली
  };

  return (
    <div className="floating-pro-container">
      {isOpen && (
        <div className="pro-widget-glass">
          <div className="widget-header" style={{ background: '#128C7E' }}>
            <h4><i className="fab fa-whatsapp"></i> Direct WhatsApp</h4>
            <button onClick={() => setIsOpen(false)} className="close-btn"><i className="fas fa-times"></i></button>
          </div>

          <div className="widget-content">
            <div className="whatsapp-tab animation-fade">
              <p>बिना नंबर सेव किए डॉक्यूमेंट मंगाएं</p>
              <div className="input-group">
                <span className="country-code">+91</span>
                <input 
                  type="number" 
                  placeholder="ग्राहक का मोबाइल नंबर" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendWhatsApp()}
                />
              </div>
              <button className="send-wa-btn" onClick={sendWhatsApp}>
                <i className="fab fa-whatsapp"></i> Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {showFloatingButton && (
        <button className="floating-action-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <i className="fas fa-times"></i> : <i className="fab fa-whatsapp" style={{fontSize: '30px'}}></i>}
        </button>
      )}
    </div>
  );
};

export default FloatingProTools;