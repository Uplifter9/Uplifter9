import React, { useState } from 'react';
import './App.css';

const API_URL = 'http://127.0.0.1:5001';

// Helper to get Hebrew alphabet character by index
const getHebrewChar = (index) => {
  const hebrewAlphabet = 'אבגדהוזחטיכלמנסעפצקרשת';
  if (index < hebrewAlphabet.length) {
    return hebrewAlphabet[index];
  }
  const primaryIndex = Math.floor(index / hebrewAlphabet.length) - 1;
  const secondaryIndex = index % hebrewAlphabet.length;
  return getHebrewChar(primaryIndex) + getHebrewChar(secondaryIndex);
};

function App() {
  const [files, setFiles] = useState([]);
  const [fontSize, setFontSize] = useState(48);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const result = await response.json();

      const newFiles = result.files.map((fileInfo, index) => {
        const newIndex = files.length + index;
        return {
          name: fileInfo.name,
          id: `${fileInfo.name}-${newIndex}`,
          title: `נספח ${getHebrewChar(newIndex)}'`,
        };
      });

      setFiles(prevFiles => [...prevFiles, ...newFiles]);

    } catch (error) {
      console.error('Error uploading files:', error);
      alert('שגיאה בהעלאת קבצים. אנא נסה שוב.');
    }
  };

  const handleTitleChange = (id, newTitle) => {
    setFiles(files.map(item => item.id === id ? { ...item, title: newTitle } : item));
  };

  const handleGenerateClick = async () => {
    if (files.length === 0) return;
    setIsGenerating(true);

    const payload = {
      files: files.map(f => ({ name: f.name, title: f.title })),
      fontSize: fontSize,
    };

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

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
      <h1>מחולל נספחים</h1>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="font-size-slider">גודל גופן לכותרת: {fontSize}pt</label>
          <input
            type="range"
            id="font-size-slider"
            className="font-slider"
            min="4"
            max="168"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
          />
        </div>
      </div>

      <div className="file-uploader" onClick={() => document.getElementById('file-input').click()}>
        <p>גרור קבצים לכאן או לחץ כדי לבחור</p>
        <input
          type="file"
          id="file-input"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="file-list">
        {files.map((item) => (
          <div key={item.id} className="file-item">
            <span>{item.name}</span>
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleTitleChange(item.id, e.target.value)}
              placeholder="שם הנספח"
            />
          </div>
        ))}
      </div>

      {files.length > 0 && (
        <div className="actions">
          <button onClick={handleGenerateClick} disabled={isGenerating}>
            {isGenerating ? 'מעבד...' : 'צור PDF עם כל הנספחים'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
