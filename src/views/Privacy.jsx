import React from 'react'

const Privacy = () => {
  return (
    <div>
      <div className="header" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
          <h2 style={{margin: 0, color: 'var(--primary-color)'}}>Privacy Policy</h2>
          <p style={{margin: '5px 0 0 0', fontSize: '14px'}}>Last Updated: October 2026</p>
      </div>

      <div style={{background: 'white', padding: '20px', borderRadius: '12px', lineHeight: '1.8', color: '#444'}}>
        
        <h3 style={{color: '#0d6efd'}}>1. Introduction</h3>
        <p>
          Welcome to <b>Nain CSC & Online Center</b>. We respect your privacy and are committed to protecting your personal data. 
          This privacy policy explains how we handle your documents and information when you visit our shop or use our website.
        </p>

        <h3 style={{color: '#0d6efd'}}>2. Information We Collect</h3>
        <p>
          We may collect the following information when you fill out forms or apply for jobs through us:
        </p>
        <ul style={{marginLeft: '20px'}}>
            <li>Personal Name, Father's Name, Date of Birth.</li>
            <li>Contact Details (Phone Number, Email, Address).</li>
            <li>Government IDs (Aadhar, PAN, Family ID) for form filling purposes only.</li>
            <li>Academic Records (Mark sheets) for admission or job applications.</li>
        </ul>

        <h3 style={{color: '#0d6efd'}}>3. How We Use Your Information</h3>
        <p>
          Your data is used <b>strictly for the service you requested</b> (e.g., applying for a government job, filling a scheme form, or booking a slot). 
          We <b>never</b> share or sell your personal data to third parties for marketing.
        </p>

        <h3 style={{color: '#0d6efd'}}>4. Document Safety</h3>
        <p>
          Any hard copy or soft copy documents provided to us are kept secure. Once the form is filled and the work is completed, 
          we do not retain your original documents unless required for further processing with your permission.
        </p>

        <h3 style={{color: '#0d6efd'}}>5. Cookies</h3>
        <p>
          Our website uses local storage to enhance your experience (e.g., remembering your dark mode preference or last search). 
          We do not use tracking cookies for advertising.
        </p>

        <h3 style={{color: '#0d6efd'}}>6. Staff vault</h3>
        <p>
          The staff-only vault stores customer details needed to fill forms, including name, phone, Family ID, Aadhaar and notes.
          Those records stay in a private Firebase database and are not published on the public pages. Aadhaar numbers stay masked on screen until a signed-in staff member chooses to view them.
          Vault access is limited to existing staff logins.
        </p>

        <h3 style={{color: '#0d6efd'}}>7. Contact Us</h3>
        <p>
          If you have any questions about this Privacy Policy, you can contact us:
        </p>
        <p>
            <b>Dev Nain</b><br/>
          Nain CSC & Online Center, Danoda Kalan<br/>
            Email: dnain81@gmail.com<br/>
            Mobile: +91 8950101037
        </p>

      </div>
    </div>
  )
}

export default Privacy