import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, OrderStatus } from '../types';
import { formatCurrency, getStatusLabel } from '../utils/orderRules';
import {
  ChefHat,
  Volume2,
  VolumeX,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  MapPin,
  X,
  BellRing,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    settings,
    updateSettings,
    triggerChime,
    currency,
    language,
    t,
  } = useRestaurant();

  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);

  // Categorize orders into the 3 columns from Wireframe 3
  const newOrders = orders.filter((o) => o.status === 'new');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const completedOrders = orders.filter((o) =>
    ['ready', 'assigned', 'picked_up', 'on_the_way', 'delivered'].includes(o.status)
  );

  const toggleSound = () => {
    updateSettings({ soundAlertsEnabled: !settings.soundAlertsEnabled });
    if (!settings.soundAlertsEnabled) {
      triggerChime();
    }
  };

  const handleAcceptOrder = (order: Order) => {
    updateOrderStatus(order.id, 'preparing', 'Kitchen accepted order into queue.');
  };

  const handleMarkReady = (order: Order) => {
    updateOrderStatus(order.id, 'ready', 'Kitchen finished preparation. Food packaged for rider.');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Dashboard Top Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">
              {t('kitchenDashboardTitle')}
            </h1>
            <p className="text-xs text-stone-500">
              Real-time kitchen order display system · PDF Wireframe 3 specification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              settings.soundAlertsEnabled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-stone-200 bg-stone-50 text-stone-600'
            }`}
          >
            {settings.soundAlertsEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Audio Alert On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-stone-400" />
                <span>Audio Alert Off</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={triggerChime}
            aria-label="Test chime bell"
            className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            title="Test Kitchen Bell Chime"
          >
            <BellRing className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Wireframe 3: 3 Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column 1: New Orders */}
        <div className="bg-stone-100/80 rounded-2xl p-4 border border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                {t('newOrdersCol')}
              </h2>
            </div>
            <span className="font-mono-nums text-xs px-2 py-0.5 rounded-full bg-white text-stone-800 font-bold border border-stone-200">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {newOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-stone-200 text-stone-400 text-xs">
                {t('noNewOrders')}
              </div>
            ) : (
              newOrders.map((order) => {
                const elapsedMin = Math.max(
                  0,
                  Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
                );
                return (
                  <div
                    key={order.id}
                    className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3 hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono-nums font-extrabold text-base text-stone-900">
                          Order {order.orderNumber}
                        </span>
                        <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <User className="w-3 h-3 text-stone-400" />
                          <span>{order.customer.name}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono-nums font-bold text-stone-900 block">
                          {formatCurrency(order.totalAmountRWF, currency, settings.exchangeRateRWFPerUSD)}
                        </span>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          <span>{elapsedMin}m ago</span>
                        </span>
                      </div>
                    </div>

                    {/* Order summary preview */}
                    <div className="text-xs text-stone-600 space-y-1 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                      {order.items.map((it) => (
                        <div key={it.id} className="flex justify-between">
                          <span className="truncate max-w-[180px]">
                            {it.quantity}x {it.name[language] || it.name.en}
                          </span>
                          {it.selectedSpiciness && (
                            <span className="text-[10px] text-red-600 font-medium">
                              {'🌶️'.repeat(it.selectedSpiciness.level || 1)}
                            </span>
                          )}
                        </div>
                      ))}
                      {order.notes && (
                        <div className="text-[11px] text-amber-800 italic pt-1 border-t border-stone-200">
                          Note: "{order.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="capitalize font-medium">
                        {order.paymentMethod === 'momo'
                          ? 'MTN MoMo'
                          : order.paymentMethod === 'online_card'
                          ? 'Visa / Card'
                          : 'Cash on Delivery'}
                      </span>
                      <span
                        className={`font-semibold ${
                          order.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {order.paymentStatus === 'paid' ? 'Paid Online' : 'Pay on Delivery'}
                      </span>
                    </div>

                    {/* Wireframe 3 Buttons: [ View Order ], [ Accept Order ] */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setInspectOrder(order)}
                        className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('viewOrder')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAcceptOrder(order)}
                        className="w-full py-2 bg-stone-900 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('acceptOrder')}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Preparing Orders */}
        <div className="bg-stone-100/80 rounded-2xl p-4 border border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                {t('preparingCol')}
              </h2>
            </div>
            <span className="font-mono-nums text-xs px-2 py-0.5 rounded-full bg-white text-stone-800 font-bold border border-stone-200">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-stone-200 text-stone-400 text-xs">
                {t('noPreparingOrders')}
              </div>
            ) : (
              preparingOrders.map((order) => {
                const elapsedMin = Math.max(
                  0,
                  Math.floor((Date.now() - new Date(order.updatedAt).getTime()) / 60000)
                );
                return (
                  <div
                    key={order.id}
                    className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono-nums font-extrabold text-base text-stone-900">
                          Order {order.orderNumber}
                        </span>
                        <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <User className="w-3 h-3 text-stone-400" />
                          <span>{order.customer.name}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono-nums font-bold text-stone-900 block">
                          {formatCurrency(order.totalAmountRWF, currency, settings.exchangeRateRWFPerUSD)}
                        </span>
                        <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          <span>Cooking: {elapsedMin}m</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 space-y-1 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                      {order.items.map((it) => (
                        <div key={it.id} className="flex justify-between">
                          <span className="truncate max-w-[200px] font-medium text-stone-800">
                            {it.quantity}x {it.name[language] || it.name.en}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {it.selectedSide?.name[language] || it.selectedSide?.name.en || 'No side'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Wireframe 3 Buttons: [ Mark Ready ], [ Update Status ] */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setInspectOrder(order)}
                        className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('viewOrder')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkReady(order)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('markReady')}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Completed Orders */}
        <div className="bg-stone-100/80 rounded-2xl p-4 border border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                {t('completedCol')}
              </h2>
            </div>
            <span className="font-mono-nums text-xs px-2 py-0.5 rounded-full bg-white text-stone-800 font-bold border border-stone-200">
              {completedOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {completedOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-stone-200 text-stone-400 text-xs">
                {t('noCompletedOrders')}
              </div>
            ) : (
              completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono-nums font-extrabold text-base text-stone-900">
                        Order {order.orderNumber}
                      </span>
                      <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-stone-400" />
                        <span>{order.customer.name}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono-nums font-bold text-stone-900 block">
                        {formatCurrency(order.totalAmountRWF, currency, settings.exchangeRateRWFPerUSD)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold capitalize">
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-lg">
                    <span>Assigned to Rider: </span>
                    <span className="font-semibold text-stone-800">
                      {order.assignedDriverName || 'Alex Tuyiseng'}
                    </span>
                  </div>

                  {/* Wireframe 3 Action: [ View Details ] */}
                  <button
                    type="button"
                    onClick={() => setInspectOrder(order)}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('viewOrder')}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {inspectOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="font-mono-nums font-bold text-lg text-stone-900">
                  Order {inspectOrder.orderNumber}
                </span>
                <span className="text-xs text-stone-500 ml-2">
                  Status: {getStatusLabel(inspectOrder.status)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                aria-label="Close modal"
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span className="font-semibold text-stone-900">{inspectOrder.customer.name}</span>
                <span className="text-stone-400">·</span>
                <span className="text-stone-600 font-mono-nums">{inspectOrder.customer.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{inspectOrder.customer.address}</span>
              </div>
            </div>

            {/* Itemized List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Kitchen Prep Ticket
              </h4>
              <div className="divide-y divide-stone-100">
                {inspectOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-stone-900">
                      <span>{item.quantity}x {item.name[language] || item.name.en}</span>
                      <span className="font-mono-nums">
                        {formatCurrency(item.totalItemPriceRWF, currency, settings.exchangeRateRWFPerUSD)}
                      </span>
                    </div>
                    {item.selectedSize && (
                      <div className="text-[11px] text-stone-500">
                        Size: {item.selectedSize.name[language] || item.selectedSize.name.en}
                      </div>
                    )}
                    {item.selectedSpiciness && (
                      <div className="text-[11px] text-red-600 font-medium">
                        Spice: {item.selectedSpiciness.name[language] || item.selectedSpiciness.name.en} (Level {item.selectedSpiciness.level})
                      </div>
                    )}
                    {item.selectedSide && (
                      <div className="text-[11px] text-stone-600">
                        Side: {item.selectedSide.name[language] || item.selectedSide.name.en}
                      </div>
                    )}
                    {item.selectedAddons.length > 0 && (
                      <div className="text-[11px] text-stone-600">
                        Addons: {item.selectedAddons.map((a) => a.name[language] || a.name.en).join(', ')}
                      </div>
                    )}
                    {item.itemNotes && (
                      <div className="text-[11px] bg-amber-50 text-amber-900 p-1.5 rounded border border-amber-200 italic">
                        Special Note: "{item.itemNotes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200"
              >
                Close
              </button>
              {inspectOrder.status === 'new' && (
                <button
                  type="button"
                  onClick={() => {
                    handleAcceptOrder(inspectOrder);
                    setInspectOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-amber-600"
                >
                  Accept Order
                </button>
              )}
              {inspectOrder.status === 'preparing' && (
                <button
                  type="button"
                  onClick={() => {
                    handleMarkReady(inspectOrder);
                    setInspectOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Mark Food Ready
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
