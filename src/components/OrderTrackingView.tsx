import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatCurrency, getStatusLabel, canCancelOrder } from '../utils/orderRules';
import {
  Clock,
  MapPin,
  Bike,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  ArrowLeft,
  FileText,
  ShieldAlert,
  Coins,
} from 'lucide-react';

interface OrderTrackingViewProps {
  onBackToMenu: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ onBackToMenu }) => {
  const {
    orders,
    activeTrackOrderId,
    setActiveTrackOrderId,
    cancelOrder,
    currency,
    settings,
    language,
    t,
  } = useRestaurant();

  const currentOrder =
    orders.find((o) => o.id === activeTrackOrderId) || orders[0];

  if (!currentOrder) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-800">No Orders in System</h2>
        <p className="text-xs text-stone-500">Place an order from the menu to track it in real time.</p>
        <button
          type="button"
          onClick={onBackToMenu}
          className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold"
        >
          {t('backToMenu')}
        </button>
      </div>
    );
  }

  const isCancellable = canCancelOrder(currentOrder.status);

  // Stepper stages
  const stages = [
    { key: 'new', label: 'Order Placed', desc: 'Received & verified' },
    { key: 'preparing', label: 'Kitchen Preparing', desc: 'Cooking fresh' },
    { key: 'ready', label: 'Packaged & Ready', desc: 'Awaiting rider' },
    { key: 'on_the_way', label: 'Out for Delivery', desc: 'Rider en route' },
    { key: 'delivered', label: 'Delivered', desc: 'Enjoy your meal!' },
  ];

  const getStageIndex = (st: string) => {
    switch (st) {
      case 'new':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
      case 'assigned':
        return 2;
      case 'picked_up':
      case 'on_the_way':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(currentOrder.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header and Order Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <button
            type="button"
            onClick={onBackToMenu}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToMenu')}</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Order {currentOrder.orderNumber}
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                currentOrder.status === 'delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentOrder.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {getStatusLabel(currentOrder.status)}
            </span>
          </div>
        </div>

        {/* Quick order switcher for multi-order tracking */}
        {orders.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Switch Order:</span>
            <select
              value={currentOrder.id}
              onChange={(e) => setActiveTrackOrderId(e.target.value)}
              className="bg-white border border-stone-200 p-1.5 rounded-lg font-mono-nums font-bold text-stone-800 focus:outline-none"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} ({getStatusLabel(o.status)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Progress Timeline Stepper */}
      {currentOrder.status === 'cancelled' ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <div className="font-bold text-sm">Order Cancelled</div>
            <div className="text-xs text-red-700">
              This order was cancelled while in the new queue before kitchen preparation commenced.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>
                Estimated Delivery Arrival: <strong>~{currentOrder.estimatedDeliveryMinutes} mins</strong>
              </span>
            </div>
            <span className="font-mono-nums font-medium">
              Placed at {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {stages.map((stage, idx) => {
              const isPast = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono-nums transition-colors ${
                        isCurrent
                          ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                          : isPast
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      {isPast && !isCurrent ? '✓' : idx + 1}
                    </div>
                    {idx < stages.length - 1 && (
                      <div
                        className={`hidden sm:block flex-1 h-1 rounded-full ${
                          idx < currentStageIndex ? 'bg-stone-900' : 'bg-stone-100'
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-amber-600' : isPast ? 'text-stone-900' : 'text-stone-400'
                      }`}
                    >
                      {stage.label}
                    </div>
                    <div className="text-[10px] text-stone-500">{stage.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Driver & Delivery Information Banner */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-stone-900">
                  Assigned Rider: {currentOrder.assignedDriverName || 'Alex Tuyiseng'}
                </div>
                <div className="text-[11px] text-stone-500 font-mono-nums">
                  Contact: {currentOrder.assignedDriverPhone || '+250 782 555 789'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${currentOrder.assignedDriverPhone || '+250782555789'}`}
                className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 font-semibold hover:bg-stone-100 flex items-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Call Rider</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Receipt & Event Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receipt Ticket */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              Receipt & Items Summary
            </h3>
            <span className="text-xs text-stone-400 font-mono-nums">
              Ref: {currentOrder.paymentReference || 'COD-REG'}
            </span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {currentOrder.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between">
                <div>
                  <div className="font-semibold text-stone-900">
                    {item.quantity}x {item.name[language] || item.name.en}
                  </div>
                  {item.selectedSize && (
                    <div className="text-[11px] text-stone-500">
                      {item.selectedSize.name[language] || item.selectedSize.name.en}
                    </div>
                  )}
                  {item.selectedSide && (
                    <div className="text-[11px] text-stone-500">
                      Side: {item.selectedSide.name[language] || item.selectedSide.name.en}
                    </div>
                  )}
                </div>
                <div className="font-mono-nums font-semibold text-stone-800">
                  {formatCurrency(item.totalItemPriceRWF, currency, settings.exchangeRateRWFPerUSD)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono-nums font-semibold text-stone-900">
                {formatCurrency(currentOrder.subtotalRWF, currency, settings.exchangeRateRWFPerUSD)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-mono-nums font-semibold text-stone-900">
                {currentOrder.deliveryFeeRWF === 0 ? 'Free' : formatCurrency(currentOrder.deliveryFeeRWF, currency, settings.exchangeRateRWFPerUSD)}
              </span>
            </div>
            {currentOrder.discountRWF > 0 && (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>Loyalty Points Discount:</span>
                <span className="font-mono-nums">
                  -{formatCurrency(currentOrder.discountRWF, currency, settings.exchangeRateRWFPerUSD)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-stone-900">
              <span>Total Paid:</span>
              <span className="font-mono-nums">
                {formatCurrency(currentOrder.totalAmountRWF, currency, settings.exchangeRateRWFPerUSD)}
              </span>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Loyalty Points Earned:</span>
            </span>
            <span className="font-bold font-mono-nums text-amber-800">
              +{currentOrder.pointsEarned} pts
            </span>
          </div>
        </div>

        {/* Live Timeline & Cancellation Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              Live Dispatch Audit Log
            </h3>
            <div className="space-y-3 max-h-56 overflow-y-auto text-xs">
              {currentOrder.statusTimeline.map((ev, i) => (
                <div key={i} className="flex items-start gap-2.5 pb-2 border-b border-stone-100 last:border-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 capitalize">{getStatusLabel(ev.status)}</span>
                      <span className="text-[10px] text-stone-400 font-mono-nums">{ev.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      By: <span className="font-medium text-stone-700">{ev.actor}</span>
                    </div>
                    {ev.note && <div className="text-[11px] text-stone-600 italic mt-0.5">{ev.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Rule Cancellation Card (PDF Page 9) */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-stone-600" />
              <span>Order Cancellation Control</span>
            </h3>

            <p className="text-xs text-stone-500">
              You may cancel your order anytime before the Kitchen Staff clicks <strong>Accept Order</strong> (marks it as <strong>"Preparing"</strong>).
            </p>

            {currentOrder.status !== 'cancelled' && currentOrder.status !== 'delivered' && (
              <div>
                {isCancellable ? (
                  <button
                    type="button"
                    onClick={() => cancelOrder(currentOrder.id)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Cancel Order (Before Kitchen Accepts)
                  </button>
                ) : (
                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-[11px] text-stone-600">
                    🔒 <strong>Cancellation locked:</strong> Kitchen Staff has already accepted and started preparing this order.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
