import React, { useState } from 'react';
import { Loader2, ArrowLeft, Mail, Lock, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { db } from '../utils/db';

interface AuthProps {
  mode: 'login' | 'signup';
  setMode: (mode: 'login' | 'signup') => void;
  onAuthSuccess: (user: User) => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, setMode, onAuthSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (!name) throw new Error("Name is required");
        const user = await db.auth.signUp(email, name);
        onAuthSuccess(user);
      } else {
        const user = await db.auth.signIn(email);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    // Simulate Google Login returning a demo user
    setTimeout(async () => {
       // Just pick the seed user for Google Auth demo
       try {
         const user = await db.auth.signIn('rahul.s@iimraipur.ac.in');
         onAuthSuccess(user);
       } catch (e) {
         setLoading(false);
       }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
           <button 
             onClick={onBack}
             className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
           >
             <ArrowLeft size={20} />
           </button>
           <div className="mt-8">
             <h2 className="text-2xl font-bold mb-1">{mode === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
             <p className="text-slate-400 text-sm">
               {mode === 'login' ? 'Sign in to access your campus dashboard.' : 'Join the community to start sharing.'}
             </p>
           </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
             {mode === 'signup' && (
               <div>
                 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                 <div className="relative">
                   <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                     required
                     type="text" 
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="John Doe"
                     className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800"
                   />
                 </div>
               </div>
             )}
             
             <div>
               <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   required
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="student@iimraipur.ac.in"
                   className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800"
                 />
               </div>
             </div>
             
             <div>
               <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   required
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800"
                 />
               </div>
             </div>

             <button 
               type="submit"
               disabled={loading}
               className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4"
             >
               {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Sign Up')}
             </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
             </svg>
             Google
          </button>

          <p className="text-center text-xs font-bold text-slate-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-blue-600 hover:text-blue-700">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;