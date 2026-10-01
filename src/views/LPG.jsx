import React from 'react'
import Link from 'next/link'
import MenuGrid from '../components/MenuGrid'


const LPG = () => {
  return (
    <div>
        <div className="header" style={{background:'none', border:'none', padding:'10px'}}>
            <h2 style={{textAlign:'center', color:'#0d6efd'}}>Select Your Gas Provider</h2>
        </div>

        {/* LPG Grid */}
        <MenuGrid items={[
  {
    title: "Bharat Gas (Find LPG ID)",
    icon: "fas fa-burn",
    url: "https://my.ebharatgas.com/bharatgas/LPGServices/FindLPGID",
    external: true
  },
  {
    title: "HP Gas (Find LPG ID)",
    icon: "fas fa-fire-alt",
    url: "https://myhpgas.in/myHPGas/HPGas/FindYourLPGID.aspx",
    external: true
  },
  {
    title: "Indane Gas (Find LPG ID)",
    icon: "fas fa-fire",
    url: "https://cx.indianoil.in/webcenter/portal/LPG/pages_findyourlpgid",
    external: true
  }
]} />


        <div style={{textAlign: 'center', marginTop: '30px'}}>
            <Link href="/" style={{color: '#0d6efd', textDecoration: 'none', fontWeight: '600'}}>
                <i className="fas fa-arrow-left"></i> Back to Home Page
            </Link>
        </div>
    </div>

  )
}

export default LPG