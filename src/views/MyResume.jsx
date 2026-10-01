"use client"

import React from 'react';
import { withBasePath } from '../lib/seo'

const MyResume = () => {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="resume-fullscreen-wrapper">
      
      {/* Print Button */}
      <button onClick={handlePrint} className="print-btn">
        <i className="fa-solid fa-print"></i> Print Resume
      </button>

      {/* --- CSS Styles --- */}
      <style>{`
        /* --- SCREEN STYLES (Jab computer par dekh rahe ho) --- */
        
        .resume-fullscreen-wrapper {
            position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            background-color: #525659; z-index: 9999; overflow-y: auto;
            display: flex; justify-content: center; padding: 30px 0;
        }

        .print-btn {
            position: fixed; bottom: 30px; right: 30px; background-color: #ff5722;
            color: white; border: none; padding: 15px 25px; border-radius: 50px;
            font-size: 18px; font-weight: bold; cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 10000;
            display: flex; align-items: center; gap: 10px;
        }
        .print-btn:hover { background-color: #e64a19; transform: scale(1.05); }

        .resume-container {
            display: flex; width: 210mm; min-height: 297mm; height: auto;
            background-color: white; box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }

        /* Left Side */
        .left-side { width: 32%; background-color: #1e293b; color: #fff; padding: 30px 20px; display: flex; flex-direction: column; gap: 25px; }
        .photo-container { width: 160px; height: 160px; margin: 0 auto; border-radius: 50%; border: 5px solid #334155; overflow: hidden; background-color: #fff; }
        .photo-container img { width: 100%; height: 100%; object-fit: cover; }
        .left-title { font-size: 18px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; margin-bottom: 15px; border-bottom: 2px solid #38bdf8; padding-bottom: 5px; }
        .contact-item { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-size: 13px; word-break: break-all; }
        .contact-item i { color: #38bdf8; font-size: 16px; width: 20px; }
        .contact-item a { color: #fff; text-decoration: none; }
        .skills-list li { list-style: none; margin-bottom: 10px; font-size: 14px; }
        .progress-bar { width: 100%; height: 6px; background-color: #334155; margin-top: 5px; border-radius: 3px; }
        .progress-fill { height: 100%; background-color: #38bdf8; border-radius: 3px; }
        .edu-item { margin-bottom: 15px; }
        .edu-degree { font-weight: 600; font-size: 14px; color: #38bdf8; }
        .edu-college { font-size: 13px; }

        /* Right Side */
        .right-side { width: 68%; padding: 40px; background-color: #fff; }
        .header-name h1 { font-size: 42px; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; line-height: 1.1; }
        .header-name .role { font-size: 18px; color: #0ea5e9; font-weight: 600; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; }
        .summary { margin-top: 25px; font-size: 14px; color: #475569; line-height: 1.6; text-align: justify; }
        .right-title { font-size: 20px; color: #1e293b; text-transform: uppercase; font-weight: 700; margin-top: 35px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .right-title i { color: #0ea5e9; }
        .timeline-box { border-left: 3px solid #e2e8f0; padding-left: 20px; margin-bottom: 25px; position: relative; }
        .timeline-box::before { content: ''; width: 12px; height: 12px; background-color: #0ea5e9; border-radius: 50%; position: absolute; left: -7.5px; top: 5px; }
        .job-title { font-size: 18px; font-weight: 700; color: #1e293b; }
        .job-company { font-size: 14px; color: #64748b; font-weight: 600; margin-bottom: 10px; }

        /* Job Details List */
        .experience-list { margin-top: 8px; padding-left: 5px; display: block !important; }
        .experience-list li { list-style: none; font-size: 14px !important; color: #475569 !important; margin-bottom: 6px; line-height: 1.5; position: relative; padding-left: 15px; display: block !important; }
        .experience-list li::before { content: '›'; font-weight: bold; color: #0ea5e9; position: absolute; left: 0; top: 0; }

        /* Lang & Interests */
        .lang-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px; }
        .info-list li { list-style: none; font-size: 15px; color: #1e293b !important; margin-bottom: 8px; padding-left: 0; font-weight: 500; display: flex; align-items: center; gap: 8px; }
        .info-list li::before { content: ''; display: inline-block; width: 8px; height: 8px; background-color: #0ea5e9; border-radius: 50%; }

        /* Mobile */
        @media (max-width: 768px) {
            .resume-container { flex-direction: column; width: 95%; height: auto; margin-bottom: 80px; }
            .left-side, .right-side { width: 100%; }
            .photo-container { width: 120px; height: 120px; }
            .lang-grid { grid-template-columns: 1fr; gap: 10px; }
        }

        /* --- 🖨️ PRINT MAGIC CSS (Ye wala part sabse zaroori hai) --- */
        @media print {
            
            /* 1. Body ke andar ki har cheez ko GAYAB kar do */
            body * {
                visibility: hidden;
            }

            /* 2. Sirf Resume Container aur uske andar ka maal dikhao */
            .resume-container, .resume-container * {
                visibility: visible;
            }

            /* 3. Resume ko pakad kar page ke kone (Top-Left) me set karo */
            .resume-container {
                position: absolute;
                left: 0;
                top: 0;
                margin: 0;
                padding: 0;
                width: 100%;
                /* Shadow hatana zaroori hai print me */
                box-shadow: none !important; 
                border: none !important;
            }

            /* 4. Wrapper ko beech me se hatao taki wo rokaawat na bane */
            .resume-fullscreen-wrapper {
                position: static;
                background: none;
                display: block;
                height: auto;
                width: auto;
                overflow: visible;
            }

            /* 5. Print Button ko chupao */
            .print-btn {
                display: none !important;
            }

            /* 6. Colours aur Graphics ko force karo */
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            /* 7. Page ka margin Zero kar do */
            @page {
                margin: 0;
                size: auto;
            }
        }
      `}</style>

      {/* --- HTML Structure --- */}
      <div className="resume-container">
        
        {/* Left Side */}
        <div className="left-side">
          <div className="photo-container">
            <img src={withBasePath('/images/Photo.jpg')} id="myProfilePhoto" alt="Dev Nain" />
          </div>
          <div>
            <h3 className="left-title">Contact</h3>
            <div className="contact-item"><i className="fa-solid fa-phone"></i> <span>+91 8950101037</span></div>
            <div className="contact-item"><i className="fa-solid fa-envelope"></i> <span>dnain81@gmail.com</span></div>
            <div className="contact-item"><i className="fa-solid fa-location-dot"></i> <span>Danoda Kalan, Haryana</span></div>
            <div className="contact-item"><i className="fa-solid fa-globe"></i> <span>naincsc.in</span></div>
          </div>
          <div>
            <h3 className="left-title">Skills</h3>
            <ul className="skills-list">
              <li>HTML5 & CSS3 <div className="progress-bar"><div className="progress-fill" style={{width: '90%'}}></div></div></li>
              <li style={{marginTop:'10px'}}>JavaScript (ES6) <div className="progress-bar"><div className="progress-fill" style={{width: '75%'}}></div></div></li>
              <li style={{marginTop:'10px'}}>WordPress / CMS <div className="progress-bar"><div className="progress-fill" style={{width: '85%'}}></div></div></li>
              <li style={{marginTop:'10px'}}>Responsive Design <div className="progress-bar"><div className="progress-fill" style={{width: '95%'}}></div></div></li>
              <li style={{marginTop:'10px'}}>Photo Editing <div className="progress-bar"><div className="progress-fill" style={{width: '80%'}}></div></div></li>
            </ul>
          </div>
          <div>
            <h3 className="left-title">Education</h3>
            <div className="edu-item"><div className="edu-degree">B.Sc. Computer Science</div><div className="edu-college">MDU, Rohtak</div></div>
            <div className="edu-item"><div className="edu-degree">12th (Non-Medical)</div><div className="edu-college">HBSE, Bhiwani</div></div>
          </div>
        </div>

        {/* Right Side */}
        <div className="right-side">
          <div className="header-name">
            <h1>Dev Nain</h1>
            <div className="role">Front-End Web Developer</div>
          </div>
          <div className="summary">
            Driven and skilled Web Developer with a strong background in creating responsive, user-friendly websites. Currently managing my own digital service portal (Nain CSC) built with HTML, CSS, and JS. Expertise in WordPress customization and solving real-world problems through code. Eager to contribute to a professional team with my technical and design skills.
          </div>

          <h3 className="right-title"><i className="fa-solid fa-briefcase"></i> Experience</h3>

          <div className="timeline-box">
            <div className="job-title">Web Developer (Freelance)</div>
            <div className="job-company">Self-Employed (Nain CSC Center) | Oct 2023 - Present</div>
            <ul className="experience-list">
              <li>Designed and deployed <b>Nain CSC Official Portal</b> (naincsc.in) using HTML5, CSS3, and JavaScript.</li>
              <li>Created a dynamic "Offline Form Download" section and integrated LPG ID finder tools.</li>
              <li>Implemented a responsive Grid Layout ensuring the site works perfectly on Mobile and Desktop.</li>
            </ul>
          </div>

          <div className="timeline-box">
            <div className="job-title">WordPress Developer</div>
            <div className="job-company">Freelance Project | 2022 - 2023</div>
            <ul className="experience-list">
              <li>Developed and customized a WordPress-based CMS for online services.</li>
              <li>Configured themes and plugins to improve SEO and site speed.</li>
            </ul>
          </div>

          <div className="lang-grid">
            <div>
              <h3 className="right-title" style={{marginTop: 0}}><i className="fa-solid fa-language"></i> Languages</h3>
              <ul className="info-list">
                <li>Hindi (Native)</li>
                <li>English (Professional)</li>
              </ul>
            </div>
            <div>
              <h3 className="right-title" style={{marginTop: 0}}><i className="fa-solid fa-heart"></i> Interests</h3>
              <ul className="info-list">
                <li>Coding & Development</li>
                <li>Photo Editing & Design</li>
                <li>Cricket</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyResume;