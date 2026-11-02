import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { UserRole } from '../types';
import { ShoppingCart, ChefHat, Bike, ShieldCheck, Eye } from 'lucide-react';

interface RoleSwitcherBarProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ activeView, setActiveView }) => {
  const { role, setRole, orders } = useRestaurant();

  const newOrdersCount = orders.filter((o) => o.status === 'new').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const assignedDeliveryCount = orders.filter((o) => ['assigned', 'ready', 'picked_up', 'on_the_way'].includes(o.status)).length;

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'customer') {
      setActiveView('menu');
    } else if (newRole === 'staff') {
      setActiveView('staff');
    } else if (newRole === 'delivery') {
      setActiveView('delivery');
    } else if (newRole === 'manager') {
      setActiveView('admin');
    }
  };

  return (
    <aside aria-label="Role preview navigator" className="bg-stone-900 text-stone-200 border-b border-stone-800 text-xs py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-stone-400">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-stone-300">Live Stakeholder Simulator</span>
          <span className="text-stone-500">·</span>
          <span className="hidden sm:inline text-stone-400">
            Requirements Document (Group 8) Wireframes 1–5
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-950/80 p-1 rounded-lg border border-stone-800">
          <button
            type="button"
            onClick={() => handleRoleSelect('customer')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              role === 'customer'
                ? 'bg-amber-500 text-stone-950 shadow-xs font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('staff')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              role === 'staff'
                ? 'bg-amber-500 text-stone-950 shadow-xs font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen Staff</span>
            {newOrdersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-mono-nums font-bold">
                {newOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('delivery')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              role === 'delivery'
                ? 'bg-amber-500 text-stone-950 shadow-xs font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Delivery Rider</span>
            {assignedDeliveryCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-mono-nums font-bold">
                {assignedDeliveryCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('manager')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              role === 'manager'
                ? 'bg-amber-500 text-stone-950 shadow-xs font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
