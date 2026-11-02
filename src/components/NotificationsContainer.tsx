import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const NotificationsContainer: React.FC = () => {
  const { notifications, dismissNotification } = useRestaurant();

  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto bg-stone-900 text-white rounded-xl p-3.5 shadow-xl border border-stone-800 flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-200"
        >
          {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
          {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
          {n.type === 'error' && <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
          {n.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}

          <div className="flex-1 text-xs">
            <div className="font-bold text-white flex items-center justify-between">
              <span>{n.title}</span>
              <span className="text-[10px] text-stone-400 font-mono-nums">{n.timestamp}</span>
            </div>
            <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">{n.message}</p>
          </div>

          <button
            type="button"
            onClick={() => dismissNotification(n.id)}
            aria-label="Dismiss notification"
            className="text-stone-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
