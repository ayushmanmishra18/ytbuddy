import React from 'react';
import { Link, Bot, FileText, MessageCircle, ArrowRight } from 'lucide-react';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

const HowItWorks = () => {
  const [headerRef, headerVisible] = useScrollAnimation();
  const [stepsRef, visibleSteps] = useStaggeredAnimation(4, 200);
  const [ctaRef, ctaVisible] = useScrollAnimation();

  const steps = [
    {
      icon: Link,
      title: "Paste the YouTube Link",
      description: "Copy any YouTube video URL and paste it into the input box on the homepage.",
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
    },
    {
      icon: Bot,
      title: "Let the AI Do Its Magic",
      description: "Our system fetches the video's transcript and generates an AI-powered, structured summary — all within seconds.",
      color: "from-purple-500 to-indigo-600",
      bgColor: "from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20"
    },
    {
      icon: FileText,
      title: "Explore Your Notes",
      description: "View the full transcript, summary with timestamps, and click \"Copy\" to save them to your clipboard.",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
    },
    {
      icon: MessageCircle,
      title: "Ask Questions Using Chatbot",
      description: "Use the chatbot to ask anything about the video — definitions, summaries, translations, and more!",
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 scroll-animate ${headerVisible ? 'visible' : ''}`}
        >
          <div className="inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-orange-200 dark:border-orange-800">
            <span>💡</span>
            <span>Simple & Powerful</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How YTBuddy Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your AI buddy transforms any YouTube video into an interactive learning experience in just 4 simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div
          ref={stepsRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className={`group relative scroll-stagger ${visibleSteps.has(index) ? 'visible' : ''}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 z-10">
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-12 border-2 border-white dark:border-gray-800">
                    {index + 1}
                  </div>
                </div>

                {/* Card */}
                <div className={`relative bg-gradient-to-br ${step.bgColor} p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-3 hover:scale-105 overflow-hidden group`}>
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-full blur-2xl animate-pulse"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-all duration-300 group-hover:scale-105">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow for flow (except last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-20">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center border-2 border-orange-200 dark:border-orange-800 hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:border-orange-400">
                        <ArrowRight className="w-5 h-5 text-orange-500 animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div
          ref={ctaRef}
          className={`text-center mt-16 scroll-animate ${ctaVisible ? 'visible' : ''}`}
        >
          <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to meet your AI buddy?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Paste your first YouTube link and let YTBuddy transform your learning!
              </p>
            </div>
            <button
              onClick={() => {
                const heroSection = document.querySelector('section');
                if (heroSection) {
                  heroSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 hover:from-orange-600 hover:via-red-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 flex items-center space-x-2 whitespace-nowrap relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Meet YTBuddy</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
