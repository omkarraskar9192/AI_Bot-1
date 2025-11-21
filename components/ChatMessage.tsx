import React from 'react';
import { Message, GroundingMetadata } from '../types';
import { User, Bot, ExternalLink, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Helper to render citations if available
  const renderGroundingSources = (metadata?: GroundingMetadata) => {
    if (!metadata?.groundingChunks || metadata.groundingChunks.length === 0) return null;

    // Filter out chunks that don't have web data
    const sources = metadata.groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => chunk.web!);

    // Remove duplicates based on URI
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    if (uniqueSources.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-slate-200/50">
        <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
          <ExternalLink size={12} /> Sources & Citations
        </p>
        <div className="flex flex-wrap gap-2">
          {uniqueSources.map((source, idx) => (
            <a
              key={idx}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-100 transition-colors truncate max-w-[200px] block"
              title={source.title}
            >
              {source.title || new URL(source.uri).hostname}
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isUser ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-slate-200'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
              isUser
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            } ${message.isError ? 'border-red-300 bg-red-50 text-red-800' : ''}`}
          >
             {message.isError ? (
               <div className="flex items-center gap-2">
                 <AlertCircle size={16} />
                 <span>{message.content}</span>
               </div>
             ) : (
               message.content
             )}
             
             {!isUser && renderGroundingSources(message.groundingMetadata)}
          </div>
          
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
