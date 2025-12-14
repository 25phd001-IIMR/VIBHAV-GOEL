import React, { useState } from 'react';
import { Menu, Bell, User, MessageSquare, Receipt, X, LogOut, LayoutGrid, Car, Package, ShoppingBag, ChevronRight } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  view: ViewState;
  setView: (view: ViewState) => void;
}

const Header: React.FC<HeaderProps> = ({ view, setView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getTitle = () => {
    switch (view) {
      case 'pooling': return 'Pooling';
      case 'renting': return 'Renting';
      case 'delivery': return 'Delivery';
      case 'profile': return 'Profile';
      case 'messages': return 'Messages';
      case 'bills': return 'My Bills';
      default: return 'Campus Connect';
    }
  };

  const getColor = () => {
    switch (view) {
      case 'pooling': return 'bg-blue-600';
      case 'renting': return 'bg-emerald-600';
      case 'delivery': return 'bg-amber-500';
      case 'messages': return 'bg-slate-800';
      case 'bills': return 'bg-slate-900';
      default: return 'bg-indigo-700';
    }
  };

  const handleNav = (target: ViewState) => {
    setView(target);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`${getColor()} text-white p-4 sticky top-0 z-40 shadow-md transition-colors duration-300`}>
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Functional Menu Icon */}
            <button onClick={() => setIsMenuOpen(true)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
               <Menu size={24} className="cursor-pointer" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">{getTitle()}</h1>
          </div>
          
          <div className="flex items-center gap-3">
             {/* New Bills Icon */}
             <button onClick={() => setView('bills')} className="p-2 hover:bg-white/20 rounded-full transition-colors relative" title="Bills">
               <Receipt size={20} />
             </button>

             <button onClick={() => setView('messages')} className="p-2 hover:bg-white/20 rounded-full transition-colors relative" title="Messages">
               <MessageSquare size={20} />
             </button>
             
            <button className="relative p-2 hover:bg-white/20 rounded-full" title="Notifications">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div onClick={() => setView('profile')} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all ml-1" title="Profile">
               <User size={18} />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* Drawer Content */}
          <div className="relative w-3/4 max-w-xs bg-white h-full shadow-2xl flex flex-col animate-fade-in transform transition-transform">
             <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                   <button onClick={() => handleNav('dashboard')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors">
                      <LayoutGrid size={20} className="text-indigo-600" /> Dashboard
                   </button>
                   <button onClick={() => handleNav('pooling')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors">
                      <Car size={20} className="text-blue-600" /> Pooling
                   </button>
                   <button onClick={() => handleNav('renting')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors">
                      <Package size={20} className="text-emerald-600" /> Renting
                   </button>
                   <button onClick={() => handleNav('delivery')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors">
                      <ShoppingBag size={20} className="text-amber-500" /> Delivery
                   </button>
                   <div className="my-2 border-t border-slate-100"></div>
                   <button onClick={() => handleNav('bills')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors">
                      <Receipt size={20} className="text-slate-600" /> My Bills
                   </button>
                   <button onClick={() => handleNav('profile')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors">
                      <User size={20} className="text-slate-600" /> Profile
                   </button>
                </nav>
             </div>

             <div className="p-4 border-t border-slate-100">
                <button onClick={() => { localStorage.removeItem('campus_connect_user_id'); window.location.reload(); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">
                   <div className="flex items-center gap-2">
                     <LogOut size={18} /> Logout
                   </div>
                   <ChevronRight size={16} />
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-3">v1.0.2 Campus Connect</p>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;