import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Car, Navigation, Loader2, User, HelpCircle, MessageCircle } from 'lucide-react';
import { Ride, User as UserType } from '../types';
import { db } from '../utils/db';
import ChatModal from './ChatModal';

interface PoolingProps {
  currentUser: UserType;
}

const Pooling: React.FC<PoolingProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'post'>('browse');
  const [browseMode, setBrowseMode] = useState<'offer' | 'request'>('offer'); // offer = finding rides, request = finding passengers
  const [filterMode, setFilterMode] = useState<'all' | 'to_city' | 'to_campus'>('all');
  
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<UserType | null>(null);
  const [chatTitle, setChatTitle] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    seats: 1,
    cost: 0,
    type: 'car' as 'car' | 'bike',
    mode: 'offer' as 'offer' | 'request'
  });

  const loadRides = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const data = await db.rides.getAll();
    setRides(data);
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    loadRides(true);
    // Poll every 3 seconds to update list if another user posts
    const interval = setInterval(() => loadRides(false), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await db.rides.create({
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date || 'Today', // Fallback for demo
        time: formData.time,
        seatsAvailable: Number(formData.seats),
        costPerPerson: Number(formData.cost),
        type: formData.type,
        mode: formData.mode
      }, currentUser);
      
      // Reset and switch tab
      setFormData({ origin: '', destination: '', date: '', time: '', seats: 1, cost: 0, type: 'car', mode: 'offer' });
      setActiveTab('browse');
      loadRides(true); // Refresh list
    } catch (error) {
      console.error("Failed to create ride", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: string, mode: 'offer' | 'request') => {
    setActionId(id);
    try {
      const success = await db.rides.join(id);
      if (success) {
        await loadRides();
        if (mode === 'offer') {
          alert("Ride joined successfully!");
        } else {
          alert("Passenger request accepted! Contact them to coordinate.");
        }
      } else {
        alert("Action failed. Listing might be full or unavailable.");
      }
    } catch (error) {
      console.error("Error updating ride:", error);
    } finally {
      setActionId(null);
    }
  };

  const openChat = (targetUser: UserType, title: string) => {
    setChatTarget(targetUser);
    setChatTitle(title);
    setChatOpen(true);
  };

  // Helper for filtering
  const getLocationType = (text: string) => {
    const t = text.toLowerCase();
    const campusKeywords = ['campus', 'hostel', 'iim', 'library', 'faculty', 'mess', 'h4', 'h1', 'h2', 'h3'];
    const cityKeywords = ['mall', 'city', 'station', 'airport', 'market', 'raipur', 'theater'];

    if (campusKeywords.some(k => t.includes(k))) return 'campus';
    if (cityKeywords.some(k => t.includes(k))) return 'city';
    return 'other';
  };

  const filteredRides = rides.filter(ride => {
    if (ride.mode !== browseMode) return false;
    if (filterMode === 'all') return true;

    const originType = getLocationType(ride.origin);
    const destType = getLocationType(ride.destination);

    if (filterMode === 'to_city') {
      return destType === 'city' || (originType === 'campus' && destType !== 'campus');
    }

    if (filterMode === 'to_campus') {
      return destType === 'campus';
    }

    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20 animate-fade-in relative">
      {/* Search / Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'browse' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Browse
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'post' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Post
        </button>
      </div>

      {activeTab === 'browse' && (
        <>
          {/* Main Toggle */}
          <div className="flex justify-center gap-6 border-b border-slate-100 pb-2">
             <button 
               onClick={() => setBrowseMode('offer')}
               className={`text-sm font-bold pb-2 border-b-2 transition-colors ${browseMode === 'offer' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400'}`}
             >
               Find a Ride
             </button>
             <button 
               onClick={() => setBrowseMode('request')}
               className={`text-sm font-bold pb-2 border-b-2 transition-colors ${browseMode === 'request' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400'}`}
             >
               Find Passengers
             </button>
          </div>

          {/* Filter Bar */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button 
              onClick={() => setFilterMode('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${filterMode === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterMode('to_city')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${filterMode === 'to_city' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              <Navigation size={14} /> To City
            </button>
            <button 
              onClick={() => setFilterMode('to_campus')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${filterMode === 'to_campus' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              <Navigation size={14} /> To Campus
            </button>
          </div>

          {/* Ride Cards */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-opacity-70">
                 {browseMode === 'offer' ? 'Available Rides' : 'Passenger Requests'}
               </h3>
               <span className="text-xs text-slate-400 font-medium">{filteredRides.length} found</span>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-10 text-slate-400">
                <Loader2 className="animate-spin" />
              </div>
            ) : filteredRides.length === 0 ? (
               <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                 <p>No {browseMode === 'offer' ? 'rides' : 'requests'} found matching your criteria.</p>
                 <button onClick={() => setActiveTab('post')} className="text-blue-600 font-bold text-sm mt-2">
                   {browseMode === 'offer' ? 'Offer a ride instead?' : 'Post a request instead?'}
                 </button>
               </div>
            ) : (
              filteredRides.map((ride: Ride) => (
                <div key={ride.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${ride.type === 'car' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <img src={ride.driver.avatar} alt={ride.driver.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{ride.driver.name}</h4>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">⭐ {ride.driver.rating}</span>
                          {ride.driver.verified && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Verified</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {ride.costPerPerson === 0 ? (
                         <span className="block text-lg font-bold text-green-600">Free</span>
                      ) : (
                        <span className="block text-lg font-bold text-blue-600">₹{ride.costPerPerson}</span>
                      )}
                      <span className="text-xs text-slate-400">per person</span>
                    </div>
                  </div>

                  {/* Badge for Request vs Offer */}
                  {ride.mode === 'request' && (
                     <div className="absolute top-4 right-1/2 translate-x-1/2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                        Requesting
                     </div>
                  )}

                  <div className="space-y-3 relative">
                    <div className="absolute left-[7px] top-[8px] bottom-[30px] w-0.5 border-l-2 border-dotted border-slate-300"></div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-white z-10"></div>
                      <div>
                        <p className="text-xs text-slate-400">From</p>
                        <p className="text-sm font-semibold text-slate-700">{ride.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400 bg-white z-10"></div>
                      <div>
                        <p className="text-xs text-slate-400">To</p>
                        <p className="text-sm font-semibold text-slate-700">{ride.destination}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar size={14} />
                          <span className="text-xs font-medium">{ride.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={14} />
                          <span className="text-xs font-medium">{ride.time}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                       {ride.driver.id !== currentUser.id && (
                          <button 
                            onClick={() => openChat(ride.driver, `Ride to ${ride.destination}`)}
                            className="text-slate-500 hover:text-blue-600 p-2 rounded-lg bg-slate-50 hover:bg-blue-50 transition-all"
                          >
                             <MessageCircle size={18} />
                          </button>
                       )}
                       <button 
                        onClick={() => handleAction(ride.id, ride.mode)}
                        disabled={ride.seatsAvailable === 0 || actionId === ride.id}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          ride.seatsAvailable === 0 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : ride.mode === 'offer' 
                             ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                             : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {actionId === ride.id ? <Loader2 className="animate-spin" size={14}/> : null}
                        {ride.seatsAvailable === 0 
                          ? (ride.mode === 'offer' ? 'Full' : 'Fulfilled') 
                          : (ride.mode === 'offer' 
                              ? `Join Ride (${ride.seatsAvailable} left)` 
                              : `Pick Up (${ride.seatsAvailable} needed)`)
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'post' && (
        <form onSubmit={handleCreateRide} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
           <div className="bg-slate-100 p-1 rounded-lg inline-flex mb-6">
             <button
               type="button" 
               onClick={() => setFormData({...formData, mode: 'offer'})}
               className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${formData.mode === 'offer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
             >
               Offer Ride
             </button>
             <button
               type="button"
               onClick={() => setFormData({...formData, mode: 'request'})}
               className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${formData.mode === 'request' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}
             >
               Request Ride
             </button>
           </div>

           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
             {formData.mode === 'offer' ? <Car size={32} className="text-blue-500" /> : <HelpCircle size={32} className="text-purple-500" />}
           </div>
           
           <h3 className="text-lg font-bold text-slate-800 mb-2">{formData.mode === 'offer' ? 'Offer a Ride' : 'Request a Ride'}</h3>
           <p className="text-sm text-slate-500 mb-6">
             {formData.mode === 'offer' 
               ? "Going somewhere? Share your ride and split the cost." 
               : "Need a lift? Let drivers know where you're headed."}
           </p>
           
           <div className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Origin</label>
                <input 
                  required
                  type="text" 
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                  placeholder="Start location (e.g., Campus)" 
                  className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-100 outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Destination</label>
                <input 
                  required
                  type="text" 
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  placeholder="End location (e.g., City Mall)" 
                  className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-100 outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Date</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-100 outline-none" 
                  />
                 </div>
                 <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Time</label>
                  <input 
                    required
                    type="time" 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-100 outline-none" 
                  />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">{formData.mode === 'offer' ? 'Seats Available' : 'Passengers'}</label>
                  <select 
                    value={formData.seats}
                    onChange={(e) => setFormData({...formData, seats: Number(e.target.value)})}
                    className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    {[1,2,3,4].map(num => <option key={num} value={num}>{num}</option>)}
                  </select>
                 </div>
                 <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">{formData.mode === 'offer' ? 'Cost Per Person (₹)' : 'Willing to Pay (₹)'}</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})} 
                    className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-100 outline-none" 
                  />
                 </div>
              </div>
              
              {formData.mode === 'offer' && (
                <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Vehicle Type</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setFormData({...formData, type: 'car'})} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${formData.type === 'car' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-500'}`}>Car</button>
                      <button type="button" onClick={() => setFormData({...formData, type: 'bike'})} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${formData.type === 'bike' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-500'}`}>Bike</button>
                    </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={submitting}
                className={`w-full text-white font-bold py-3 rounded-xl mt-4 shadow-lg transition-all flex items-center justify-center gap-2 ${formData.mode === 'offer' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}`}
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : (formData.mode === 'offer' ? 'Publish Ride' : 'Post Request')}
              </button>
           </div>
        </form>
      )}

      {/* Chat Modal */}
      {chatOpen && chatTarget && (
        <ChatModal 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)} 
          currentUser={currentUser}
          otherUser={chatTarget}
          contextType="pooling"
          contextTitle={chatTitle}
        />
      )}
    </div>
  );
};

export default Pooling;