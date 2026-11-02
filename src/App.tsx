import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { TopBar } from './components/TopBar';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { CustomerMenu } from './components/CustomerMenu';
import { CartAndCheckout } from './components/CartAndCheckout';
import { StaffDashboard } from './components/StaffDashboard';
import { DeliveryDashboard } from './components/DeliveryDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { OrderTrackingView } from './components/OrderTrackingView';
import { LoyaltyView } from './components/LoyaltyView';
import { OrderHistoryView } from './components/OrderHistoryView';
import { NotificationsContainer } from './components/NotificationsContainer';
import { AuthModal } from './components/AuthModal';
import { AucaLogo } from './components/AucaLogo';
import { MapPin, Phone, Clock } from 'lucide-react';

type ActiveView =
  | 'menu'
  | 'cart'
  | 'tracking'
  | 'history'
  | 'loyalty'
  | 'staff'
  | 'delivery'
  | 'admin';

const MainAppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('menu');
  const { setActiveTrackOrderId, role, t } = useRestaurant();

  const handleOrderSuccess = (orderId: string) => {
    setActiveTrackOrderId(orderId);
    setActiveView('tracking');
  };

  const handleSelectHistoryOrder = (orderId: string) => {
    setActiveTrackOrderId(orderId);
    setActiveView('tracking');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      {/* Role Switcher Simulator Header */}
      <RoleSwitcherBar activeView={activeView} setActiveView={setActiveView} />

      {/* Top Bar Contract (§2) */}
      <TopBar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeView === 'menu' && (
          <CustomerMenu onOpenCart={() => setActiveView('cart')} />
        )}

        {activeView === 'cart' && (
          <CartAndCheckout
            onBackToMenu={() => setActiveView('menu')}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {activeView === 'tracking' && (
          <OrderTrackingView onBackToMenu={() => setActiveView('menu')} />
        )}

        {activeView === 'loyalty' && (
          <LoyaltyView onBackToMenu={() => setActiveView('menu')} />
        )}

        {activeView === 'history' && (
          <OrderHistoryView
            onSelectOrder={handleSelectHistoryOrder}
            onBackToMenu={() => setActiveView('menu')}
          />
        )}

        {activeView === 'staff' && <StaffDashboard />}

        {activeView === 'delivery' && <DeliveryDashboard />}

        {activeView === 'admin' && <AdminDashboard />}
      </main>

      {/* Real-Time Floating Toasts */}
      <NotificationsContainer />

      {/* Customer Sign In / Sign Up Modal */}
      <AuthModal />

      {/* Editorial Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <AucaLogo size={32} />
                <div className="text-sm font-extrabold text-stone-900 tracking-tight">
                  AUCA KITCHEN
                </div>
              </div>
              <p className="text-xs leading-relaxed text-stone-500">
                Adventist University of Central Africa centralized restaurant ordering system
                bridging campus culinary craft, kitchen operations, and swift Kigali dispatch.
              </p>
              <div className="text-[11px] text-stone-400">
                Software Requirements Elicitation Group 8 Specification
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                Kigali Location
              </div>
              <div className="flex items-start gap-2 text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>KN 5 Rd, Boulevard de Kiyovu, Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>+250 788 412 901</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                Opening Hours
              </div>
              <div className="flex items-start gap-2 text-stone-600">
                <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <div>Mon – Fri: 08:00 AM – 10:30 PM</div>
                  <div>Sat – Sun: 09:00 AM – 11:30 PM</div>
                </div>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                Kitchen Open · Live Orders Active
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                Quick Switch Views
              </div>
              <ul className="space-y-1 text-stone-600">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveView('menu')}
                    className="hover:text-amber-600"
                  >
                    Customer Menu & Customization
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveView('staff')}
                    className="hover:text-amber-600"
                  >
                    Kitchen Staff Display (WF3)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveView('delivery')}
                    className="hover:text-amber-600"
                  >
                    Delivery Dispatcher Console (WF4)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveView('admin')}
                    className="hover:text-amber-600"
                  >
                    Manager Analytics & Menu Editor (WF5)
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
            <div>
              © 2026 AUCA KITCHEN · All rights reserved. Multilingual support: EN / FR / RW / SW · Rate: 1 USD = 1,460 RWF.
            </div>
            <div className="flex items-center gap-4">
              <span>Performance: &lt;3s Order Response</span>
              <span>·</span>
              <span>Encryption & Secure Payment</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <MainAppContent />
    </RestaurantProvider>
  );
}
