import React, { useState } from 'react';
import { FiUploadCloud, FiFileText, FiImage, FiTrash2, FiChevronsRight } from 'react-icons/fi';
import { FaFilePdf } from 'react-icons/fa';
import './App.css';

const API_URL = 'http://127.0.0.1:5001';

const getHebrewChar = (index) => {
  const hebrewAlphabet = 'אבגדהוזחטיכלמנסעפצקרשת';
  if (index < hebrewAlphabet.length) {
    return hebrewAlphabet[index];
  }
  const primaryIndex = Math.floor(index / hebrewAlphabet.length) - 1;
  const secondaryIndex = index % hebrewAlphabet.length;
  return getHebrewChar(primaryIndex) + getHebrewChar(secondaryIndex);
};

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  if (extension === 'pdf') {
    return <FaFilePdf className="file-icon" style={{ color: '#E53E3E' }} />;
  }
  if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
    return <FiImage className="file-icon" style={{ color: '#48BB78' }} />;
  }
  return <FiFileText className="file-icon" />;
};

const FONT_OPTIONS = [
  { value: 'DavidLibre', label: 'דוד ליברה (David Libre)' },
  { value: 'FrankRuhlLibre', label: 'פרנק ריהל ליברה (Frank Ruhl Libre)' },
  { value: 'Heebo', label: 'היבו (Heebo)' },
];

function App() {
  const [files, setFiles] = useState([]);
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (selectedFiles) => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('File upload failed');
      const result = await response.json();

      const newFiles = result.files.map((fileInfo, index) => ({
        name: fileInfo.name,
        id: `${fileInfo.name}-${Date.now()}-${index}`,
        title: `נספח ${getHebrewChar(files.length + index)}'`,
      }));

      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('שגיאה בהעלאת קבצים. אנא נסה שוב.');
    }
  };

  const handleFileChange = (event) => {
    processFiles(Array.from(event.target.files));
  };

  const handleRemoveFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleTitleChange = (id, newTitle) => {
    setFiles(files.map(item => item.id === id ? { ...item, title: newTitle } : item));
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const handleGenerateClick = async () => {
    if (files.length === 0) return;
    setIsGenerating(true);

    const payload = {
      files: files.map(f => ({ name: f.name, title: f.title })),
      fontSize: fontSize,
      fontFamily: fontFamily,
    };

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'נספחים.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('שגיאה ביצירת ה-PDF. אנא בדוק את המסוף לקבלת פרטים.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>מחולל נספחים מקצועי</h1>
        <p>העלה קבצים, סדר אותם, והפק מסמך PDF מאוחד בקלות</p>
      </header>

      <main>
        <div className="controls-container">
          <div className="control-group">
            <label htmlFor="font-family-select">בחר גופן (פונט)</label>
            <select id="font-family-select" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={{padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)'}}>
              {FONT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="font-size-slider">גודל גופן לכותרת: {fontSize}pt</label>
            <input type="range" id="font-size-slider" className="font-slider" min="4" max="168" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
          </div>
        </div>

        <div className={`file-uploader ${isDragging ? 'drag-over' : ''}`} onClick={() => document.getElementById('file-input').click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          <div className="file-uploader-content">
            <FiUploadCloud size={50} />
            <p>גרור ושחרר קבצים כאן, או לחץ לבחירה</p>
          </div>
          <input type="file" id="file-input" multiple onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

        {files.length > 0 && (
          <div className="file-list">
            {files.map((item) => (
              <div key={item.id} className="file-item">
                <div className="file-info">
                  {getFileIcon(item.name)}
                  <span>{item.name}</span>
                  <input type="text" value={item.title} onChange={(e) => handleTitleChange(item.id, e.target.value)} placeholder="שם הנספח" />
                </div>
                <div className="file-item-actions">
                  <button onClick={() => handleRemoveFile(item.id)} title="הסר קובץ">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="actions">
            <button className="generate-button" onClick={handleGenerateClick} disabled={isGenerating}>
              {isGenerating ? 'מעבד...' : 'הפק את מסמך ה-PDF'}
              {!isGenerating && <FiChevronsRight />}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
