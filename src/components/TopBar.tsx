import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Language } from '../types';
import { AucaLogo } from './AucaLogo';
import { ShoppingBag, Globe, Coins, UserCheck, LogIn, LogOut } from 'lucide-react';

interface TopBarProps {
  activeView: 'menu' | 'cart' | 'tracking' | 'history' | 'loyalty' | 'staff' | 'delivery' | 'admin';
  setActiveView: (view: 'menu' | 'cart' | 'tracking' | 'history' | 'loyalty' | 'staff' | 'delivery' | 'admin') => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeView, setActiveView }) => {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    cartCount,
    customerProfile,
    isAuthenticated,
    setIsAuthModalOpen,
    signOut,
    t,
  } = useRestaurant();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark with AUCA University Logo */}
          <button
            type="button"
            onClick={() => setActiveView('menu')}
            className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg shrink-0"
          >
            <AucaLogo size={40} />
            <span className="text-lg font-extrabold tracking-tight text-stone-900 group-hover:text-amber-600 transition-colors whitespace-nowrap">
              {t('restaurantName')}
            </span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <button
              type="button"
              onClick={() => setActiveView('menu')}
              className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'menu' ? 'text-amber-600 font-semibold' : ''
              }`}
            >
              {t('menu')}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('tracking')}
              className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'tracking' ? 'text-amber-600 font-semibold' : ''
              }`}
            >
              {t('trackOrder')}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('loyalty')}
              className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeView === 'loyalty' ? 'text-amber-600 font-semibold' : ''
              }`}
            >
              <Coins className="w-4 h-4 text-amber-500" />
              <span>{t('loyaltyRewards')}</span>
              <span className="font-mono-nums text-xs text-amber-700 font-semibold">
                ({customerProfile.loyaltyPoints} pts)
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'history' ? 'text-amber-600 font-semibold' : ''
              }`}
            >
              {t('orderHistory')}
            </button>
          </nav>

          {/* Zone 3: Primary Action & Utilities */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Language Switcher */}
            <div className="relative group">
              <label htmlFor="language-select" className="sr-only">
                Language
              </label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer">
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-transparent border-none text-stone-800 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Currency Toggle (1 USD = 1460 RWF) */}
            <div
              className="flex items-center rounded-lg border border-stone-200 p-0.5 text-xs font-semibold"
              title="Exchange Rate: 1 USD = 1,460 RWF"
            >
              <button
                type="button"
                onClick={() => setCurrency('RWF')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  currency === 'RWF'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                RWF
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  currency === 'USD'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                USD
              </button>
            </div>

            {/* Customer Account Sign In / Profile Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-semibold text-emerald-950 max-w-[110px] truncate hidden sm:inline">
                  {customerProfile.name.split(' ')[0]}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  aria-label="Sign Out"
                  title="Sign Out"
                  className="text-stone-400 hover:text-red-600 ml-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2545] hover:bg-[#134074] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In / Sign Up</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setActiveView('cart')}
              aria-label={`View cart with ${cartCount} items`}
              className="relative flex items-center justify-center p-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs shrink-0"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 bg-amber-500 text-white text-[11px] font-bold rounded-full font-mono-nums border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
