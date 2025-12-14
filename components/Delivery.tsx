import React, { useState, useEffect } from 'react';
import { MapPin, Clock, User, PlusCircle, X, Loader2, ShoppingBag, Bike, MessageCircle } from 'lucide-react';
import { DeliveryTask, User as UserType } from '../types';
import { db } from '../utils/db';
import ChatModal from './ChatModal';

interface DeliveryProps {
  currentUser: UserType;
}

const Delivery: React.FC<DeliveryProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'post'>('browse');
  const [browseMode, setBrowseMode] = useState<'request' | 'offer'>('request');
  
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<UserType | null>(null);
  const [chatTitle, setChatTitle] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pickup: '',
    dropoff: '',
    amount: '',
    deadline: '',
    mode: 'request' as 'request' | 'offer'
  });

  const loadTasks = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const data = await db.tasks.getAll();
    setTasks(data);
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    loadTasks(true);
    // Poll every 3 seconds
    const interval = setInterval(() => loadTasks(false), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await db.tasks.create({
        title: formData.title,
        description: formData.description,
        pickup: formData.pickup,
        dropoff: formData.dropoff,
        offerAmount: Number(formData.amount),
        deadline: formData.deadline || 'ASAP',
        mode: formData.mode
      }, currentUser);
      
      setFormData({ title: '', description: '', pickup: '', dropoff: '', amount: '', deadline: '', mode: 'request' });
      setActiveTab('browse');
      loadTasks(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptTask = async (id: string, mode: 'request' | 'offer') => {
    setAcceptingId(id);
    try {
      const success = await db.tasks.accept(id);
      if (success) {
        await loadTasks();
        if (mode === 'request') {
          alert("Task accepted! Please coordinate with the requester.");
        } else {
          alert("Request sent to runner! They will contact you.");
        }
      } else {
        alert("Action failed. Task might be taken.");
      }
    } catch (error) {
      console.error("Error accepting task:", error);
    } finally {
      setAcceptingId(null);
    }
  };

  const openChat = (targetUser: UserType, title: string) => {
    setChatTarget(targetUser);
    setChatTitle(title);
    setChatOpen(true);
  };

  const filteredTasks = tasks.filter(task => task.mode === browseMode);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20 animate-fade-in relative">
      
       {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'browse' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Browse
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'post' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
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
               onClick={() => setBrowseMode('request')}
               className={`text-sm font-bold pb-2 border-b-2 transition-colors ${browseMode === 'request' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400'}`}
             >
               Find Tasks (Earn)
             </button>
             <button 
               onClick={() => setBrowseMode('offer')}
               className={`text-sm font-bold pb-2 border-b-2 transition-colors ${browseMode === 'offer' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400'}`}
             >
               Find Runners (Send)
             </button>
          </div>

          <div className="flex justify-between items-center mt-2">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-opacity-70">
               {browseMode === 'request' ? 'Available Tasks' : 'Available Runners'}
             </h3>
             <span className="text-xs text-slate-400 font-medium">{filteredTasks.length} found</span>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            {loading ? (
               <div className="flex justify-center py-10">
                 <Loader2 className="animate-spin text-amber-500" />
               </div>
            ) : filteredTasks.length === 0 ? (
               <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p>No active {browseMode === 'request' ? 'tasks' : 'runners'} found.</p>
                  <button onClick={() => setActiveTab('post')} className="text-amber-600 font-bold text-sm mt-2">
                    {browseMode === 'request' ? 'Need something delivered?' : 'Going somewhere? Offer to deliver.'}
                  </button>
               </div>
            ) : (
              filteredTasks.map((task: DeliveryTask) => (
                <div key={task.id} className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-amber-200 transition-all ${task.status === 'assigned' ? 'opacity-75' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${task.mode === 'request' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                          {task.mode === 'request' ? '₹' : <Bike size={20}/>}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{task.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                        </div>
                    </div>
                    {task.mode === 'request' ? (
                       <span className="text-lg font-bold text-amber-600">₹{task.offerAmount}</span>
                    ) : (
                       <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">Fee: ₹{task.offerAmount}</span>
                    )}
                  </div>

                  {/* Badge for Type */}
                  {task.mode === 'offer' && (
                     <div className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-2">
                        Runner Available
                     </div>
                  )}

                  <div className="bg-slate-50 rounded-lg p-3 space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium w-12">{task.mode === 'request' ? 'Pickup' : 'From'}</span>
                      <span className="text-xs text-slate-800 font-semibold">{task.pickup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className={task.mode === 'request' ? "text-amber-500" : "text-blue-500"} />
                      <span className="text-xs text-slate-500 font-medium w-12">{task.mode === 'request' ? 'Drop' : 'To'}</span>
                      <span className="text-xs text-slate-800 font-semibold">{task.dropoff}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={task.requester.avatar} className="w-5 h-5 rounded-full" alt="req" />
                      <span className="text-xs text-slate-500">{task.mode === 'request' ? 'By' : 'Runner'} {task.requester.name.split(' ')[0]}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {task.deadline}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                       {task.requester.id !== currentUser.id && (
                         <button 
                           onClick={() => openChat(task.requester, task.title)}
                           className="text-slate-500 hover:text-amber-600 p-2 rounded-lg bg-slate-50 hover:bg-amber-50 transition-all"
                         >
                            <MessageCircle size={18} />
                         </button>
                       )}
                       <button 
                        onClick={() => handleAcceptTask(task.id, task.mode)}
                        disabled={task.status !== 'open' || acceptingId === task.id}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                          task.status !== 'open'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : task.mode === 'request'
                              ? 'bg-amber-600 text-white hover:bg-amber-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {acceptingId === task.id && <Loader2 className="animate-spin" size={14} />}
                        {task.status === 'open' 
                          ? (task.mode === 'request' ? 'Accept Task' : 'Request Delivery') 
                          : 'Assigned'
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
         <form onSubmit={handleCreateTask} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
             {/* Post Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg inline-flex mb-6">
             <button
               type="button" 
               onClick={() => setFormData({...formData, mode: 'request'})}
               className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${formData.mode === 'request' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}
             >
               Request Delivery
             </button>
             <button
               type="button"
               onClick={() => setFormData({...formData, mode: 'offer'})}
               className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${formData.mode === 'offer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
             >
               Offer Delivery
             </button>
           </div>

           <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              {formData.mode === 'request' ? <ShoppingBag size={32} className="text-amber-600" /> : <Bike size={32} className="text-blue-600" />}
           </div>

           <h3 className="text-lg font-bold text-slate-800 mb-2">{formData.mode === 'request' ? 'Create Delivery Request' : 'Broadcast Your Route'}</h3>
           <p className="text-sm text-slate-500 mb-6">
             {formData.mode === 'request' 
               ? "Need something moved? Post a request for campus runners." 
               : "Going somewhere? Let others know you can deliver items."}
           </p>
            
            <div className="space-y-4 text-left">
               <div>
                 <label className="text-xs font-bold text-slate-700 mb-1 block">
                   {formData.mode === 'request' ? 'What do you need?' : 'Where are you going?'}
                 </label>
                 <input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder={formData.mode === 'request' ? "e.g. Pickup laundry" : "e.g. Trip to City Mall"} 
                    className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-amber-100 outline-none" 
                 />
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-700 mb-1 block">Description</label>
                 <textarea 
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Details..." 
                    className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-amber-100 outline-none resize-none" 
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">{formData.mode === 'request' ? 'Pickup From' : 'Starting From'}</label>
                    <input 
                      required
                      value={formData.pickup}
                      onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                      placeholder="Location"
                      className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-amber-100 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">{formData.mode === 'request' ? 'Drop At' : 'Going To'}</label>
                    <input 
                      required
                      value={formData.dropoff}
                      onChange={(e) => setFormData({...formData, dropoff: e.target.value})}
                      placeholder="Location"
                      className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-amber-100 outline-none" 
                    />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">{formData.mode === 'request' ? 'Offer Amount (₹)' : 'Service Fee (₹)'}</label>
                    <input 
                      required
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="0"
                      className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-amber-100 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">{formData.mode === 'request' ? 'Deadline' : 'Departure Time'}</label>
                    <input 
                      type="time"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-amber-100 outline-none" 
                    />
                  </div>
               </div>
               
               <button 
                 type="submit" 
                 disabled={submitting}
                 className={`w-full text-white font-bold py-3 rounded-xl mt-4 shadow-lg transition-all flex items-center justify-center gap-2 ${formData.mode === 'request' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
               >
                 {submitting ? <Loader2 className="animate-spin" /> : (formData.mode === 'request' ? 'Post Request' : 'Broadcast Route')}
               </button>
            </form>
      )}

      {/* Chat Modal */}
      {chatOpen && chatTarget && (
        <ChatModal 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)} 
          currentUser={currentUser}
          otherUser={chatTarget}
          contextType="delivery"
          contextTitle={chatTitle}
        />
      )}
    </div>
  );
};

export default Delivery;