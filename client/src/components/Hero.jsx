import React, { useState } from 'react';
import { Link, Search, Sparkles } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { analyzeVideo } from '../services/api';

const Hero = ({ onVideoSubmit }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [titleRef, titleVisible] = useScrollAnimation();
  const [subtitleRef, subtitleVisible] = useScrollAnimation();
  const [formRef, formVisible] = useScrollAnimation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await analyzeVideo(youtubeUrl);
      if (!result?.analysis) {
        throw new Error('No analysis data received');
      }
      onVideoSubmit(result);
    } catch (err) {
      setError(err.message || 'Failed to analyze video');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-20 transition-all duration-500 relative overflow-hidden">
      {/* Decorative circles omitted for brevity */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative z-10">
          {/* Badge, Titles, Subtitle remain unchanged */}
          <div ref={titleRef} className={`scroll-animate-scale ${titleVisible ? 'visible' : ''}`}>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-orange-800 bg-clip-text text-transparent">
              YTBuddy
            </h1>
          </div>

          <div ref={subtitleRef} className={`scroll-animate ${subtitleVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              🤖 Your AI-Powered YouTube Learning Companion
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform any YouTube video into interactive learning sessions with AI summaries, smart notes, and your personal study buddy chatbot.
            </p>
          </div>

          <div ref={formRef} className={`scroll-animate ${formVisible ? 'visible' : ''}`}>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-16">
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p>{error}</p>
                </div>
              )}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse"></div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Paste YouTube URL here..."
                    className="flex-1 px-6 py-5 text-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-600 rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-all duration-300 hover:shadow-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-5 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 hover:from-orange-600 hover:via-red-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-r-2xl transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>Let's Learn!</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
            {/* CTA Info unchanged */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
