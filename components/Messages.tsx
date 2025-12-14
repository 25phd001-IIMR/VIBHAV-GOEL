import React, { useState, useEffect } from 'react';
import { Loader2, MessageCircle, ChevronRight } from 'lucide-react';
import { db } from '../utils/db';
import { Chat, User } from '../types';
import ChatModal from './ChatModal';

interface MessagesProps {
  currentUser: User;
}

const Messages: React.FC<MessagesProps> = ({ currentUser }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  const loadChats = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const data = await db.chats.list(currentUser.id);
    setChats(data);
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    loadChats(true);
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => loadChats(false), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in pb-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Messages</h2>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <MessageCircle size={32} className="text-slate-400" />
           </div>
           <h3 className="text-lg font-bold text-slate-700">No conversations yet</h3>
           <p className="text-slate-500 text-sm mt-1">Chat with providers to see messages here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
             <div 
               key={chat.id} 
               onClick={() => setActiveChat(chat)}
               className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
             >
                <img src={chat.otherUser?.avatar} alt={chat.otherUser?.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-slate-800">{chat.otherUser?.name}</h4>
                      {chat.lastMessage && (
                        <span className="text-[10px] text-slate-400">{new Date(chat.lastMessage.timestamp).toLocaleDateString()}</span>
                      )}
                   </div>
                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{chat.contextType} • {chat.contextTitle}</p>
                   <p className="text-sm text-slate-600 truncate">{chat.lastMessage?.content || "No messages yet"}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
             </div>
          ))}
        </div>
      )}

      {activeChat && activeChat.otherUser && (
        <ChatModal 
          isOpen={true} 
          onClose={() => { setActiveChat(null); loadChats(false); }} 
          currentUser={currentUser}
          otherUser={activeChat.otherUser} 
          contextType={activeChat.contextType}
          contextTitle={activeChat.contextTitle}
        />
      )}
    </div>
  );
};

export default Messages;