import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface InputAreaProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full bg-white border-t border-slate-200 p-4 sticky bottom-0 z-10">
      <div className="max-w-4xl mx-auto relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about homework, research topics, or current news..."
          className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none text-sm max-h-32 text-slate-800 placeholder-slate-400"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`absolute right-2 bottom-2.5 p-1.5 rounded-lg transition-all duration-200 ${
            input.trim() && !isLoading
              ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
      <div className="text-center mt-2">
        <p className="text-[10px] text-slate-400">
          ScholarMate AI can make mistakes. Double check important info.
        </p>
      </div>
    </div>
  );
};

export default InputArea;
