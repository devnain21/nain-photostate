"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import '../Styles/tools.css';

const readFavoriteTools = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const saved = localStorage.getItem('favoriteTools')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const Tools = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const seoCards = [
    'Resume, image, PDF aur utility tools ko ek curated dashboard me rakhne se daily CSC work fast hota hai.',
    'Users search aur category filter se relevant tool jaldi open kar sakte hain, jo dwell time aur usability dono improve karta hai.',
    'Local visitors ke liye yeh page document prep aur online kaam ke liye one-stop utility hub ka kaam karta hai.',
  ];

  React.useEffect(() => {
    setFavorites(readFavoriteTools())
  }, [])

  // 🚀 यहाँ सभी 15 टूल्स को एक VIP कार्ड का रूप दिया गया है
  const toolsList = [
    // --- AAPKE PURAANE TOOLS (Ekdam Safe) ---
    { title: "Age Calculator", desc: "सटीक उम्र और दिन निकालें", icon: "fas fa-calculator", url: "/age-calculator", external: false, color: "#ef4444", category: 'daily', badge: 'Fast' },
    { title: "Resume Maker", desc: "प्रोफेशनल CV बनाएँ", icon: "fas fa-file-invoice", url: "/resume", external: false, color: "#3b82f6", category: 'docs', badge: 'Popular' },
    { title: "Image Resizer", desc: "फोटो का साइज़ कम करें", icon: "fas fa-compress-arrows-alt", url: "https://www.reduceimages.com/", external: true, color: "#10b981", category: 'image', badge: 'Free' },
    { title: "JPG to PDF", desc: "फोटो को PDF में बदलें", icon: "fas fa-file-pdf", url: "https://www.ilovepdf.com/jpg_to_pdf", external: true, color: "#f59e0b", category: 'docs', badge: 'Trusted' },
    { title: "Merge PDF", desc: "कई PDF को एक साथ जोड़ें", icon: "fas fa-object-group", url: "https://www.ilovepdf.com/merge_pdf", external: true, color: "#8b5cf6", category: 'docs', badge: 'No Login' },
    { title: "Remove BG", desc: "AI से बैकग्राउंड हटाएँ", icon: "fas fa-eraser", url: "https://www.remove.bg/", external: true, color: "#ec4899", category: 'image', badge: 'AI' },
    { title: "Hindi Typing", desc: "English से Hindi टाइपिंग", icon: "fas fa-keyboard", url: "https://indiatyping.com/", external: true, color: "#14b8a6", category: 'utility', badge: 'Useful' },
    { title: "Photo Editor", desc: "ऑनलाइन फोटोशॉप", icon: "fas fa-magic", url: "https://www.photopea.com/", external: true, color: "#6366f1", category: 'image', badge: 'Pro' },
    { title: "UPI Helper", desc: "upi helper", icon: "fa fa-inr", url: "https://www.upihelp.npci.org.in/", external: true, color: "#6366f1", category: 'daily', badge: 'Pro' },
    // --- NAYE SUPER TOOLS ---
    { title: "Photext", desc: "ऑनलाइन फोटो एडिट करें", icon: "fas fa-paint-brush", url: "https://photext.shop/", external: true, color: "#f97316", category: 'image', badge: 'Creative' },
    { title: "Flash.co", desc: "ऑनलाइन रेट कंपेयर करें", icon: "fas fa-balance-scale", url: "https://flash.co/home", external: true, color: "#06b6d4", category: 'utility', badge: 'New' },
    { title: "Print Friendly", desc: "इंक और पेज बचाकर प्रिंट लें", icon: "fas fa-print", url: "https://www.printfriendly.com/", external: true, color: "#22c55e", category: 'docs', badge: 'Daily' },
    { title: "Temp Mail", desc: "10 मिनट वाली फर्जी ईमेल", icon: "fas fa-envelope-open-text", url: "https://temp-mail.org/", external: true, color: "#a855f7", category: 'utility', badge: 'No Login' },
    { title: "Watermark Remover", desc: "फोटो से वॉटरमार्क/लोगो हटाएँ", icon: "fas fa-tint-slash", url: "https://www.watermarkremover.io/", external: true, color: "#f43f5e", category: 'image', badge: 'AI' },
    
    // --- 📺🤖 THE LATEST ADDITIONS (Oxaam & Grok) ---
    { title: "Oxaam OTT", desc: "सस्ते OTT सब्सक्रिप्शन", icon: "fas fa-tv", url: "https://www.oxaam.com/dashboard.php", external: true, color: "#eab308", category: 'daily', badge: 'Trending' },
    { title: "Grok AI", desc: "स्मार्ट और बेबाक AI", icon: "fas fa-robot", url: "https://grok.com/", external: true, color: "#0ea5e9", category: 'ai', badge: 'AI' }
  ];

  const toggleFavorite = (title) => {
    const next = favorites.includes(title)
      ? favorites.filter((t) => t !== title)
      : [...favorites, title];
    setFavorites(next);
    localStorage.setItem('favoriteTools', JSON.stringify(next));
  };

  const categories = ['all', 'daily', 'docs', 'image', 'utility', 'ai'];
  const filteredTools = toolsList
    .filter((tool) => activeCategory === 'all' ? true : tool.category === activeCategory)
    .filter((tool) => !searchTerm || tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || tool.desc.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="tools-dashboard-wrapper">
      <div className="tools-vip-header">
          <h1><i className="fas fa-toolbox" style={{color: '#0d6efd'}}></i> Pro Utility Tools</h1>
          <p>आपके ऑनलाइन काम को 10 गुना तेज़ बनाने वाले स्मार्ट टूल्स</p>
      </div>

      <div className="tools-search-bar">
        <i className="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Search tools..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="tools-search-clear">
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      <div className="tools-filter-row">
        {categories.map((cat) => (
          <button key={cat} className={`tools-filter-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="tools-pro-grid">
        {filteredTools.map((tool, index) => {
          // कार्ड के अंदर का डिज़ाइन
          const CardContent = () => (
            <>
              {/* आइकॉन का बॉक्स, जिसका कलर टूल के हिसाब से होगा */}
              <div className="tool-icon-glass" style={{color: tool.color, background: `${tool.color}15`}}>
                <i className={tool.icon}></i>
              </div>
              <div className="tool-card-info">
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
                <span className="tool-badge">{tool.badge}</span>
              </div>
              <button className={`tool-fav-btn ${favorites.includes(tool.title) ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(tool.title); }} title="Favorite">
                <i className={`${favorites.includes(tool.title) ? 'fas' : 'far'} fa-star`}></i>
              </button>
              <div className="tool-go-btn" style={{color: tool.color}}>
                 <i className={tool.external ? "fas fa-external-link-alt" : "fas fa-arrow-right"}></i>
              </div>
            </>
          );

          // अगर बाहरी लिंक है तो a tag, वरना अपनी वेबसाइट का लिंक
          return tool.external ? (
            <a href={tool.url} target="_blank" rel="noreferrer" className="tool-pro-card" key={index}>
              <CardContent />
            </a>
          ) : (
            <Link href={tool.url} className="tool-pro-card" key={index}>
              <CardContent />
            </Link>
          )
        })}
      </div>

      <section className="tools-seo-panel" aria-labelledby="tools-seo-title">
        <span className="tools-seo-eyebrow">Tools SEO Section</span>
        <h2 id="tools-seo-title">Resume maker, image tools aur CSC work utilities ek dashboard me</h2>
        <p>
          Yeh page daily online kaam ke liye practical utilities ko organize karta hai. Resume creation, image editing, PDF conversion,
          Hindi typing aur quick web utilities ko categories ke saath dikhane se users ko relevant tool fast milta hai aur repeat usage badhta hai.
        </p>

        <div className="tools-seo-grid">
          {seoCards.map((card) => (
            <article className="tools-seo-card" key={card}>
              <p>{card}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Tools;