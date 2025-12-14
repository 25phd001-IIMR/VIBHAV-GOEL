import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, X, Loader2, Package, Hand, Heart, MessageCircle } from 'lucide-react';
import { RentalItem, User as UserType } from '../types';
import { db } from '../utils/db';
import ChatModal from './ChatModal';

interface RentingProps {
  currentUser: UserType;
}

const Renting: React.FC<RentingProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'post'>('browse');
  const [browseMode, setBrowseMode] = useState<'offer' | 'request'>('offer');
  
  const [items, setItems] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<UserType | null>(null);
  const [chatTitle, setChatTitle] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic' as any,
    price: '',
    rateUnit: 'day' as 'hour' | 'day' | 'week',
    mode: 'offer' as 'offer' | 'request',
    transactionType: 'rent' as 'rent' | 'share' // Helper for UI
  });

  const loadItems = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const data = await db.items.getAll();
    setItems(data);
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    loadItems(true);
    // Poll every 3 seconds
    const interval = setInterval(() => loadItems(false), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalPrice = formData.transactionType === 'share' ? 0 : Number(formData.price);
      
      await db.items.create({
        title: formData.title,
        category: formData.category,
        price: finalPrice,
        rateUnit: formData.rateUnit,
        mode: formData.mode
      }, currentUser);
      
      setFormData({ title: '', category: 'Academic', price: '', rateUnit: 'day', mode: 'offer', transactionType: 'rent' });
      setActiveTab('browse');
      loadItems(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookItem = async (id: string, mode: 'offer' | 'request') => {
    setBookingId(id);
    try {
      const success = await db.items.book(id);
      if (success) {
        await loadItems();
        if (mode === 'offer') {
          alert("Item booked successfully!");
        } else {
          alert("You offered to help with this request! Contact the user.");
        }
      } else {
        alert("Action failed.");
      }
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setBookingId(null);
    }
  };

  const openChat = (targetUser: UserType, title: string) => {
    setChatTarget(targetUser);
    setChatTitle(title);
    setChatOpen(true);
  };

  const filteredItems = items.filter(item => {
    if (item.mode !== browseMode) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  const categories = ['All', 'Academic', 'Electronics', 'Appliances', 'Sports', 'Misc'];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20 animate-fade-in relative">
      
      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'browse' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Browse
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'post' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
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
               className={`text-sm font-bold pb-2 border-b-2 transition-colors ${browseMode === 'offer' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'}`}
             >
               Find Items
             </button>
             <button 
               onClick={() => setBrowseMode('request')}
               className={`text-sm font-bold pb-2 border-b-2 transition-colors ${browseMode === 'request' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'}`}
             >
               Requests
             </button>
          </div>

          {/* Search & Categories */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder={browseMode === 'offer' ? "Search items to rent..." : "Search items people need..."}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((cat, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Items */}
          <div className="flex justify-between items-center mt-2">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-opacity-70">
               {browseMode === 'offer' ? 'Available Listings' : 'Wanted Items'}
             </h3>
             <span className="text-xs text-slate-400 font-medium">{filteredItems.length} found</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-emerald-600" />
            </div>
          ) : filteredItems.length === 0 ? (
             <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
               <p>No {browseMode === 'offer' ? 'items' : 'requests'} found matching your criteria.</p>
               <button onClick={() => setActiveTab('post')} className="text-emerald-600 font-bold text-sm mt-2">
                 {browseMode === 'offer' ? 'Have something to rent?' : 'Need something?'}
               </button>
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredItems.map((item: RentalItem) => (
                <div key={item.id} className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group relative ${item.status === 'rented' ? 'opacity-75' : ''}`}>
                  <div className="h-32 bg-slate-200 relative overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
                      {item.price === 0 ? (
                        <span className="text-white text-xs font-bold flex items-center gap-1">
                          <Heart size={10} className="fill-white" /> Free
                        </span>
                      ) : (
                        <span className="text-white text-xs font-bold">₹{item.price}/{item.rateUnit}</span>
                      )}
                    </div>
                    {item.status === 'rented' && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {item.mode === 'offer' ? 'Rented' : 'Fulfilled'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Badge for Request */}
                  {item.mode === 'request' && (
                     <div className="absolute top-2 left-2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                        Wanted
                     </div>
                  )}

                  <div className="p-3">
                    <span className="text-[10px] uppercase tracking-wide text-emerald-600 font-bold mb-1 block">{item.category}</span>
                    <h4 className="text-sm font-bold text-slate-800 leading-tight mb-2 h-10 overflow-hidden">{item.title}</h4>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-1.5">
                        <img src={item.owner.avatar} className="w-5 h-5 rounded-full" alt="Owner" />
                        <span className="text-xs text-slate-500 truncate max-w-[60px]">{item.owner.name.split(' ')[0]}</span>
                      </div>
                      
                      <div className="flex gap-1">
                        {item.owner.id !== currentUser.id && (
                           <button 
                             onClick={() => openChat(item.owner, item.title)}
                             className="text-slate-500 hover:text-emerald-600 p-1.5 rounded-md bg-slate-50 hover:bg-emerald-50 transition-all"
                           >
                             <MessageCircle size={14} />
                           </button>
                        )}
                        <button 
                          onClick={() => handleBookItem(item.id, item.mode)}
                          disabled={item.status === 'rented' || bookingId === item.id}
                          className={`text-xs px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                            item.status === 'rented'
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : item.mode === 'offer'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                          }`}
                        >
                          {bookingId === item.id && <Loader2 className="animate-spin" size={10} />}
                          {item.status === 'rented' 
                            ? 'Unavailable' 
                            : item.mode === 'offer' 
                              ? (item.price === 0 ? 'Borrow' : 'Rent')
                              : 'Offer Help'
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'post' && (
        <form onSubmit={handleCreateItem} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
            {/* Post Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg inline-flex mb-6">
             <button
               type="button" 
               onClick={() => setFormData({...formData, mode: 'offer'})}
               className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${formData.mode === 'offer' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
             >
               List Item
             </button>
             <button
               type="button"
               onClick={() => setFormData({...formData, mode: 'request'})}
               className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${formData.mode === 'request' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}
             >
               Request Item
             </button>
           </div>

           <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
             {formData.mode === 'offer' ? <Package size={32} className="text-emerald-500" /> : <Hand size={32} className="text-purple-500" />}
           </div>

           <h3 className="text-lg font-bold text-slate-800 mb-2">{formData.mode === 'offer' ? 'List an Item' : 'Request an Item'}</h3>
           <p className="text-sm text-slate-500 mb-6">
             {formData.mode === 'offer' 
               ? "Share resources with your campus community." 
               : "Looking for something? Ask your peers."}
           </p>

           <div className="space-y-4 text-left">
              <div>
                 <label className="text-xs font-bold text-slate-700 mb-1 block">Item Name</label>
                 <input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Scientific Calculator" 
                    className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-emerald-100 outline-none" 
                 />
               </div>
               
               {/* Rent vs Share Toggle */}
               <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    {formData.mode === 'offer' ? 'Transaction Type' : 'Budget Preference'}
                  </label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="transactionType" 
                        checked={formData.transactionType === 'rent'} 
                        onChange={() => setFormData({...formData, transactionType: 'rent'})}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-700">{formData.mode === 'offer' ? 'Rent (Charge Money)' : 'Rent (Willing to Pay)'}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="transactionType" 
                        checked={formData.transactionType === 'share'} 
                        onChange={() => setFormData({...formData, transactionType: 'share'})}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-700">{formData.mode === 'offer' ? 'Share (Free)' : 'Borrow (Free)'}</span>
                    </label>
                  </div>
               </div>

               {formData.transactionType === 'rent' && (
                 <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Price (₹)</label>
                      <input 
                        required
                        type="number"
                        min="1"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="0"
                        className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-emerald-100 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Per</label>
                      <select 
                        value={formData.rateUnit}
                        onChange={(e) => setFormData({...formData, rateUnit: e.target.value as any})}
                        className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-emerald-100 outline-none"
                      >
                        <option value="hour">Hour</option>
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                      </select>
                    </div>
                 </div>
               )}
               
               <div>
                 <label className="text-xs font-bold text-slate-700 mb-1 block">Category</label>
                 <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-emerald-100 outline-none"
                 >
                   {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                 </select>
               </div>
               
               <button 
                 type="submit" 
                 disabled={submitting}
                 className={`w-full text-white font-bold py-3 rounded-xl mt-4 shadow-lg transition-all flex items-center justify-center gap-2 ${formData.mode === 'offer' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}`}
               >
                 {submitting ? <Loader2 className="animate-spin" /> : (formData.mode === 'offer' ? 'List Item' : 'Post Request')}
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
          contextType="renting"
          contextTitle={chatTitle}
        />
      )}
    </div>
  );
};

export default Renting;