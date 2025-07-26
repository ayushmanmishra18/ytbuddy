import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [headerRef, headerVisible] = useScrollAnimation();
  const [faqsRef, visibleFaqs] = useStaggeredAnimation(8, 100);
  const [ctaRef, ctaVisible] = useScrollAnimation();

  const faqs = [
    {
      question: "Does YTBuddy work with private or paid videos?",
      answer: "No, it only supports public YouTube videos that allow captions or audio processing."
    },
    {
      question: "Can I download my notes?",
      answer: "Currently, there is no download or save feature — only copy functionality is available."
    },
    {
      question: "What languages are supported?",
      answer: "Right now, YTBuddy supports videos in English (with plans to support Hindi and multilingual subtitles soon)."
    },
    {
      question: "Is this free to use?",
      answer: "Yes! All core features are free for now. In future, premium features may be added."
    },
    {
      question: "How accurate are the AI summaries?",
      answer: "Our AI provides highly accurate summaries based on the video transcript. However, accuracy may vary depending on audio quality and content complexity."
    },
    {
      question: "Can I use YTBuddy for educational content?",
      answer: "Absolutely! YTBuddy is perfect for educational videos, lectures, tutorials, and any learning content on YouTube."
    },
    {
      question: "What happens to my data?",
      answer: "We don't store your video data or personal information. All processing is done in real-time and nothing is saved on our servers."
    },
    {
      question: "Are there any video length limits?",
      answer: "Currently, YTBuddy works best with videos under 2 hours. Very long videos may take longer to process."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div 
          ref={headerRef}
          className={`text-center mb-16 scroll-animate ${headerVisible ? 'visible' : ''}`}
        >
          <div className="inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-orange-200 dark:border-orange-800">
            <span>🙋</span>
            <span>Got Questions?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about YTBuddy features, limitations, and usage
          </p>
        </div>

        {/* FAQ Items */}
        <div ref={faqsRef} className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden scroll-stagger ${visibleFaqs.has(index) ? 'visible' : ''}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">
                    {faq.question}
                  </h3>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-orange-500 transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 animate-fade-in">
                  <div className="pl-14">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border-l-4 border-orange-500">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div 
          ref={ctaRef}
          className={`mt-16 text-center scroll-animate ${ctaVisible ? 'visible' : ''}`}
        >
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Can't find what you're looking for? Feel free to reach out and I'll be happy to help!
            </p>
            <button 
              onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <span>Contact Me</span>
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;