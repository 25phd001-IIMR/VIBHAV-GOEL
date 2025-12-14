import React, { useState } from 'react';
import { ViewState, User } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Pooling from './components/Pooling';
import Renting from './components/Renting';
import Delivery from './components/Delivery';
import Profile from './components/Profile';
import Messages from './components/Messages';
import Bills from './components/Bills';
import Landing from './components/Landing';
import Auth from './components/Auth';
import { db } from './utils/db';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authStage, setAuthStage] = useState<'landing' | 'login' | 'signup'>('landing');

  // App View State
  const [view, setView] = useState<ViewState>('dashboard');

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    // Persist login
    localStorage.setItem('campus_connect_user_id', user.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('campus_connect_user_id');
    setCurrentUser(null);
    setAuthStage('landing');
    setView('dashboard');
  };

  // Check for existing session on load
  React.useEffect(() => {
     const savedUserId = localStorage.getItem('campus_connect_user_id');
     if (savedUserId) {
       db.users.get(savedUserId).then(user => {
         setCurrentUser(user);
       });
     }
  }, []);

  // --- Render Logic ---

  if (!currentUser) {
    if (authStage === 'landing') {
      return <Landing onStart={(mode) => setAuthStage(mode)} />;
    }
    return (
      <Auth 
        mode={authStage as 'login' | 'signup'} 
        setMode={setAuthStage} 
        onAuthSuccess={handleAuthSuccess}
        onBack={() => setAuthStage('landing')}
      />
    );
  }

  // --- Authenticated App ---
  
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard setView={setView} currentUser={currentUser} />;
      case 'pooling':
        return <Pooling currentUser={currentUser} />;
      case 'renting':
        return <Renting currentUser={currentUser} />;
      case 'delivery':
        return <Delivery currentUser={currentUser} />;
      case 'profile':
        return <Profile currentUser={currentUser} onLogout={handleLogout} />;
      case 'messages':
        return <Messages currentUser={currentUser} />;
      case 'bills':
        return <Bills currentUser={currentUser} />;
      default:
        return <div className="p-10 text-center text-slate-500">Feature coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <Header view={view} setView={setView} />
      <main className="transition-all duration-300 ease-in-out">
        {renderContent()}
      </main>
      
      {/* Simple Footer/Copyright */}
      {view === 'dashboard' && (
        <footer className="text-center p-6 text-xs text-slate-400 mt-auto">
          <p>© 2024 Campus Connect. Built for IIM Raipur.</p>
        </footer>
      )}
    </div>
  );
};

export default App;