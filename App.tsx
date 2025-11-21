import React, { useState, useEffect, useRef } from 'react';
import { Message } from './types';
import { initializeChat, sendMessageStream } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import { GraduationCap, BookOpen, Newspaper, Sparkles, Menu, X, PlusCircle, Trash2, History } from 'lucide-react';

// Sample starter questions
const STARTERS = [
  { icon: <BookOpen size={18} />, text: "Explain Quantum Mechanics simply" },
  { icon: <Newspaper size={18} />, text: "What's the latest news in Tech?" },
  { icon: <GraduationCap size={18} />, text: "Tips for writing a thesis statement" },
  { icon: <Sparkles size={18} />, text: "Summarize this week's major global events" },
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Close sidebar on mobile if open
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }

    // Create a placeholder for the bot message
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      role: 'model',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMsg]);

    try {
      await sendMessageStream(text, (chunkText, metadata) => {
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === botMsgId) {
              return {
                ...msg,
                content: msg.content + chunkText,
                groundingMetadata: metadata || msg.groundingMetadata,
              };
            }
            return msg;
          });
        });
      });
    } catch (error) {
      setMessages((prev) => {
         return prev.map(msg => {
             if (msg.id === botMsgId) {
                 return { ...msg, content: "Sorry, I encountered an error processing your request. Please try again.", isError: true };
             }
             return msg;
         })
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the current chat history?")) {
      setMessages([]);
      initializeChat(); // Reset the AI session context
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }
  };

  const handleFeatureClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Sidebar (Desktop) */}
      <aside className={`
        fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <GraduationCap className="text-indigo-600 mr-2" />
          <h1 className="text-lg font-bold text-slate-800">ScholarMate</h1>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <button 
            onClick={clearChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 mb-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors text-sm font-medium"
          >
            <PlusCircle size={18} />
            <span>New Chat</span>
          </button>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Features</h3>
            <nav className="space-y-1">
              <button 
                onClick={() => handleFeatureClick("I need help organizing a study plan. Can you ask me about my subjects and exams?")}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors text-sm text-left"
              >
                <BookOpen size={18} />
                <span>Study Helper</span>
              </button>
              <button 
                onClick={() => handleFeatureClick("What are the most important news headlines right now globally? Please summarize them with sources.")}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors text-sm text-left"
              >
                <Newspaper size={18} />
                <span>News & Updates</span>
              </button>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">History</h3>
            <div className="space-y-1">
               {/* Placeholder history items - in a real app these would be persisted */}
              <div className="flex items-center gap-3 px-3 py-2 text-slate-400 cursor-not-allowed rounded-lg text-sm">
                <History size={16} />
                <span className="truncate">Previous sessions...</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={clearChat}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 text-sm transition-colors px-2"
          >
            <Trash2 size={16} />
            <span>Clear History</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full max-w-full overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center px-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden mr-3 text-slate-500 hover:text-slate-700 p-1"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-sm font-semibold text-slate-700">
            {messages.length > 0 ? 'Chat Session' : 'New Session'}
          </h2>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="mt-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                  <GraduationCap size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Hello, Student!</h2>
                <p className="text-slate-500 max-w-md mb-10">
                  I'm ScholarMate. I can help you study, research topics, or catch up on the latest news. How can I help you today?
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {STARTERS.map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(starter.text)}
                      className="flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-xl transition-all text-left group"
                    >
                      <div className="text-indigo-500 group-hover:scale-110 transition-transform">
                        {starter.icon}
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{starter.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-6">
                    <div className="flex items-center gap-2 text-slate-400 text-sm ml-11">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <InputArea onSend={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default App;