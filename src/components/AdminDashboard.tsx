import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, UserAccount, UserRole } from '../types';
import { formatCurrency } from '../utils/orderRules';
import {
  ShieldCheck,
  Users,
  Utensils,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Check,
  X,
  CreditCard,
  Percent,
  Coins,
  TrendingUp,
  DollarSign,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    categories,
    orders,
    settings,
    updateSettings,
    currency,
    language,
    t,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'users' | 'menu' | 'reports' | 'settings'>('menu');

  // Menu item modal state
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [newDish, setNewDish] = useState({
    nameEn: '',
    nameFr: '',
    nameRw: '',
    nameSw: '',
    descEn: '',
    descFr: '',
    categoryId: categories[0]?.id || 'cat-specialties',
    basePriceRWF: 8000,
    prepTime: 20,
    emoji: '🍲',
    dietary: ['halal'] as ('vegetarian' | 'vegan' | 'halal' | 'gluten-free' | 'chef-special')[],
  });

  // User modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff' as UserRole,
  });

  // Reports calculations
  const totalOrders = orders.length;
  const totalRevenueRWF = orders.reduce((sum, o) => sum + o.totalAmountRWF, 0);
  const paidOrdersCount = orders.filter((o) => o.paymentStatus === 'paid').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const totalPointsIssued = orders.reduce((sum, o) => sum + o.pointsEarned, 0);

  const paymentBreakdown = {
    momo: orders.filter((o) => o.paymentMethod === 'momo').length,
    online_card: orders.filter((o) => o.paymentMethod === 'online_card').length,
    cash: orders.filter((o) => o.paymentMethod === 'cash').length,
  };

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDish.nameEn) return;

    addMenuItem({
      name: {
        en: newDish.nameEn,
        fr: newDish.nameFr || newDish.nameEn,
        rw: newDish.nameRw || newDish.nameEn,
        sw: newDish.nameSw || newDish.nameEn,
      },
      description: {
        en: newDish.descEn || 'Freshly prepared specialty.',
        fr: newDish.descFr || newDish.descEn || 'Spécialité fraîchement préparée.',
        rw: newDish.descEn || 'Ibiryo bitunganyijwe neza.',
        sw: newDish.descEn || 'Chakula kizuri kilichotayarishwa.',
      },
      categoryId: newDish.categoryId,
      basePriceRWF: Number(newDish.basePriceRWF),
      isAvailable: true,
      prepTimeMinutes: Number(newDish.prepTime),
      dietary: newDish.dietary,
      imageEmoji: newDish.emoji,
      accentBg: 'from-amber-600 to-orange-700',
      rating: 5.0,
      reviewCount: 1,
      customizationOptions: {},
    });

    setIsAddDishOpen(false);
    setNewDish({
      nameEn: '',
      nameFr: '',
      nameRw: '',
      nameSw: '',
      descEn: '',
      descFr: '',
      categoryId: categories[0]?.id || 'cat-specialties',
      basePriceRWF: 8000,
      prepTime: 20,
      emoji: '🍲',
      dietary: ['halal'],
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    addUser({
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '+250 788 000 000',
      role: newUser.role,
      status: 'active',
    });

    setIsAddUserOpen(false);
    setNewUser({ name: '', email: '', phone: '', role: 'staff' });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">
              {t('adminTitle')}
            </h1>
            <p className="text-xs text-stone-500">
              Operations, Menus, Users & Sales Intelligence · PDF Wireframe 5 specification
            </p>
          </div>
        </div>

        {/* Tab navigation matching Wireframe 5 cards */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>{t('tabMenuManagement')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('tabUserManagement')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t('tabOrderReports')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t('tabSystemSettings')}</span>
          </button>
        </div>
      </div>

      {/* 1. Menu Management (Wireframe 5 Card 2) */}
      {activeTab === 'menu' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Menu Items, Prices & Availability
              </h2>
              <p className="text-xs text-stone-500">
                Update prices (Manager-only Business Rule FR7), toggle in-stock states, and manage multilingual dishes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddDishOpen(true)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewDish')}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Item</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Price (RWF)</th>
                  <th className="py-3 px-3 text-center">Prep Time</th>
                  <th className="py-3 px-3 text-center">Availability</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.imageEmoji}</span>
                        <div>
                          <div className="font-bold text-stone-900">
                            {item.name[language] || item.name.en}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate max-w-xs">
                            {item.description[language] || item.description.en}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-stone-600 font-medium capitalize">
                      {categories.find((c) => c.id === item.categoryId)?.name[language] || 'Main'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono-nums font-bold text-stone-900">
                      <div className="flex items-center justify-end gap-1.5">
                        <input
                          type="number"
                          step="500"
                          value={item.basePriceRWF}
                          onChange={(e) =>
                            updateMenuItem(item.id, { basePriceRWF: Number(e.target.value) })
                          }
                          className="w-24 text-right p-1.5 border border-stone-200 rounded-lg text-xs font-mono-nums font-bold focus:border-amber-500 outline-none"
                        />
                        <span className="text-stone-400 text-[10px]">RWF</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono-nums text-stone-600">
                      {item.prepTimeMinutes}m
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleItemAvailability(item.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteMenuItem(item.id)}
                        aria-label={`Delete ${item.name.en}`}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. User Management (Wireframe 5 Card 1) */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                User Management & Roles
              </h2>
              <p className="text-xs text-stone-500">
                Manage Customers, Restaurant Staff, Managers, and Delivery Personnel (PDF Stakeholder Analysis).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff / Rider</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-stone-900">{usr.name}</div>
                      <div className="text-[11px] text-stone-400">{usr.email}</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono-nums text-stone-600">
                      {usr.phone}
                      {usr.assignedZone && (
                        <div className="text-[10px] text-blue-600">{usr.assignedZone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="capitalize font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-medium">
                        {usr.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <select
                        value={usr.role}
                        onChange={(e) => updateUser(usr.id, { role: e.target.value as UserRole })}
                        className="bg-stone-50 border border-stone-200 p-1.5 rounded-lg text-xs font-medium focus:outline-none"
                      >
                        <option value="customer">Customer</option>
                        <option value="staff">Restaurant Staff</option>
                        <option value="delivery">Delivery Personnel</option>
                        <option value="manager">Restaurant Manager</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Order Reports & Analytics (Wireframe 5 Card 3) */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">
                {t('grossRevenue')}
              </span>
              <div className="text-2xl font-black font-mono-nums text-stone-900">
                {formatCurrency(totalRevenueRWF, currency, settings.exchangeRateRWFPerUSD)}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% vs previous period</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">
                {t('totalOrdersToday')}
              </span>
              <div className="text-2xl font-black font-mono-nums text-stone-900">{totalOrders}</div>
              <div className="text-[11px] text-stone-500">
                {paidOrdersCount} Paid online · {totalOrders - paidOrdersCount} Cash on Delivery
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">
                {t('avgDeliveryDuration')}
              </span>
              <div className="text-2xl font-black font-mono-nums text-stone-900">28 mins</div>
              <div className="text-[11px] text-emerald-600 font-medium">94% on-time rate in Kigali</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">
                {t('loyaltyPointsIssued')}
              </span>
              <div className="text-2xl font-black font-mono-nums text-amber-700">
                {totalPointsIssued} pts
              </div>
              <div className="text-[11px] text-stone-500">
                Rate: {settings.loyaltyPointsPer1000RWF} pts / 1,000 RWF
              </div>
            </div>
          </div>

          {/* Payment Methods & Delivery Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                {t('paymentBreakdown')}
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-stone-800 mb-1">
                    <span>MTN Mobile Money / Airtel</span>
                    <span className="font-mono-nums">{paymentBreakdown.momo} orders</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${Math.round((paymentBreakdown.momo / Math.max(1, totalOrders)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-stone-800 mb-1">
                    <span>Online Visa / Mastercard</span>
                    <span className="font-mono-nums">{paymentBreakdown.online_card} orders</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{
                        width: `${Math.round((paymentBreakdown.online_card / Math.max(1, totalOrders)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-stone-800 mb-1">
                    <span>Cash on Delivery</span>
                    <span className="font-mono-nums">{paymentBreakdown.cash} orders</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600"
                      style={{
                        width: `${Math.round((paymentBreakdown.cash / Math.max(1, totalOrders)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Log */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                Recent Orders Ledger
              </h3>
              <div className="space-y-2.5 max-h-56 overflow-y-auto text-xs">
                {orders.slice(0, 6).map((ord) => (
                  <div
                    key={ord.id}
                    className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-stone-900">{ord.orderNumber} · {ord.customer.name}</div>
                      <div className="text-[11px] text-stone-500">
                        {ord.items.length} items · {ord.customer.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono-nums font-bold text-stone-900 block">
                        {formatCurrency(ord.totalAmountRWF, currency, settings.exchangeRateRWFPerUSD)}
                      </span>
                      <span className="text-[10px] text-stone-500 capitalize">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. System Settings (Wireframe 5 Card 4) */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6 max-w-4xl">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-base font-bold text-stone-900">
              System Settings & Business Rules Configuration
            </h2>
            <p className="text-xs text-stone-500">
              Configure delivery rates, currency exchange rate (USD/RWF), loyalty points formula, and payment gateways.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Standard Delivery Fee (RWF)</label>
              <input
                type="number"
                step="100"
                value={settings.deliveryFeeRWF}
                onChange={(e) => updateSettings({ deliveryFeeRWF: Number(e.target.value) })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono-nums font-semibold"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">Applied to orders below free threshold</span>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Free Delivery Threshold (RWF)</label>
              <input
                type="number"
                step="1000"
                value={settings.freeDeliveryThresholdRWF}
                onChange={(e) => updateSettings({ freeDeliveryThresholdRWF: Number(e.target.value) })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono-nums font-semibold"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">Orders above this amount receive free delivery</span>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Exchange Rate (RWF per USD)</label>
              <input
                type="number"
                value={settings.exchangeRateRWFPerUSD}
                onChange={(e) => updateSettings({ exchangeRateRWFPerUSD: Number(e.target.value) })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono-nums font-semibold"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">Used for real-time USD/RWF price conversion</span>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Loyalty Points Rate (per 1,000 RWF)</label>
              <input
                type="number"
                value={settings.loyaltyPointsPer1000RWF}
                onChange={(e) => updateSettings({ loyaltyPointsPer1000RWF: Number(e.target.value) })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono-nums font-semibold"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">Customer reward point earning formula</span>
            </div>
          </div>

          {/* Payment Gateways Toggles */}
          <div className="pt-4 border-t border-stone-100 space-y-3 text-xs">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Active Payment Gateways
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={settings.acceptMobileMoney}
                  onChange={(e) => updateSettings({ acceptMobileMoney: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="font-bold text-stone-900">MTN Mobile Money & Airtel Money</div>
                  <div className="text-[11px] text-stone-500">Rwanda national mobile payment gateway</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={settings.acceptOnlineCards}
                  onChange={(e) => updateSettings({ acceptOnlineCards: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="font-bold text-stone-900">Online Credit / Debit Cards (Visa, Mastercard)</div>
                  <div className="text-[11px] text-stone-500">Direct online payment processing</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={settings.acceptCashOnDelivery}
                  onChange={(e) => updateSettings({ acceptCashOnDelivery: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="font-bold text-stone-900">Cash on Delivery (COD)</div>
                  <div className="text-[11px] text-stone-500">Riders collect cash upon physical handover</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Add New Dish Modal */}
      {isAddDishOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900">Add New Dish to Menu</h3>
              <button
                type="button"
                onClick={() => setIsAddDishOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-stone-700 font-medium mb-1">Dish Name (English)</label>
                  <input
                    type="text"
                    required
                    value={newDish.nameEn}
                    onChange={(e) => setNewDish({ ...newDish, nameEn: e.target.value })}
                    placeholder="e.g. Spiced Beef Brochettes"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Nom (Français)</label>
                  <input
                    type="text"
                    value={newDish.nameFr}
                    onChange={(e) => setNewDish({ ...newDish, nameFr: e.target.value })}
                    placeholder="Ex: Brochettes Épicées"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Izina (Kinyarwanda)</label>
                  <input
                    type="text"
                    value={newDish.nameRw}
                    onChange={(e) => setNewDish({ ...newDish, nameRw: e.target.value })}
                    placeholder="Urug: Inyama zosheje"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Price (RWF)</label>
                  <input
                    type="number"
                    required
                    value={newDish.basePriceRWF}
                    onChange={(e) => setNewDish({ ...newDish, basePriceRWF: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono-nums"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    value={newDish.prepTime}
                    onChange={(e) => setNewDish({ ...newDish, prepTime: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono-nums"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={newDish.emoji}
                    onChange={(e) => setNewDish({ ...newDish, emoji: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Category</label>
                <select
                  value={newDish.categoryId}
                  onChange={(e) => setNewDish({ ...newDish, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddDishOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-stone-900 font-bold hover:bg-stone-800"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900">Add Staff or Rider</h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Eric Habimana"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="eric@ikazekitchen.rw"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+250 788 111 222"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono-nums"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">System Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="staff">Kitchen Staff</option>
                  <option value="delivery">Delivery Rider</option>
                  <option value="manager">Restaurant Manager</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-stone-900 font-bold hover:bg-stone-800"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
