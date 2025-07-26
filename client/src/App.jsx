import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import VideoAnalysis from './components/VideoAnalysis';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [videoData, setVideoData] = useState(null);

  // Restore saved state
  useEffect(() => {
    const savedState = localStorage.getItem('videoAnalysisState');
    if (savedState) {
      const { videoData: savedVideoData } = JSON.parse(savedState);
      if (savedVideoData) {
        setVideoData(savedVideoData);
        setCurrentPage('analysis');
      }
    }
  }, []);

  const handleVideoSubmit = (data) => {
    // Normalize so VideoAnalysis always gets video_id at top level
    const normalizedData = {
      ...data,
      video_id: data.video_id || data.analysis?.video_id || '', // fallback
    };

    setVideoData(normalizedData);
    setCurrentPage('analysis');
    localStorage.setItem('videoAnalysisState', JSON.stringify({ videoData: normalizedData }));
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    setVideoData(null);
    localStorage.removeItem('videoAnalysisState');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        {currentPage === 'landing' ? (
          <>
            <Header />
            <main>
              <Hero onVideoSubmit={handleVideoSubmit} />
              <Features />
              <HowItWorks />
              <FAQ />
              <Contact />
            </main>
            <Footer />
          </>
        ) : (
          <VideoAnalysis 
            videoData={videoData} 
            onBack={handleBackToLanding}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
