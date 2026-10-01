"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const AgeCalculator = () => {
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setTargetDate(new Date().toISOString().split('T')[0])
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [])

  const calculateAge = () => {
    if (!dob || !targetDate) {
      alert("⚠️ कृपया दोनों तारीख चुनें!");
      return;
    }
    const d1 = new Date(dob);
    const d2 = new Date(targetDate);

    if (d1 > d2) {
      alert("⚠️ जन्म तिथि, टार्गेट डेट से पहले की होनी चाहिए!");
      return;
    }

    // 1. Basic Age Calculation (Years, Months, Days)
    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();

    if (days < 0) {
      months--;
      days += new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // 2. Pro Level Calculation (Total Days, Weeks, Hours)
    // d1 aur d2 ke beech ka fark (Milliseconds mein)
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;

    setResult({ 
      years, months, days, 
      totalDays, totalWeeks, totalHours 
    });
  }

  return (
    <div className="calc-page-container">
      
      <div className="back-btn-container">
         <Link href="/tools" className="pro-back-btn"><i className="fas fa-arrow-left"></i> Back to Tools</Link>
      </div>

      <div className="pro-calc-card">
        <div className="calc-header">
          <div className="calc-icon"><i className="fas fa-hourglass-half"></i></div>
          <h2>Age Calculator Pro</h2>
          <p>सटीक उम्र और इन-डेप्थ डिटेल्स (दिन, हफ्ते, घंटे) निकालें</p>
        </div>

        <div className="calc-body">
          <div className="pro-input-group">
            <label>जन्म तिथि (Date of Birth)</label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="pro-date-input" />
          </div>

          <div className="pro-input-group">
            <label>किस तारीख तक? (Target Date)</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="pro-date-input" />
          </div>

          <button className="pro-calc-btn" onClick={calculateAge}>
            <i className="fas fa-sync-alt"></i> Calculate Exact Age
          </button>

          {/* 🚀 VIP Result Blocks */}
          {result && (
            <div className="pro-result-box animation-slide-up">
              
              {/* Main Result */}
              <h3><i className="fas fa-check-circle"></i> Final Calculation</h3>
              <div className="result-grid">
                <div className="res-item box-year">
                   <span className="res-num">{result.years}</span>
                   <span className="res-label">Years (साल)</span>
                </div>
                <div className="res-item box-month">
                   <span className="res-num">{result.months}</span>
                   <span className="res-label">Months (महीने)</span>
                </div>
                <div className="res-item box-day">
                   <span className="res-num">{result.days}</span>
                   <span className="res-label">Days (दिन)</span>
                </div>
              </div>

              {/* 📊 Extra In-Depth Stats (NEW) */}
              <div className="extra-stats-container">
                <h4><i className="fas fa-chart-pie"></i> In-Depth Stats</h4>
                <div className="extra-stats-grid">
                  <div className="stat-box">
                    <i className="fas fa-calendar-day stat-icon" style={{color: '#f59e0b'}}></i>
                    {/* toLocaleString() se numbers mein comma aayega (jaise 10,000) */}
                    <span className="stat-value">{result.totalDays.toLocaleString('en-IN')}</span>
                    <span className="stat-label">Total Days</span>
                  </div>
                  <div className="stat-box">
                    <i className="fas fa-calendar-week stat-icon" style={{color: '#8b5cf6'}}></i>
                    <span className="stat-value">{result.totalWeeks.toLocaleString('en-IN')}</span>
                    <span className="stat-label">Total Weeks</span>
                  </div>
                  <div className="stat-box">
                    <i className="fas fa-clock stat-icon" style={{color: '#ec4899'}}></i>
                    <span className="stat-value">{result.totalHours.toLocaleString('en-IN')}</span>
                    <span className="stat-label">Total Hours</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgeCalculator;