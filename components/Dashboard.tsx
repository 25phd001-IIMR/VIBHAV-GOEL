import React, { useState, useEffect } from 'react';
import { Car, Package, ShoppingBag, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { ViewState, Activity, User } from '../types';
import { RECENT_ACTIVITY } from '../constants';
import { db } from '../utils/db';

interface DashboardProps {
  setView: (view: ViewState) => void;
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, currentUser }) => {
  const [stats, setStats] = useState({ rides: 0, items: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch all data to calculate counts
      const [allRides, allItems, allTasks] = await Promise.all([
        db.rides.getAll(),
        db.items.getAll(),
        db.tasks.getAll()
      ]);

      setStats({
        rides: allRides.filter(r => r.mode === 'offer' && r.seatsAvailable > 0).length,
        items: allItems.filter(i => i.mode === 'offer' && i.status === 'available').length,
        tasks: allTasks.filter(t => t.mode === 'request' && t.status === 'open').length
      });
      setLoading(false);
    };

    fetchStats();
    
    // Auto-refresh stats every 5 seconds to keep dashboard alive
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="mt-2">
        <h2 className="text-2xl font-bold text-slate-800">Hello, {currentUser.name.split(' ')[0]}! 👋</h2>
        <p className="text-slate-500 text-sm mt-1">What would you like to do today?</p>
      </div>

      {/* Main Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pooling Tile */}
        <button
          onClick={() => setView('pooling')}
          className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 text-left h-40 md:h-52 flex flex-col justify-between p-5"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
              <Car size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Pooling</h3>
            <p className="text-xs text-slate-500 mt-1">Campus to City rides</p>
          </div>
          <div className="relative z-10 flex items-center justify-between mt-4">
            {loading ? (
              <Loader2 className="animate-spin text-blue-400" size={16} />
            ) : (
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                {stats.rides} active rides
              </span>
            )}
            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
          </div>
        </button>

        {/* Renting Tile */}
        <button
          onClick={() => setView('renting')}
          className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 text-left h-40 md:h-52 flex flex-col justify-between p-5"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
              <Package size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">Renting</h3>
            <p className="text-xs text-slate-500 mt-1">Share & rent items</p>
          </div>
          <div className="relative z-10 flex items-center justify-between mt-4">
             {loading ? (
              <Loader2 className="animate-spin text-emerald-400" size={16} />
            ) : (
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                {stats.items} items available
              </span>
            )}
            <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500" />
          </div>
        </button>

        {/* Delivery Tile */}
        <button
          onClick={() => setView('delivery')}
          className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-amber-200 transition-all duration-300 text-left h-40 md:h-52 flex flex-col justify-between p-5"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-3">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Delivery</h3>
            <p className="text-xs text-slate-500 mt-1">Errands & Tasks</p>
          </div>
          <div className="relative z-10 flex items-center justify-between mt-4">
             {loading ? (
              <Loader2 className="animate-spin text-amber-400" size={16} />
            ) : (
              <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                {stats.tasks} open tasks
              </span>
            )}
            <ChevronRight size={18} className="text-slate-300 group-hover:text-amber-500" />
          </div>
        </button>
      </div>

      {/* Active Listings / Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-slate-400" />
            Recent Activity
          </h3>
          <span className="text-xs text-blue-600 font-medium cursor-pointer">View All</span>
        </div>
        
        <div className="space-y-4">
          {RECENT_ACTIVITY.map((activity: Activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border-b border-slate-50 last:border-0 last:pb-0">
               <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                 activity.type === 'pooling' ? 'bg-blue-500' :
                 activity.type === 'renting' ? 'bg-emerald-500' : 'bg-amber-500'
               }`} />
               <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800">{activity.title}</h4>
                  <p className="text-xs text-slate-500">{activity.subtitle}</p>
               </div>
               <span className="text-xs text-slate-400">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;