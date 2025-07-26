import React from 'react';
import { Github, Mail, Heart, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-lg">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                YTBuddy
              </span>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Your AI-powered YouTube learning companion that transforms videos into interactive learning experiences with smart summaries and personalized study sessions.
            </p>
            <div className="flex items-center space-x-4 mt-6">
              <a
                href="https://github.com/ayushmanmishra18"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 hover:text-orange-400"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:ayushmanmishraji1@gmail.com"
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 hover:text-orange-400"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-left"
                >
                  Guide
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('faq')}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-left"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Resources</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => scrollToSection('faq')}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-left"
                >
                  FAQ
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  API
                </a>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-left"
                >
                  Support
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>by Ayushman Mishra</span>
              <span>|</span>
              <span>© {currentYear} YTBuddy</span>
            </div>

            {/* Additional links */}
            <div className="flex items-center space-x-6 text-sm">
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
              >
                Guide
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
              >
                FAQ
              </button>
              <a 
                href="https://github.com/ayushmanmishra18" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
              >
                GitHub
              </a>
              <a 
                href="mailto:ayushmanmishraji1@gmail.com" 
                className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
              >
                Contact
              </a>
              <a href="#privacy" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter section */}
      <div className="mt-12 pt-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">📩 Stay Updated</h3>
            <p className="text-gray-400 mb-6">Get the latest features and updates delivered to your inbox.</p>
            <div className="max-w-md mx-auto flex">
              <input 
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/20 text-white placeholder-gray-400 transition-all duration-300"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 hover:from-orange-600 hover:via-red-700 hover:to-pink-700 text-white font-medium rounded-r-lg transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;