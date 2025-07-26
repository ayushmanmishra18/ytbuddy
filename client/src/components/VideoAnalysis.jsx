import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  MessageCircle, 
  Send, 
  Brain, 
  List,
  ArrowLeft,
  Youtube,
  Bookmark,
  Share2,
  Download,
  User,
  Bot,
  AlertCircle
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { askQuestion } from '../services/api';

const VideoAnalysis = ({ videoData, onBack }) => {
  if (!videoData?.analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="mt-4 text-gray-600">No analysis data available</p>
        <button 
          onClick={() => {
            localStorage.removeItem('videoAnalysisState');
            onBack();
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Another Video
        </button>
      </div>
    );
  }

  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('summary');
  const [activeMode, setActiveMode] = useState('default');
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'bot',
      message: "Hi! I'm here to help you understand this video better. Ask me anything about the content!",
      timestamp: null
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [copiedItem, setCopiedItem] = useState(null);
  const chatEndRef = useRef(null);
  const playerRef = useRef(null);

  const modeInfo = {
    default: {
      title: 'Transcript Mode',
      description: 'Answers strictly from video content',
      example: 'What does the video say about...?'
    },
    buddy: {
      title: 'Buddy Mode',
      description: 'General knowledge answers (ignores transcript)',
      example: 'Hey buddy, tell me about...'
    },
    beyond: {
      title: 'Beyond Mode',
      description: 'Transcript answer + general knowledge',
      example: 'Beyond the transcript, explain...'
    }
  };

  const handleCopy = (text, itemType) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(itemType);
    setTimeout(() => setCopiedItem(null), 5000);
  };

  const [playerState, setPlayerState] = useState({
    loading: true,
    error: null,
    ready: false
  });

  useEffect(() => {
    if (!videoData?.video_id) {
      setPlayerState({loading: false, error: 'Invalid video ID', ready: false});
      return;
    }

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      try {
        playerRef.current = new window.YT.Player('yt-player', {
          height: '100%',
          width: '100%',
          videoId: videoData.video_id,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            controls: 1
          },
          events: {
            onReady: () => setPlayerState({loading: false, error: null, ready: true}),
            onError: () => setPlayerState({loading: false, error: 'Failed to load video', ready: false})
          }
        });
      } catch (e) {
        setPlayerState({loading: false, error: 'Player initialization failed', ready: false});
      }
    };

    return () => {
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoData?.video_id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      type: 'user',
      message: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    try {
      const response = await askQuestion({
        video_id: videoData.video_id,
        question: chatInput
      });
      
      let botMessages = [];
      
      if (response.data.type === 'beyond') {
        botMessages = [
          {
            type: 'bot',
            message: response.data.transcript_answer,
            timestamp: new Date(),
            mode: 'default'
          },
          {
            type: 'bot',
            message: response.data.general_answer,
            timestamp: new Date(),
            mode: 'beyond'
          }
        ];
      } else {
        botMessages = [{
          type: 'bot',
          message: response.data.answer,
          timestamp: new Date(),
          mode: response.data.type
        }];
      }
      
      setChatMessages(prev => [...prev, ...botMessages]);
    } catch (error) {
      console.error('Error asking question:', error);
      setChatMessages(prev => [...prev, {
        type: 'bot',
        message: 'Sorry, I couldn\'t process your question right now.',
        timestamp: new Date()
      }]);
    }
  };

  const tabs = [
    { id: 'summary', label: 'AI Summary', icon: Brain },
    { id: 'keypoints', label: 'Key Points', icon: List }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-500">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Youtube className="h-8 w-8 text-red-500" />
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                  Video Analysis
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => {
              localStorage.removeItem('videoAnalysisState');
              onBack();
            }}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="mr-2" /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
              <div id="yt-player" className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white hidden" id="player-error">
                <div className="text-center p-4">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />
                  <p>Video playback error</p>
                  <p className="text-sm mt-2">Try refreshing or check if the video is available</p>
                </div>
              </div>
              {playerState.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                  <div className="text-center p-4">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />
                    <p>{playerState.error}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transcript</h3>
                <button 
                  onClick={() => handleCopy(videoData.analysis?.transcript || '', 'transcript')}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copiedItem === 'transcript' ? <span>Copied!</span> : <span>Copy</span>}
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {videoData.analysis?.transcript || "Transcript not available"}
                </pre>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-0">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-600 dark:text-orange-400 border-b-2 border-orange-500'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'summary' && (
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Video Summary</h3>
                      <button 
                        onClick={() => handleCopy(videoData.analysis?.summary, 'summary')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedItem === 'summary' ? <span>Copied!</span> : <span>Copy</span>}
                      </button>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                        {videoData.analysis?.summary || "No summary available"}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'keypoints' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Points</h3>
                    {videoData.analysis?.key_points?.length > 0 ? (
                      <ul className="space-y-3 list-disc list-inside">
                        {videoData.analysis.key_points.map((point, i) => (
                          <li 
                            key={i} 
                            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <span className="text-gray-700 dark:text-gray-300">{point}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                        <p className="text-gray-500 dark:text-gray-400">No key points generated for this video</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat with AI</h3>
                </div>
              </div>

              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex items-start space-x-3 ${msg.type==='user' ? 'flex-row-reverse space-x-reverse':''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 shadow-lg'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg'
                    }`}>
                      {msg.type==='user' ? <User className="w-4 h-4 text-white"/> : <Bot className="w-4 h-4 text-white"/>}
                    </div>
                    <div className={`flex-1 ${msg.type==='user'?'text-right':''}`}>
                      <div className={`inline-block p-3 rounded-2xl max-w-xs lg:max-w-md ${
                        msg.type==='user'
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Mode</h4>
                    <div className="flex space-x-2">
                      {Object.keys(modeInfo).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setActiveMode(mode)}
                          className={`px-4 py-2 rounded-lg text-sm ${
                            activeMode === mode
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                          }`}
                        >
                          {modeInfo[mode].title}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Hint</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{modeInfo[activeMode].description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Example: {modeInfo[activeMode].example}</p>
                  </div>
                </div>
                <form onSubmit={(e) => {e.preventDefault(); handleSendMessage()}} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about the video. Use 'buddy' to get answer from  knowledge base."
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysis;