import React, { useState, useEffect } from 'react';
import { Loader2, Receipt, CheckCircle, Clock, CreditCard, ShoppingBag, Car, Package } from 'lucide-react';
import { Bill, User } from '../types';
import { db } from '../utils/db';

interface BillsProps {
  currentUser: User;
}

const Bills: React.FC<BillsProps> = ({ currentUser }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadBills();
    // Poll for updates
    const interval = setInterval(loadBills, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadBills = async () => {
    // In a real app we'd filter by currentUser.id
    const data = await db.bills.getAll(currentUser.id);
    setBills(data);
    setLoading(false);
  };

  const handlePay = async (id: string) => {
    setProcessingId(id);
    try {
      await db.bills.pay(id);
      await loadBills();
      alert("Payment Successful!");
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBills = bills.filter(b => b.status === activeTab);
  const totalPending = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ride': return <Car size={20} className="text-blue-500" />;
      case 'rent': return <Package size={20} className="text-emerald-500" />;
      case 'delivery': return <ShoppingBag size={20} className="text-amber-500" />;
      default: return <Receipt size={20} className="text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in pb-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">My Bills</h2>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-5">
          <Receipt size={150} />
        </div>
        <p className="text-slate-400 text-sm font-medium mb-1">Total Outstanding</p>
        <h3 className="text-4xl font-bold">₹{totalPending}</h3>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <Clock size={12} /> {bills.filter(b => b.status === 'pending').length} bills due
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-4">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`flex-1 pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'pending' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          Pending
          {activeTab === 'pending' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('paid')}
          className={`flex-1 pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'paid' ? 'text-green-600' : 'text-slate-400'
          }`}
        >
          Paid
          {activeTab === 'paid' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full"></span>}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm">No {activeTab} bills found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBills.map((bill) => (
            <div key={bill.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                {getIcon(bill.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 truncate">{bill.title}</h4>
                <p className="text-xs text-slate-500 truncate">{bill.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">To: {bill.merchantName}</span>
                  <span className="text-[10px] text-slate-400">Due: {bill.dueDate}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-bold text-slate-800">₹{bill.amount}</span>
                {bill.status === 'pending' ? (
                  <button 
                    onClick={() => handlePay(bill.id)}
                    disabled={!!processingId}
                    className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1"
                  >
                    {processingId === bill.id ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />}
                    Pay
                  </button>
                ) : (
                  <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                    <CheckCircle size={12} /> Paid
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bills;