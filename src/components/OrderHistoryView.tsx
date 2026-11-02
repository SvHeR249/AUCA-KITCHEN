import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatCurrency, getStatusLabel } from '../utils/orderRules';
import { Clock, ArrowRight, RotateCcw, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';

interface OrderHistoryViewProps {
  onSelectOrder: (orderId: string) => void;
  onBackToMenu: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  onSelectOrder,
  onBackToMenu,
}) => {
  const { orders, addToCart, currency, settings, language, t } = useRestaurant();

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      addToCart({
        ...item,
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      });
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            {t('orderHistory')}
          </h1>
          <p className="text-xs text-stone-500">
            Review past meals, reorder with 1 click, or track pending deliveries.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToMenu}
          className="text-xs font-semibold text-amber-600 hover:text-amber-700"
        >
          {t('menu')} →
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs hover:border-stone-300 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono-nums font-bold text-base text-stone-900">
                  Order {order.orderNumber}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                    order.status === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : order.status === 'cancelled'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <span className="text-xs text-stone-400 font-mono-nums flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="py-2 flex justify-between">
                  <span className="text-stone-800">
                    {item.quantity}x {item.name[language] || item.name.en}
                  </span>
                  <span className="font-mono-nums font-medium text-stone-600">
                    {formatCurrency(item.totalItemPriceRWF, currency, settings.exchangeRateRWFPerUSD)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-stone-400">Total: </span>
                <span className="font-mono-nums font-bold text-stone-900">
                  {formatCurrency(order.totalAmountRWF, currency, settings.exchangeRateRWFPerUSD)}
                </span>
                <span className="text-stone-400 ml-2">
                  ({order.paymentMethod === 'momo' ? 'MTN MoMo' : order.paymentMethod === 'online_card' ? 'Card' : 'Cash'})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReorder(order)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Reorder</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectOrder(order.id)}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <span>Track Status</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
