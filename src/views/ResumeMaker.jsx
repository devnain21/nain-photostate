"use client"

import React, { useState, useRef } from 'react';

const ResumeMaker = () => {
  const fileInputRef = useRef(null); // फोटो अपलोड के लिए रेफरेंस
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // 1. Career Objectives (वही पुराने Professional Objectives)
  const objectives = [
    "To seek an entry-level position to begin my career in a high-level professional environment.",
    "To secure a challenging position in a reputable organization to expand my learnings, knowledge, and skills.",
    "Looking for an opportunity to utilize my skills and contribute to the growth of the organization."
  ];

  // 2. State Management (Photo और Experience के साथ)
  const [photo, setPhoto] = useState(null); // फोटो के लिए
  const [personalInfo, setPersonalInfo] = useState({
    name: '', phone: '', email: '', address: '', dob: '', fatherName: ''
  });
  const [selectedObjective, setSelectedObjective] = useState(objectives[0]);
  
  // Qualifications (पढ़ाई) - डिफ़ॉल्ट 2 बॉक्स
  const [qualifications, setQualifications] = useState([
    { exam: '10th', board: 'HBSE', year: '2018', marks: '80%' },
    { exam: '12th', board: 'HBSE', year: '2020', marks: '75%' }
  ]);

  // Work Experience (अनुभव) - खाली, '+ Add Job' से जुड़ेगा
  const [experience, setExperience] = useState([]); 

  // Skills (स्किल्स) - डिफ़ॉल्ट 2 स्किल्स
  const [skills, setSkills] = useState(['Basic Computer', 'Hindi Typing']);

  // 3. Functions (Add/Remove/Update)

  // 📸 PHOTO FUNCTION: फोटो अपलोड का जादू
  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result); // फोटो का डेटा सेट करें
        setFeedbackMsg('फोटो अपलोड हो गई!');
        setTimeout(() => setFeedbackMsg(''), 2500);
      };
      reader.readAsDataURL(file);
    } else {
      setFeedbackMsg('कृपया कोई सही फोटो (JPG/PNG) चुनें!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  const removePhoto = () => setPhoto(null);

  // Experience Functions (Experience जोड़ने/हटाने के लिए)
  const addExperience = () => setExperience([...experience, { company: '', role: '', duration: '', description: '' }]);
  const removeExperience = (index) => setExperience(experience.filter((_, i) => i !== index));
  const updateExp = (index, field, value) => {
    const newExps = [...experience];
    newExps[index][field] = value;
    setExperience(newExps);
  };

  // Qualification Functions (पढ़ाई जोड़ने/हटाने के लिए)
  const addQualification = () => setQualifications([...qualifications, { exam: '', board: '', year: '', marks: '' }]);
  const removeQualification = (index) => setQualifications(qualifications.filter((_, i) => i !== index));
  const updateQual = (index, field, value) => {
    const newQuals = [...qualifications];
    newQuals[index][field] = value;
    setQualifications(newQuals);
  };

  // Skill Functions (स्किल्स जोड़ने/हटाने के लिए)
  const addSkill = () => setSkills([...skills, '']);
  const removeSkill = (index) => setSkills(skills.filter((_, i) => i !== index));
  const updateSkill = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  // 🖨️ प्रिंट फंक्शन
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="resume-builder-container">
      {/* 📱 MOBILE VIEW TOGGLE TABS (NO-PRINT) */}
      <div className="resume-mobile-switch no-print">
        <button
          type="button"
          className={`resume-switch-btn ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => setMobileTab('editor')}
        >
          <i className="fas fa-edit"></i> 1. फॉर्म भरें
        </button>
        <button
          type="button"
          className={`resume-switch-btn ${mobileTab === 'preview' ? 'active' : ''}`}
          onClick={() => setMobileTab('preview')}
        >
          <i className="fas fa-eye"></i> 2. रिज़्यूमे देखें &amp; प्रिंट
        </button>
      </div>

      {feedbackMsg && (
        <div className="resume-toast-msg no-print">
          {feedbackMsg}
        </div>
      )}

      {/* 👈 LEFT SIDE: INPUT FORM (नो प्रिंट) */}
      <div className={`resume-editor-panel no-print ${mobileTab === 'preview' ? 'mobile-hidden' : ''}`}>
        <div className="editor-header">
          <h2><i className="fas fa-file-signature"></i> Pro Resume Builder</h2>
          <button className="btn-print-master" onClick={handlePrint}>
            <i className="fas fa-print"></i> Print A4 Resume
          </button>
        </div>

        <div className="editor-body">
          
          {/* Photo Upload Section */}
          <div className="form-section">
            <h3><i className="fas fa-camera"></i> Profile Photo</h3>
            <div className="photo-upload-controls">
              {photo ? (
                <div className="photo-preview-wrap">
                  <img src={photo} alt="Profile Preview" className="uploaded-photo-preview"/>
                  <button className="btn-remove-photo" onClick={removePhoto}><i className="fas fa-trash-alt"></i> Remove</button>
                </div>
              ) : (
                <button className="btn-upload-trigger" onClick={() => fileInputRef.current.click()}>
                  <i className="fas fa-cloud-upload-alt"></i> Upload Photo
                </button>
              )}
              <input type="file" accept="image/*" ref={fileInputRef} style={{display: 'none'}} onChange={handlePhotoChange}/>
            </div>
          </div>

          {/* Personal Info */}
          <div className="form-section">
            <h3><i className="fas fa-user-circle"></i> Personal Details</h3>
            <div className="input-grid">
              <input type="text" placeholder="Full Name (उदा: Dev Nain)" onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})} />
              <input type="text" placeholder="Father's Name" onChange={e => setPersonalInfo({...personalInfo, fatherName: e.target.value})} />
              <input type="date" placeholder="Date of Birth" onChange={e => setPersonalInfo({...personalInfo, dob: e.target.value})} />
              <input type="text" placeholder="Mobile Number" onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} />
              <input type="email" placeholder="Email ID" onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})} />
              <input type="text" className="full-width" placeholder="Full Address (Village, Distt)" onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})} />
            </div>
          </div>

          {/* Career Objective */}
          <div className="form-section">
            <h3><i className="fas fa-bullseye"></i> Career Objective</h3>
            <select value={selectedObjective} onChange={(e) => setSelectedObjective(e.target.value)} className="pro-select">
              {objectives.map((obj, i) => (
                <option key={i} value={obj}>Option {i + 1}: {obj.substring(0, 50)}...</option>
              ))}
            </select>
          </div>

          {/* Qualifications */}
          <div className="form-section">
            <h3>
              <i className="fas fa-graduation-cap"></i> Qualifications 
              <button className="btn-add-mini btn-green" onClick={addQualification}>+ Add More</button>
            </h3>
            {qualifications.map((qual, index) => (
              <div className="qual-input-row" key={index}>
                <input type="text" placeholder="Exam" value={qual.exam} onChange={e => updateQual(index, 'exam', e.target.value)} />
                <input type="text" placeholder="Board" value={qual.board} onChange={e => updateQual(index, 'board', e.target.value)} />
                <input type="text" placeholder="Year" value={qual.year} onChange={e => updateQual(index, 'year', e.target.value)} />
                <input type="text" placeholder="%" value={qual.marks} onChange={e => updateQual(index, 'marks', e.target.value)} />
                <button className="btn-remove-mini" onClick={() => removeQualification(index)}><i className="fas fa-minus-circle"></i></button>
              </div>
            ))}
          </div>

          {/* Experience Section */}
          <div className="form-section">
            <h3>
              <i className="fas fa-briefcase"></i> Work Experience
              <button className="btn-add-mini btn-green" onClick={addExperience}>+ Add Job</button>
            </h3>
            {experience.map((exp, index) => (
              <div className="exp-input-block" key={index}>
                <input type="text" placeholder="Company Name" value={exp.company} onChange={e => updateExp(index, 'company', e.target.value)} />
                <input type="text" placeholder="Role (e.g., Data Entry)" value={exp.role} onChange={e => updateExp(index, 'role', e.target.value)} />
                <input type="text" placeholder="Duration (e.g., 2021-2022)" value={exp.duration} onChange={e => updateExp(index, 'duration', e.target.value)} />
                <textarea placeholder="Job Description (Optional)" value={exp.description} onChange={e => updateExp(index, 'description', e.target.value)} rows="2"></textarea>
                <button className="btn-remove-block" onClick={() => removeExperience(index)}><i className="fas fa-times-circle"></i></button>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="form-section">
            <h3>
              <i className="fas fa-tools"></i> Key Skills 
              <button className="btn-add-mini btn-green" onClick={addSkill}>+ Add Skill</button>
            </h3>
            <div className="skills-input-grid">
              {skills.map((skill, index) => (
                <div className="skill-input-wrap" key={index}>
                  <input type="text" placeholder="MS Office, Typing..." value={skill} onChange={e => updateSkill(index, e.target.value)} />
                  <button className="btn-remove-skill" onClick={() => removeSkill(index)}><i className="fas fa-trash-alt"></i></button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 👉 RIGHT SIDE: LIVE A4 PREVIEW (परफेक्ट डिज़ाइन) */}
      <div className={`resume-preview-panel ${mobileTab === 'editor' ? 'mobile-hidden' : ''}`}>
        {/* Quick mobile print floating/inline bar */}
        <div className="resume-preview-mobile-bar no-print">
          <button type="button" className="btn-switch-back" onClick={() => setMobileTab('editor')}>
            <i className="fas fa-arrow-left"></i> फॉर्म में सुधारें
          </button>
          <button type="button" className="btn-print-master" onClick={handlePrint}>
            <i className="fas fa-print"></i> Print / PDF
          </button>
        </div>

        <div className="a4-resume-paper">
          
          {/* 🌟 NEW HEADER: बाईं तरफ़ डेटा, दाईं तरफ़ फोटो */}
          <div className="resume-header-area">
            
            {/* Left Header: Name & Contact */}
            <div className="r-header-text">
              <h1 className="r-name">{personalInfo.name || 'YOUR NAME'}</h1>
              <div className="r-contact-info">
                {personalInfo.address && <span><i className="fas fa-map-marker-alt"></i> {personalInfo.address}</span>}
                {personalInfo.phone && <span><i className="fas fa-phone"></i> +91 {personalInfo.phone}</span>}
                {personalInfo.email && <span><i className="fas fa-envelope"></i> {personalInfo.email}</span>}
              </div>
            </div>

            {/* Right Header: Photo */}
            <div className="r-photo-wrap">
              {photo ? (
                <img src={photo} alt="Profile" className="r-photo"/>
              ) : (
                <div className="r-photo-placeholder"><i className="fas fa-user"></i></div>
              )}
            </div>

          </div>

          <div className="resume-body-area">
            
            {/* Objective */}
            <div className="r-section">
              <h2 className="r-heading">Career Objective</h2>
              <p className="r-text">{selectedObjective}</p>
            </div>

            {/* Personal Details */}
            <div className="r-section">
              <h2 className="r-heading">Personal Information</h2>
              <table className="r-table-info">
                <tbody>
                  <tr><td className="r-label">Father's Name</td><td>: {personalInfo.fatherName || '-'}</td></tr>
                  <tr><td className="r-label">Date of Birth</td><td>: {personalInfo.dob || '-'}</td></tr>
                  <tr><td className="r-label">Nationality</td><td>: Indian</td></tr>
                  <tr><td className="r-label">Languages Known</td><td>: Hindi, English</td></tr>
                </tbody>
              </table>
            </div>

            {/* Qualifications (पढ़ाई) */}
            <div className="r-section">
              <h2 className="r-heading">Educational Qualifications</h2>
              <table className="r-table-edu">
                <thead>
                  <tr><th>Examination</th><th>Board / University</th><th>Year</th><th>Marks %</th></tr>
                </thead>
                <tbody>
                  {qualifications.map((q, i) => (
                    <tr key={i}>
                      <td>{q.exam || '-'}</td><td>{q.board || '-'}</td><td>{q.year || '-'}</td><td>{q.marks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Experience Section (अनुभव) */}
            {experience.length > 0 && (
              <div className="r-section">
                <h2 className="r-heading">Work Experience</h2>
                {experience.map((exp, i) => (
                  <div className="r-exp-item" key={i}>
                    <div className="r-exp-header">
                      <strong className="r-company">{exp.company || 'Company Name'}</strong>
                      <span className="r-duration">({exp.duration || 'Duration'})</span>
                    </div>
                    <div className="r-exp-role">{exp.role || 'Job Role'}</div>
                    {exp.description && <p className="r-exp-desc">{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="r-section">
                <h2 className="r-heading">Key Skills</h2>
                <ul className="r-list">
                  {skills.map((s, i) => s && <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {/* Declaration */}
            <div className="r-section" style={{marginTop: 'auto', paddingTop: '30px'}}>
              <h2 className="r-heading">Declaration</h2>
              <p className="r-text">I hereby declare that the above-mentioned information is true to the best of my knowledge and belief.</p>
              
              <div className="r-signature-area">
                <div className="r-date-place">
                  <p>Date: ______</p>
                  <p>Place: ______</p>
                </div>
                <div className="r-sign">
                  <p>(Signature)</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeMaker;