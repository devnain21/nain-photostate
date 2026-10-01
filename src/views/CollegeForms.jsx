import React from 'react'
import Link from 'next/link'
import MenuGrid from '../components/MenuGrid'

const CollegeForms = () => {
  const universityLinks = [
    // --- IGNOU PORTALS ---
    { title: "IGNOU Admission", icon: "fas fa-user-plus", url: "https://ignou-admission.samarth.edu.in/", external: true },
    { title: "IGNOU Fees/Re-Reg", icon: "fas fa-file-invoice-dollar", url: "https://onlinerr.ignou.ac.in/", external: true },

    // --- KUK PORTALS ---
    { title: "KUK Main Site", icon: "fas fa-university", url: "https://www.kuk.ac.in/", external: true },

    // --- MDU PORTALS ---
    { title: "MDU Admission", icon: "fas fa-door-open", url: "https://admission.mdu.ac.in/", external: true },
    { title: "MDU Student Login", icon: "fas fa-user-lock", url: "https://student.mdu.ac.in/", external: true },

    // --- GJU PORTALS ---
    { title: "GJU Admission", icon: "fas fa-graduation-cap", url: "http://www.gjust.ac.in/", external: true },
    

    // --- PU CHANDIGARH ---
    { title: "PU Chandigarh", icon: "fas fa-school", url: "https://puchd.ac.in/", external: true },
    { title: "PU Fees Portal", icon: "fas fa-pen-nib", url: "https://payonline.puchd.ac.in/", external: true },

    // --- OTHER IMPORTANT PORTALS ---
    { title: "ABC / APAAR ID", icon: "fas fa-id-card", url: "https://www.abc.gov.in/", external: true },
    { title: "Higher Edu Haryana", icon: "fas fa-landmark", url: "https://admissions.highereduhry.ac.in/", external: true },
    { title: "DigiLocker", icon: "fas fa-folder-open", url: "https://www.digilocker.gov.in/", external: true },
    { title: "CDLU Sirsa", icon: "fas fa-building", url: "https://www.cdlu.ac.in/", external: true },
    { title: "CBLU Bhiwani", icon: "fas fa-book", url: "https://cblu.ac.in/", external: true },
    { title: "CRSU Jind", icon: "fas fa-map-marked-alt", url: "https://crsu.ac.in/", external: true }
  ]

  return (
    <div className="page college-forms">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#0d6efd', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <i className="fas fa-university"></i> University & Fees Portal
        </h2>
        <p style={{ color: '#1e293b', fontWeight: '700', fontSize: '14px' }}>
          Admission, Semester Fees और Student Login के सभी लिंक यहाँ हैं।
        </p>
      </div>

      <MenuGrid items={universityLinks} />

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link href="/" className="nav-btn" style={{ 
            display: 'inline-block', 
            textDecoration: 'none',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            padding: '10px 25px',
            borderRadius: '8px',
            color: '#0d6efd',
            fontWeight: '700'
        }}>
           <i className="fas fa-arrow-left"></i> Back to Home
        </Link>
      </div>
    </div>
  )
}

export default CollegeForms