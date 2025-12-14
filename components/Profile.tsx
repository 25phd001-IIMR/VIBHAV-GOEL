import React, { useState, useEffect } from 'react';
import { User, Star, Shield, LogOut, Settings, Flame, Edit2, Save, X, Camera } from 'lucide-react';
import { db } from '../utils/db';

interface ProfileProps {
  currentUser: User;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, onLogout }) => {
  const [user, setUser] = useState(currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    bio: user.bio || '',
    avatar: user.avatar
  });

  // Sync state if currentUser prop updates
  useEffect(() => {
    setUser(currentUser);
    setEditForm({ name: currentUser.name, bio: currentUser.bio || '', avatar: currentUser.avatar });
  }, [currentUser]);

  const handleSave = async () => {
    // Save to DB
    const updatedUser = await db.users.update(user.id, {
      name: editForm.name,
      bio: editForm.bio,
      avatar: editForm.avatar
    });
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({ name: user.name, bio: user.bio || '', avatar: user.avatar });
    setIsEditing(false);
  };

  // Streak Logic
  const renderStreakGrid = () => {
    const today = new Date();
    const days = 59; // Last 60 days
    const squares = [];
    
    // Create a map of activity dates for O(1) lookup
    const activitySet = new Set(user.activityLog);

    for (let i = days; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isActive = activitySet.has(dateStr);
      
      squares.push(
        <div 
          key={i} 
          title={dateStr}
          className={`w-3 h-3 rounded-sm ${isActive ? 'bg-green-500' : 'bg-slate-200'}`}
        ></div>
      );
    }
    return squares;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in pb-20">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        
        {/* Background Decorative */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10"></div>
        
        <div className="relative pt-4 text-center">
          <div className="relative inline-block mb-3 group">
            <img 
              src={isEditing ? editForm.avatar : user.avatar} 
              alt="Profile" 
              className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover bg-white" 
            />
            <div className="absolute bottom-1 right-1 bg-green-500 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center">
               <Shield size={14} className="text-white" />
            </div>
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
              </div>
            )}
          </div>

          {isEditing ? (
             <div className="max-w-xs mx-auto space-y-3 mt-2">
                <input 
                   className="w-full text-center font-bold text-xl border-b-2 border-slate-200 focus:border-blue-500 outline-none pb-1"
                   value={editForm.name}
                   onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                   placeholder="Your Name"
                />
                <textarea 
                   className="w-full text-center text-sm text-slate-600 border rounded-lg p-2 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                   value={editForm.bio}
                   onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                   placeholder="Tell us about yourself..."
                   rows={2}
                />
                <input 
                   className="w-full text-center text-xs text-slate-400 border-b border-slate-200 focus:border-blue-500 outline-none pb-1"
                   value={editForm.avatar}
                   onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                   placeholder="Avatar URL"
                />
                <div className="flex gap-2 justify-center mt-2">
                  <button onClick={handleSave} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700">
                    <Save size={14} /> Save
                  </button>
                  <button onClick={handleCancel} className="flex items-center gap-1 bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-300">
                    <X size={14} /> Cancel
                  </button>
                </div>
             </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">{user.bio || 'No bio added yet.'}</p>
              
              <div className="flex items-center justify-center gap-2 mt-3">
                 <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-slate-700 text-xs">{user.rating}</span>
                 </div>
                 <span className="text-slate-300">•</span>
                 <span className="text-xs text-slate-500 font-medium">IIM Raipur</span>
                 <button onClick={() => setIsEditing(true)} className="ml-2 text-blue-600 hover:text-blue-700">
                    <Edit2 size={16} />
                 </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Streak Section (Gamification) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
           <div>
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               Campus Streak
             </h3>
             <p className="text-xs text-slate-500">Your contribution activity over the last 60 days</p>
           </div>
           <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-orange-500">
                <Flame size={20} className="fill-orange-500 animate-pulse" />
                <span className="text-2xl font-black">{user.currentStreak}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Day Streak</span>
           </div>
        </div>
        
        {/* GitHub Style Grid */}
        <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
           {renderStreakGrid()}
        </div>
        
        <div className="flex justify-end items-center gap-2 mt-3 text-[10px] text-slate-400">
           <span>Less</span>
           <div className="w-2 h-2 bg-slate-200 rounded-sm"></div>
           <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
           <span>More</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center hover:border-blue-200 transition-colors">
           <span className="block text-2xl font-bold text-blue-600">0</span>
           <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Rides</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center hover:border-emerald-200 transition-colors">
           <span className="block text-2xl font-bold text-emerald-600">0</span>
           <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Items</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center hover:border-amber-200 transition-colors">
           <span className="block text-2xl font-bold text-amber-600">0</span>
           <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Tasks</span>
        </div>
      </div>

      {/* Menu Options */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left">
           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
             <Settings size={16} />
           </div>
           <span className="font-medium text-slate-700 flex-1">Account Settings</span>
        </button>
        <button 
           onClick={onLogout}
           className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors text-left group"
        >
           <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
             <LogOut size={16} />
           </div>
           <span className="font-medium text-red-600 flex-1 group-hover:text-red-700">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;