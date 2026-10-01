"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../Styles/vault.css';

// Firebase Imports (सिर्फ Realtime DB वाले)
import { auth, db } from '../firebase';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { onValue, push, ref, remove, set, update } from "firebase/database";

const maskAadhaar = (value = '') => {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return `XXXX XXXX ${digits.slice(-4)}`;
};

const readFavorites = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    return JSON.parse(localStorage.getItem('crm_favorites') || '[]')
  } catch {
    return []
  }
}

const GrahakVault = () => {
  const router = useRouter();
  // 🔐 Auth States 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUid, setCurrentUid] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // 📂 Data States
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFetchingData, setIsFetchingData] = useState(false);
  
  // Modal & Edit States
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ 
    name: '', fatherName: '', phone: '', familyId: '', aadhaar: '', caste: '', address: '', note: '' 
  });

  // 🚀 VIP Panel State
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // ✨ Dynamic Custom Fields State
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customValue, setCustomValue] = useState('');

  // 🆕 NEW FEATURE STATES
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'name', 'phone'
  const [filterBy, setFilterBy] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('personal');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);

  useEffect(() => {
    setFavorites(readFavorites())
  }, [])

  useEffect(() => {
    setShowAadhaar(false)
  }, [selectedCustomer?.id])

  useEffect(() => {
    const shouldLockScroll = Boolean(selectedCustomer || showAddForm)

    if (shouldLockScroll) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedCustomer, showAddForm])

  // --------------------------------------------------------
  // 🚀 AUTH & LIVE SYNC LOGIC
  // --------------------------------------------------------
  useEffect(() => {
    let stopSync = null;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (stopSync) {
        stopSync();
        stopSync = null;
      }

      if (user) {
        setCurrentUser(user.email);
        setCurrentUid(user.uid); // यूज़र की आईडी पकड़ी
        setIsLoggedIn(true);
        setIsFetchingData(true);

        // ✅ फिक्स: Live Sync (बिना रिफ्रेश के डेटा आएगा)
        const userDbRef = ref(db, `vault_data/${user.uid}`);
        stopSync = onValue(userDbRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const loadedCustomers = Object.keys(data).map(key => ({
              id: key,
              ...data[key]
            }));
            setCustomers(loadedCustomers.reverse());
          } else {
            setCustomers([]);
          }
          setIsFetchingData(false);
        });
      } else {
        setCurrentUser(null);
        setCurrentUid(null);
        setIsLoggedIn(false);
        setCustomers([]);
        setIsFetchingData(false);
      }
      setIsLoadingAuth(false);
    });

    return () => {
      if (stopSync) {
        stopSync();
      }
      unsubscribe();
    };
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setResetMessage('');
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return setAuthError("Email and Password required!");

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setAuthError("Email ya password match nahi kar raha. Neeche reset email bhejo, naya account mat banana.");
      } else if (error.code === 'auth/too-many-requests') {
        setAuthError("Bahut saari galat koshishen. Thodi der baad try karein.");
      } else if (error.code === 'auth/operation-not-allowed') {
        setAuthError("Email login Firebase mein band hai. Authentication > Sign-in method > Email/Password on karo.");
      } else {
        setAuthError("Error: " + error.message);
      }
    }
  };

  const handlePasswordReset = async () => {
    setAuthError('');
    setResetMessage('');
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setAuthError("Pehle wahi email likho jisse vault account bana tha.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetMessage("Reset link email par chala gaya. Wahi purana account rahega, isliye purana customer data bhi rahega.");
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setAuthError("Is email par koi vault account nahi hai.");
      } else if (error.code === 'auth/invalid-email') {
        setAuthError("Email sahi nahi hai.");
      } else {
        setAuthError("Reset nahi bhej paya: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSelectedCustomer(null);
  };

  // ☁️ CLOUD DATA ACTIONS (SAVE, EDIT, DELETE)
  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('कृपया सभी आवश्यक fields भरें', 'error');
      return;
    }

    try {
      if (isEditMode) {
        const customerRef = ref(db, `vault_data/${currentUid}/${newCustomer.id}`);
        await update(customerRef, newCustomer);
        if (selectedCustomer?.id === newCustomer.id) setSelectedCustomer(newCustomer);
        showToast('✅ ग्राहक अपडेट हो गया!', 'success');
      } else {
        const userDbRef = ref(db, `vault_data/${currentUid}`);
        const newDocRef = push(userDbRef); 
        await set(newDocRef, { ...newCustomer, customFields: [], createdAt: Date.now() });
        showToast('✅ नया ग्राहक जोड़ा गया!', 'success');
      }
      setShowAddForm(false);
      setIsEditMode(false);
      setNewCustomer({ name: '', fatherName: '', phone: '', familyId: '', aadhaar: '', caste: '', address: '', note: '' });
    } catch (error) {
      showToast('❌ Error: ' + error.message, 'error');
    }
  };

  const handleEditClick = (customer) => {
    setNewCustomer(customer);
    setIsEditMode(true);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("क्या आप सच में इस ग्राहक का डेटा हमेशा के लिए डिलीट करना चाहते हैं?")) {
      try {
        // ✅ फिक्स: सही तरीके से डिलीट करना
        const customerRef = ref(db, `vault_data/${currentUid}/${id}`);
        await remove(customerRef);
        setSelectedCustomer(null);
      } catch (error) {
        alert("Error deleting data: " + error.message);
      }
    }
  };

  // ✨ DYNAMIC CUSTOM FIELDS
  const handleAddCustomField = async () => {
    if (!customLabel || !customValue) return alert("Label और Value भरें!");
    
    try {
      const newField = { label: customLabel, value: customValue, id: Date.now() };
      const currentFields = selectedCustomer.customFields || [];
      const updatedFields = [...currentFields, newField];
      
      // ✅ फिक्स: Live अपडेट
      const customerRef = ref(db, `vault_data/${currentUid}/${selectedCustomer.id}`);
      await update(customerRef, { customFields: updatedFields });

      setSelectedCustomer({ ...selectedCustomer, customFields: updatedFields });
      setCustomLabel(''); setCustomValue(''); setShowCustomForm(false);
    } catch(error) {
      alert("Error adding field: " + error.message);
    }
  };

  const handleDeleteCustomField = async (fieldId) => {
    if(window.confirm("Delete this detail?")) {
      try {
        const updatedFields = selectedCustomer.customFields.filter(f => f.id !== fieldId);
        
        // ✅ फिक्स: Live डिलीट
        const customerRef = ref(db, `vault_data/${currentUid}/${selectedCustomer.id}`);
        await update(customerRef, { customFields: updatedFields });

        setSelectedCustomer({ ...selectedCustomer, customFields: updatedFields });
      } catch(error) {
        alert("Error deleting field: " + error.message);
      }
    }
  };

  const copyText = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    const toast = document.createElement('div');
    toast.className = 'crm-copy-toast';
    const icon = document.createElement('i');
    icon.className = 'fas fa-check-circle';
    toast.append(icon, document.createTextNode(` ${type} Copied`));
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1500);
  };

  // 🆕 TOAST NOTIFICATIONS
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // ⭐ FAVORITE TOGGLE
  const toggleFavorite = (customerId) => {
    const newFavorites = favorites.includes(customerId) 
      ? favorites.filter(id => id !== customerId)
      : [...favorites, customerId];
    setFavorites(newFavorites);
    localStorage.setItem('crm_favorites', JSON.stringify(newFavorites));
    showToast(newFavorites.includes(customerId) ? '⭐ Added to Favorites!' : '✨ Removed from Favorites', 'info');
  };

  // 📝 FORM VALIDATION
  const validateForm = () => {
    const errors = {};
    if (!newCustomer.name.trim()) errors.name = 'नाम आवश्यक है';
    if (newCustomer.phone && !/^[0-9]{10,}$/.test(newCustomer.phone.replace(/\D/g, ''))) {
      errors.phone = 'सही फोन नंबर डालें (कम से कम 10 अंक)';
    }
    if (newCustomer.aadhaar && !/^[0-9]{12}$/.test(newCustomer.aadhaar.replace(/\D/g, ''))) {
      errors.aadhaar = 'आधार 12 अंकों का होना चाहिए';
    }
    if (newCustomer.familyId && !/^[A-Z0-9]{6,}$/.test(newCustomer.familyId)) {
      errors.familyId = 'PPP फॉर्मेट सही नहीं है';
    }
    return Object.keys(errors).length === 0;
  };

  // 📊 SORTING & FILTERING
  const getSortedCustomers = (list) => {
    let sorted = [...list];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'phone') {
      sorted.sort((a, b) => (a.phone || '').localeCompare(b.phone || ''));
    } else {
      sorted.reverse();
    }
    return sorted;
  };

  const getFilteredCustomers = (list) => {
    if (filterBy === 'favorites') return list.filter(c => favorites.includes(c.id));
    if (filterBy === 'with-aadhaar') return list.filter(c => c.aadhaar);
    if (filterBy === 'with-ppp') return list.filter(c => c.familyId);
    return list;
  };

  const filteredCustomers = getSortedCustomers(
    getFilteredCustomers(
      customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm) || 
        (c.familyId && c.familyId.includes(searchTerm))
      )
    )
  );

  // 📓 FORMAT DATE
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const today = new Date();
    const diff = today - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN');
  };

  if (isLoadingAuth) return <div style={{textAlign:'center', padding:'50px', fontWeight:'bold', color:'#3b82f6'}}>Loading Secure Vault...</div>;

  if (!isLoggedIn) {
    return (
      <div className="crm-auth-wrapper" onClick={(e) => { if (e.target === e.currentTarget) router.push('/'); }}>
        <div className="crm-auth-glass">
          <button className="auth-close-btn" onClick={() => router.push('/')} title="Close"><i className="fas fa-times"></i></button>
          <div className="auth-brand-logo"><i className="fas fa-bolt"></i></div>
          <h2 className="auth-title">Nain Live Pro</h2>
          <form onSubmit={handleAuth} className="crm-auth-form">
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <input type="password" placeholder="Master Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            {authError && <div className="crm-error"><i className="fas fa-info-circle"></i> {authError}</div>}
            <button type="submit" className="crm-btn-submit">Access Live Vault <i className="fas fa-arrow-right"></i></button>
          </form>
          <button type="button" className="crm-auth-reset" onClick={handlePasswordReset}>Password bhool gaye? Reset email bhejo</button>
          {resetMessage && <p className="crm-auth-switch">{resetMessage}</p>}
          <p className="crm-auth-switch">Staff login only. Naya account mat banana, purana data usi account se juda hai.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`crm-dashboard-container ${selectedCustomer ? 'detail-open' : ''}`}>
      
      {/* 🌟 Topbar */}
      <div className="crm-topbar">
        <div className="crm-topbar-left">
          <h1><i className="fas fa-bolt text-blue"></i> Live Vault</h1>
          <span className="crm-user-tag"><i className="fas fa-circle live-icon" style={{color: '#10b981'}}></i> {currentUser}</span>
        </div>
        <div className="crm-topbar-right">
          <button className="crm-btn-add" onClick={() => { setNewCustomer({name:'', fatherName:'', phone:'', familyId:'', aadhaar:'', caste:'', address:'', note:''}); setIsEditMode(false); setShowAddForm(true); }}>
            <i className="fas fa-plus"></i> New Client
          </button>
          <button className="crm-btn-logout" onClick={handleLogout} title="Secure Logout"><i className="fas fa-power-off"></i></button>
        </div>
      </div>

      {/* 🔍 Search */}
      <div className="crm-search-section">
        <div className="crm-search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="नाम, फोन, या PPP से खोजें..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="crm-stats-pill">
          {isFetchingData ? 'Syncing...' : `${filteredCustomers.length} Clients`}
        </div>
      </div>

      {/* 🎯 FILTERS & SORT */}
      <div className="filters-bar">
        <div className="filter-dropdown">
          <button className="sort-btn" onClick={() => setShowSortMenu(!showSortMenu)}>
            <i className="fas fa-sort"></i> Sort
          </button>
          {showSortMenu && (
            <div className="dropdown-menu">
              <button className={`dropdown-item ${sortBy === 'latest' ? 'active' : ''}`} onClick={() => {setSortBy('latest'); setShowSortMenu(false);}}>
                <i className="fas fa-clock"></i> Latest
              </button>
              <button className={`dropdown-item ${sortBy === 'name' ? 'active' : ''}`} onClick={() => {setSortBy('name'); setShowSortMenu(false);}}>
                <i className="fas fa-font"></i> By Name
              </button>
              <button className={`dropdown-item ${sortBy === 'phone' ? 'active' : ''}`} onClick={() => {setSortBy('phone'); setShowSortMenu(false);}}>
                <i className="fas fa-phone"></i> By Phone
              </button>
            </div>
          )}
        </div>

        <div className="filter-dropdown">
          <button className={`filter-btn ${filterBy !== 'all' ? 'active' : ''}`} onClick={() => setShowFilterMenu(!showFilterMenu)}>
            <i className="fas fa-filter"></i> Filter
          </button>
          {showFilterMenu && (
            <div className="dropdown-menu">
              <button className={`dropdown-item ${filterBy === 'all' ? 'active' : ''}`} onClick={() => {setFilterBy('all'); setShowFilterMenu(false);}}>
                <i className="fas fa-list"></i> All Customers
              </button>
              <button className={`dropdown-item ${filterBy === 'favorites' ? 'active' : ''}`} onClick={() => {setFilterBy('favorites'); setShowFilterMenu(false);}}>
                <i className="fas fa-heart"></i> Favorites ({favorites.length})
              </button>
              <button className={`dropdown-item ${filterBy === 'with-aadhaar' ? 'active' : ''}`} onClick={() => {setFilterBy('with-aadhaar'); setShowFilterMenu(false);}}>
                <i className="fas fa-id-card"></i> With Aadhaar
              </button>
              <button className={`dropdown-item ${filterBy === 'with-ppp' ? 'active' : ''}`} onClick={() => {setFilterBy('with-ppp'); setShowFilterMenu(false);}}>
                <i className="fas fa-ticket"></i> With PPP
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 📋 Client List */}
      <div className="crm-list-wrapper">
        {isFetchingData ? (
          <div className="empty-state">
            <div className="loading-spinner" style={{margin: '30px auto'}}></div>
            <p style={{marginTop: '20px', color: '#64748b'}}>Live Connection Establish हो रहा है...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><i className="fas fa-inbox"></i></div>
            <h3 className="empty-state-title">कोई ग्राहक नहीं मिला</h3>
            <p className="empty-state-desc">
              {searchTerm ? 'खोज को ठीक करें या' : 'शुरू करने के लिए'} नया ग्राहक जोड़ें
            </p>
            <button className="empty-state-action" onClick={() => setShowAddForm(true)}>
              <i className="fas fa-plus"></i> नया ग्राहक
            </button>
          </div>
        ) : (
          <div className="crm-list">
            {filteredCustomers.map((customer) => (
              <div className={`crm-list-item ${selectedCustomer?.id === customer.id ? 'active-item' : ''}`} key={customer.id}>
                <div className="item-avatar">{customer.name.charAt(0).toUpperCase()}</div>
                <div className="item-details" onClick={() => setSelectedCustomer(customer)} style={{cursor: 'pointer', flex: 1}}>
                  <h4>{customer.name}</h4>
                  <p>{customer.fatherName ? `S/O ${customer.fatherName}` : (customer.phone || 'कोई संपर्क नहीं')}</p>
                  <div style={{marginTop: '6px', fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '8px'}}>
                    <span><i className="fas fa-clock"></i> {formatDate(customer.createdAt)}</span>
                    {customer.aadhaar && <span className="status-badge status-active"><span></span>Aadhaar</span>}
                  </div>
                </div>
                <div className="item-badges">
                  <button 
                    className={`btn-favorite ${favorites.includes(customer.id) ? 'active' : ''}`} 
                    onClick={(e) => {e.stopPropagation(); toggleFavorite(customer.id);}}
                    title="Add to Favorites"
                  >
                    <i className={`${favorites.includes(customer.id) ? 'fas' : 'far'} fa-star`}></i>
                  </button>
                  {customer.familyId && <span className="badge-ppp"><i className="fas fa-ticket-alt"></i> PPP</span>}
                  <i className="fas fa-chevron-right arrow-icon"></i>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ➡️ RIGHT SLIDE-OUT PANEL */}
      <div className={`crm-slide-panel ${selectedCustomer ? 'panel-open' : ''}`}>
        {selectedCustomer && (
          <>
            <div className="slide-panel-header">
              <div className="sph-left">
                <div className="big-avatar">{selectedCustomer.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px'}}>
                    <h2 style={{margin: 0}}>{selectedCustomer.name}</h2>
                    {selectedCustomer.aadhaar && <span className="status-badge status-active"><span></span>Verified</span>}
                  </div>
                  <p>{selectedCustomer.fatherName ? `S/O ${selectedCustomer.fatherName}` : 'ग्राहक प्रोफाइल'}</p>
                  <div className="last-updated"><i className="fas fa-clock"></i> {formatDate(selectedCustomer.createdAt)}</div>
                </div>
              </div>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <button 
                  className={`btn-favorite ${favorites.includes(selectedCustomer.id) ? 'active' : ''}`} 
                  onClick={() => toggleFavorite(selectedCustomer.id)}
                  title="Add to Favorites"
                >
                  <i className={`${favorites.includes(selectedCustomer.id) ? 'fas' : 'far'} fa-star`}></i>
                </button>
                <div className="quick-actions">
                  <button className="quick-btn view" onClick={() => setSelectedCustomer(selectedCustomer)} title="View" style={{display: 'none'}}>
                    <i className="fas fa-eye"></i>
                  </button>
                  <button className="quick-btn edit" onClick={() => handleEditClick(selectedCustomer)} title="Edit Profile"><i className="fas fa-pen"></i></button>
                </div>
                <button className="btn-close-panel" onClick={() => setSelectedCustomer(null)}><i className="fas fa-times"></i></button>
              </div>
            </div>

            {/* 📋 TABS */}
            <div className="panel-tabs">
              <button 
                className={`panel-tab ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <i className="fas fa-user"></i> विवरण
              </button>
              <button 
                className={`panel-tab ${activeTab === 'custom' ? 'active' : ''}`}
                onClick={() => setActiveTab('custom')}
              >
                <i className="fas fa-list"></i> अतिरिक्त
              </button>
            </div>

            <div className="slide-panel-body">
              {/* 📝 PERSONAL TAB */}
              <div className={`tab-content ${activeTab === 'personal' ? 'active' : ''}`}>
                <div className="panel-section">
                  <h3 className="section-title">दस्तावेज़ & पहचान</h3>
                  <div className="data-block" onClick={() => copyText(selectedCustomer.familyId, 'Family ID')}>
                    <div className="db-label">फैमिली आईडी (PPP)</div><div className="db-value">{selectedCustomer.familyId || '---'}</div>
                    {selectedCustomer.familyId && <i className="far fa-copy db-copy"></i>}
                  </div>
                  <div className="data-block" onClick={() => copyText(selectedCustomer.aadhaar, 'Aadhaar')}>
                    <div>
                      <div className="db-label">आधार नंबर</div>
                      <div className="db-value">{selectedCustomer.aadhaar ? (showAadhaar ? selectedCustomer.aadhaar : maskAadhaar(selectedCustomer.aadhaar)) : '---'}</div>
                    </div>
                    {selectedCustomer.aadhaar && (
                      <span className="db-actions">
                        <button
                          type="button"
                          className="db-reveal"
                          aria-label={showAadhaar ? 'Aadhaar hide karo' : 'Aadhaar dikhao'}
                          onClick={(event) => {
                            event.stopPropagation()
                            setShowAadhaar((current) => !current)
                          }}
                        >
                          <i className={`fas ${showAadhaar ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                        <i className="far fa-copy db-copy"></i>
                      </span>
                    )}
                  </div>
                </div>

                <div className="panel-section">
                  <h3 className="section-title">संपर्क & विवरण</h3>
                  <div className="data-block" onClick={() => copyText(selectedCustomer.phone, 'Phone')}>
                    <div className="db-label">मोबाइल नंबर</div><div className="db-value">{selectedCustomer.phone || '---'}</div>
                    {selectedCustomer.phone && <i className="far fa-copy db-copy"></i>}
                  </div>
                  {selectedCustomer.caste && <div className="data-block"><div className="db-label">जाति / श्रेणी</div><div className="db-value">{selectedCustomer.caste}</div></div>}
                  {selectedCustomer.address && <div className="data-block"><div className="db-label">पता</div><div className="db-value">{selectedCustomer.address}</div></div>}
                </div>
              </div>

              {/* ✨ CUSTOM DETAILS TAB */}
              <div className={`tab-content ${activeTab === 'custom' ? 'active' : ''}`}>
                <div className="panel-section custom-details-section">
                  <div className="section-title-flex">
                    <h3 className="section-title" style={{border: 'none', margin: 0, padding: 0}}>अतिरिक्त विवरण</h3>
                    <button className="btn-add-mini-custom" onClick={() => setShowCustomForm(!showCustomForm)}>
                      {showCustomForm ? 'Cancel' : '+ Add'}
                    </button>
                  </div>

                  {showCustomForm && (
                    <div className="custom-field-form">
                      <input type="text" placeholder="Label (e.g. PAN)" value={customLabel} onChange={e => setCustomLabel(e.target.value)} />
                      <input type="text" placeholder="Value (e.g. ABC1234)" value={customValue} onChange={e => setCustomValue(e.target.value)} />
                      <button onClick={handleAddCustomField}><i className="fas fa-bolt"></i></button>
                    </div>
                  )}

                  <div className="custom-fields-list">
                    {(!selectedCustomer.customFields || selectedCustomer.customFields.length === 0) && !showCustomForm && (
                      <p className="no-custom-data">कोई अतिरिक्त विवरण नहीं जोड़ा गया।</p>
                    )}
                    {selectedCustomer.customFields?.map((field) => (
                      <div className="data-block custom-data-block" key={field.id}>
                        <div className="custom-db-inner" onClick={() => copyText(field.value, field.label)}>
                          <div className="db-label">{field.label}</div>
                          <div className="db-value">{field.value}</div>
                          <i className="far fa-copy db-copy"></i>
                        </div>
                        <button className="btn-del-custom" onClick={() => handleDeleteCustomField(field.id)}><i className="fas fa-trash"></i></button>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCustomer.note && (
                  <div className="panel-section">
                    <h3 className="section-title">नोट्स</h3>
                    <div className="data-note-box">{selectedCustomer.note}</div>
                  </div>
                )}
              </div>

              {/* 🗑️ DELETE ACTION */}
              <div className="panel-footer-actions">
                <button className="btn-delete-full" onClick={() => handleDelete(selectedCustomer.id)}>
                  <i className="fas fa-trash-alt"></i> स्थायी रूप से डिलीट करें
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedCustomer && <div className="crm-overlay" onClick={() => setSelectedCustomer(null)}></div>}

      {/* ➕ FLOATING MODAL */}
      {showAddForm && (
        <div className="crm-modal-overlay">
          <div className="crm-modal animation-zoom-in">
            <div className="modal-header">
              <h3><i className={`fas ${isEditMode ? 'fa-pen' : 'fa-bolt'}`}></i> {isEditMode ? 'Edit Live Record' : 'Save Live Record'}</h3>
              <button className="btn-close-modal" onClick={() => setShowAddForm(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSaveCustomer} className="modal-body">
              <div className="modal-grid">
                <div className="input-group"><label>Full Name *</label><input type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} required /></div>
                <div className="input-group"><label>Father's Name</label><input type="text" value={newCustomer.fatherName} onChange={e => setNewCustomer({...newCustomer, fatherName: e.target.value})} /></div>
                <div className="input-group"><label>Mobile Number</label><input type="text" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} /></div>
                <div className="input-group"><label>Family ID (PPP)</label><input type="text" value={newCustomer.familyId} onChange={e => setNewCustomer({...newCustomer, familyId: e.target.value})} /></div>
                <div className="input-group"><label>Aadhaar Number</label><input type="text" value={newCustomer.aadhaar} onChange={e => setNewCustomer({...newCustomer, aadhaar: e.target.value})} /></div>
                <div className="input-group"><label>Caste / Category</label><input type="text" placeholder="e.g. General, BC-A" value={newCustomer.caste} onChange={e => setNewCustomer({...newCustomer, caste: e.target.value})} /></div>
                <div className="input-group full-width"><label>Address / Village</label><input type="text" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} /></div>
                <div className="input-group full-width"><label>Other Notes</label><textarea rows="2" value={newCustomer.note} onChange={e => setNewCustomer({...newCustomer, note: e.target.value})}></textarea></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn-save-modal"><i className={`fas ${isEditMode ? 'fa-sync-alt' : 'fa-bolt'}`}></i> {isEditMode ? 'Update Live' : 'Push to Live'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📢 TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : toast.type === 'error' ? 'exclamation-circle' : toast.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default GrahakVault;