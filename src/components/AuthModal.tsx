import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { AucaLogo } from './AucaLogo';
import { X, Mail, Lock, User, Phone, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { isAuthModalOpen, setIsAuthModalOpen, signIn, signUp } = useRestaurant();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('saherslim306@gmail.com');
  const [password, setPassword] = useState('auca2026');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+250 788 ');
  const [address, setAddress] = useState('AUCA Masoro Campus, Kigali');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signin') {
      const res = signIn(email, password);
      if (!res.success) {
        setError(res.error || 'Could not sign in.');
        return;
      }
      if (onSuccess) onSuccess();
    } else {
      const res = signUp({ name, email, phone, address, password });
      if (!res.success) {
        setError(res.error || 'Could not create account.');
        return;
      }
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 bg-stone-900/65 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with AUCA Logo */}
        <div className="relative bg-gradient-to-br from-[#0B2545] to-[#134074] text-white p-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            aria-label="Close authentication modal"
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <AucaLogo size={48} />

          <div>
            <h2 id="auth-modal-title" className="text-lg font-extrabold tracking-tight text-white">
              AUCA KITCHEN
            </h2>
            <p className="text-xs text-amber-300 font-medium">
              {mode === 'signin'
                ? 'Sign in to confirm & track your order'
                : 'Create your student / guest dining account'}
            </p>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-stone-100 border-b border-stone-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              if (email === 'saherslim306@gmail.com') setEmail('');
            }}
            className={`py-2.5 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign Up (New Account)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className="block text-stone-700 font-semibold mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sirelkhatim Abdallah"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-stone-700 font-semibold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@auca.ac.rw or email@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 font-medium"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="auth-phone" className="block text-stone-700 font-semibold mb-1">
                  Phone Number (Kigali / MoMo)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 123 456"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-address" className="block text-stone-700 font-semibold mb-1">
                  Default Delivery Address / Campus
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="AUCA Masoro Campus, Kigali"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 font-medium"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-password" className="block text-stone-700 font-semibold mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0B2545] hover:bg-[#134074] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>
              {mode === 'signin'
                ? 'Sign In & Continue'
                : 'Create Account & Claim 100 Bonus Points'}
            </span>
          </button>

          <div className="text-center pt-1 text-[11px] text-stone-500">
            {mode === 'signin' ? (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-amber-600 font-bold hover:underline"
                >
                  Sign Up here
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="text-amber-600 font-bold hover:underline"
                >
                  Sign In here
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
