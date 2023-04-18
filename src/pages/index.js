import React, { useState } from 'react';
import axios from 'axios';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Home = () => {
  const [resumeText, setResumeText] = useState('');
  const [careerField, setCareerField] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file.type === 'application/pdf') {
      setFile(file);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdfDocument = await pdfjs.getDocument(e.target.result).promise;
        setNumPages(pdfDocument.numPages);

        let resumeText = '';
        for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
          const page = await pdfDocument.getPage(pageNum);
          const textContent = await page.getTextContent();
          resumeText += textContent.items.map((item) => item.str).join(' ');
        }
        setResumeText(resumeText);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a PDF file.');
    }
  };

  const analyzeResume = async () => {
    setLoading(true);

    try {
      const response = await axios.post('/api/reviewResume', {
        resumeText,
        careerField,
        yearsOfExperience,
      });
      setSuggestions(response.data.issues);
    } catch (error) {
      console.error('Error analyzing resume:', error.response.data);
    }

    setLoading(false);
  };

  const handleCareerFieldChange = (event) => {
    setCareerField(event.target.value);
  };

  const handleYearsOfExperienceChange = (event) => {
    setYearsOfExperience(event.target.value);
  };

  return (
    <div>
      <h1>Resume Analyzer</h1>
      <input
        type="text"
        placeholder="Career Field"
        value={careerField}
        onChange={handleCareerFieldChange}
      />
      <br />
      <input
        type="number"
        placeholder="Years of Experience"
        value={yearsOfExperience}
        onChange={handleYearsOfExperienceChange}
      />
      <br />
      <input type="file" onChange={handleFileChange} />
      {file && (
        <div>
          <h2>Uploaded Resume</h2>
          <Document
            file={file}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            {Array.from(new Array(numPages), (_, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document>
        </div>
      )}
      <button onClick={analyzeResume} disabled={loading}>
        Analyze
      </button>
      {loading && <p>Loading...</p>}
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
