import React from 'react';
import { Brain, FileText, MessageCircle, Clock, Copy, Palette } from 'lucide-react';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

const Features = () => {
  const [headerRef, headerVisible] = useScrollAnimation();
  const [containerRef, visibleItems] = useStaggeredAnimation(6, 150);

  const features = [
    {
      icon: Brain,
      title: "AI Summary",
      description: "Get structured topic-wise summaries with timestamps.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: FileText,
      title: "Full Transcript",
      description: "Clean, readable transcript from video audio.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: MessageCircle,
      title: "Ask AI",
      description: "Chatbot answers your questions about the video content.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Clock,
      title: "Time-linked Highlights",
      description: "Click timestamps to jump to the key video moments.",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Copy,
      title: "Copy Notes",
      description: "One-click copy for summaries or transcript.",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: Palette,
      title: "Light & Dark Mode",
      description: "Sleek, toggleable themes for all users.",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={headerRef}
          className={`text-center mb-16 scroll-animate ${headerVisible ? 'visible' : ''}`}
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Learning Superpowers
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything your AI buddy needs to transform any YouTube video into an interactive learning experience.
          </p>
        </div>

        <div 
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className={`group relative bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700 scroll-stagger ${visibleItems.has(index) ? 'visible' : ''}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-2xl transition-all duration-500 from-orange-400 via-red-500 to-pink-500 blur-sm"></div>
                
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-all duration-300 group-hover:scale-105">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left shadow-lg"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;