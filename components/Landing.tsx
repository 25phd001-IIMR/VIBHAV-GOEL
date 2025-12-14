import React from 'react';
import { Car, Package, ShoppingBag, ArrowRight, Shield, Users } from 'lucide-react';

interface LandingProps {
  onStart: (mode: 'login' | 'signup') => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
           Campus Connect
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={() => onStart('login')}
            className="text-slate-600 font-semibold hover:text-slate-900 px-4 py-2"
          >
            Sign In
          </button>
          <button 
            onClick={() => onStart('signup')}
            className="bg-slate-900 text-white font-semibold px-6 py-2 rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          Live for IIM Raipur
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight max-w-4xl">
          Everything you need, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">right on campus.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
          The all-in-one platform for students to share rides, rent essentials, and get deliveries done. Connect, share, and save together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
           <button 
             onClick={() => onStart('signup')}
             className="bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
           >
             Join Now <ArrowRight size={20} />
           </button>
           <button className="bg-white text-slate-700 text-lg font-bold px-8 py-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
             Learn More
           </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Car size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Smart Pooling</h3>
              <p className="text-slate-500">Find rides to the city or airport. Share cabs, split costs, and travel safely with verified students.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Package size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Campus Renting</h3>
              <p className="text-slate-500">Need a calculator, a cycle, or a textbook? Rent or borrow from peers instantly.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingBag size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Peer Delivery</h3>
              <p className="text-slate-500">Get food or groceries delivered by students already heading that way. Earn by helping others.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="py-12 border-t border-slate-100 text-center">
         <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Shield size={18} /> Verified Students
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} /> Campus Exclusive
            </div>
         </div>
      </div>
    </div>
  );
};

export default Landing;