import React, { useState } from 'react';
import axios from 'axios';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { RotatingTriangles } from 'react-loader-spinner';

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
    <div className="container">
      <h1>Resume Analyzer</h1>
      <input
        type="text"
        placeholder="Career Field"
        className="input"
        value={careerField}
        onChange={handleCareerFieldChange}
      />
      <br />
      <input
        type="number"
        placeholder="Years of Experience"
        className="input"
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
      <button onClick={analyzeResume} disabled={loading} className="button">
        Analyze
      </button>
      {loading && (
        <div className="loading">
          <RotatingTriangles
            visible={true}
            height="80"
            width="80"
            ariaLabel="rotating-triangels-loading"
            wrapperStyle={{}}
            wrapperClass="rotating-triangels-wrapper"
          />
          <p>Loading...</p>
        </div>
      )}
      <ul className="suggestions">
        {suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
      <div className="donation-section">
        <h2>Support Our Work</h2>
        <p>
          We're glad you're finding this Resume Analyzer helpful! We developed this tool to support job seekers like you.
          However, running this service involves some costs. For example, each time the tool analyzes a resume, it makes an API call which incurs a cost. 
          To keep this service free and accessible to all, we're relying on the generosity of users who are able to contribute.
        </p>
        <p>
          If you're in a position to do so, please consider supporting our work. Any contribution, no matter how small, can make a big difference and allow us to continue improving and maintaining this tool. 
          Thank you for your support!
        </p>
        <a href="https://www.buymeacoffee.com/thebranch" target="_blank" rel="noopener noreferrer">
          <img 
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
            alt="Buy Me A Coffee" 
            style={{height: 50, width: 217}}
          />
        </a>
      </div>
    </div>
  );
};

export default Home;
