import { useState, useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios';
import './App.css';

function App() {
  const [code, setCode] = useState(`function sum() { return 1 + 1 }`);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/ai/get-review', { code });
      setReview(response.data);
    } catch (error) {
      setReview('⚠️ Error: Could not generate content.');
    } finally {
      setIsLoading(false);
    }
  }

  const downloadReview = () => {
    if (!review) return;
    
    const element = document.createElement("a");
    const file = new Blob([review], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `code-review-${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <main>
      <div className="left">
        <div className="section-header">
          <div className="title-container">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m0 0V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" stroke="#4cc9f0" strokeWidth="2"/>
            </svg>
            <h2>Code Editor or FAQ by AI</h2>
          </div>
          <p className="subtitle">Write or paste your code OR Ask any question(with @)</p>
        </div>
        
        <div className="code">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
            padding={15}
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: 14,
              backgroundColor: '#0f0f1a',
              minHeight: '100%'
            }}
          />
        </div>
        
        <button 
          onClick={reviewCode}
          className="review-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="loader"></div>
          ) : (
            'Review Code'
          )}
        </button>
      </div>

      <div className="right">
        <div className="section-header">
          <div className="title-container">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#b084eb" strokeWidth="2"/>
              <path d="M14 2v6h6" stroke="#b084eb" strokeWidth="2"/>
            </svg>
            <h2>Code Review or Your FAQ answer</h2>
            <button 
              onClick={downloadReview}
              className="download-btn"
              disabled={!review}
              title="Download as Markdown"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V3m0 12l-4-4m4 4l4-4m2 8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <p className="subtitle">AI-generated code review or your FAQ answer will appear here</p>
        </div>
        
        <div className="output-content">
          <Markdown rehypePlugins={[rehypeHighlight]}>
            {review || 'Your code review will appear here after clicking "Review Code"'}
          </Markdown>
        </div>
      </div>
    </main>
  );
}

export default App;