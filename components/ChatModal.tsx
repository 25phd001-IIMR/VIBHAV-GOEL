import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, User } from 'lucide-react';
import { db } from '../utils/db';
import { User as UserType, Message } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  otherUser: UserType;
  contextType: string;
  contextTitle: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, currentUser, otherUser, contextType, contextTitle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && otherUser) {
      loadChat();
    }
  }, [isOpen, otherUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = async () => {
    setLoading(true);
    try {
      const id = await db.chats.getOrCreate(currentUser.id, otherUser.id, contextType, contextTitle);
      setChatId(id);
      const msgs = await db.chats.getMessages(id);
      setMessages(msgs);
    } catch (error) {
      console.error("Failed to load chat", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    const tempContent = newMessage;
    setNewMessage(''); // Optimistic clear

    try {
      const msg = await db.chats.sendMessage(chatId, currentUser.id, tempContent);
      setMessages([...messages, msg]);
    } catch (error) {
      console.error("Failed to send", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md h-[500px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={otherUser.avatar} className="w-10 h-10 rounded-full border-2 border-slate-700" alt={otherUser.name} />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <h3 className="font-bold text-sm">{otherUser.name}</h3>
              <p className="text-[10px] text-slate-400 max-w-[150px] truncate">{contextTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 mt-10">
              <p className="text-sm">Start the conversation!</p>
              <p className="text-xs">Ask about {contextTitle}...</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                    <span className={`text-[10px] block mt-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;