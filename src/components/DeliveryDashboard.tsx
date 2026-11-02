import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, OrderStatus } from '../types';
import { formatCurrency, getStatusLabel } from '../utils/orderRules';
import {
  Bike,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Navigation,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  X,
  Compass,
} from 'lucide-react';

export const DeliveryDashboard: React.FC = () => {
  const { orders, updateOrderStatus, currency, settings, language, t } = useRestaurant();

  // All active or recent orders ready for delivery or delivered
  const deliveryOrders = orders.filter((o) =>
    ['ready', 'assigned', 'picked_up', 'on_the_way', 'delivered'].includes(o.status)
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => {
    return deliveryOrders[0]?.id || '';
  });

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || deliveryOrders[0];

  const [pendingStatus, setPendingStatus] = useState<OrderStatus>(() => {
    return selectedOrder?.status || 'assigned';
  });

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [simulatedCallActive, setSimulatedCallActive] = useState(false);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setPendingStatus(order.status);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;
    updateOrderStatus(
      selectedOrder.id,
      pendingStatus,
      `Delivery driver updated status to ${getStatusLabel(pendingStatus)}`
    );
  };

  const startPhoneCall = () => {
    setSimulatedCallActive(true);
    setTimeout(() => {
      setSimulatedCallActive(false);
      setContactModalOpen(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">
              {t('deliveryDashboardTitle')}
            </h1>
            <p className="text-xs text-stone-500">
              Active Rider: Alex Tuyiseng · TVS 125 Motorbike (Kigali Fleet #4)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-semibold text-blue-900">
          <Compass className="w-4 h-4 text-blue-600" />
          <span>Dispatch Zone: Gasabo & Nyarugenge</span>
        </div>
      </div>

      {deliveryOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-xs">
          <Bike className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">{t('noAssignedDeliveries')}</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            When kitchen staff marks orders ready, they will automatically appear here for pickup.
          </p>
        </div>
      ) : (
        /* Wireframe 4: 3-Card Responsive Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Card 1: Assigned Deliveries (Wireframe 4) */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                {t('assignedDeliveries')}
              </h2>
              <span className="font-mono-nums text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {deliveryOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {deliveryOrders.map((order) => {
                const isSelected = order.id === selectedOrder?.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono-nums font-extrabold text-sm text-stone-900">
                        Order {order.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-stone-100 text-stone-700">
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="text-xs text-stone-700 space-y-0.5">
                      <div className="font-medium">Customer: {order.customer.name}</div>
                      <div className="text-stone-500 text-[11px] flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Address: {order.customer.address}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] border-t border-stone-100 text-stone-500">
                      <span className="font-mono-nums font-semibold text-stone-800">
                        {formatCurrency(order.totalAmountRWF, currency, settings.exchangeRateRWFPerUSD)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOrder(order);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                      >
                        <span>[ View Details ]</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Delivery Status (Wireframe 4) */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                  {t('deliveryStatus')}
                </h2>
                <div className="font-mono-nums text-xs text-blue-700 font-bold mt-0.5">
                  Order {selectedOrder?.orderNumber}
                </div>
              </div>
              <span className="text-xs text-stone-500 font-mono-nums">
                ETA: {selectedOrder?.estimatedDeliveryMinutes}m
              </span>
            </div>

            {/* Radio / Step Options from Wireframe 4 */}
            <div className="space-y-3">
              {[
                { status: 'assigned' as OrderStatus, label: 'Assigned (Accepted by Kitchen)' },
                { status: 'picked_up' as OrderStatus, label: 'Picked Up (Package Received)' },
                { status: 'on_the_way' as OrderStatus, label: 'On the Way (Out for Delivery)' },
                { status: 'delivered' as OrderStatus, label: 'Delivered (Handed to Customer)' },
              ].map((step) => {
                const isCurrent = (selectedOrder?.status || '') === step.status;
                const isSelectedForUpdate = pendingStatus === step.status;
                return (
                  <label
                    key={step.status}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer text-xs transition-all ${
                      isSelectedForUpdate
                        ? 'border-blue-500 bg-blue-50/60 font-semibold text-blue-950 ring-1 ring-blue-500'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery-stage"
                      value={step.status}
                      checked={pendingStatus === step.status}
                      onChange={() => setPendingStatus(step.status)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span>{step.label}</span>
                      {isCurrent && (
                        <span className="ml-2 text-[10px] bg-stone-900 text-white px-2 py-0.2 rounded font-bold">
                          Current
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Wireframe 4 Action Button: [ UPDATE STATUS ] */}
            <button
              type="button"
              onClick={handleUpdateStatus}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>[ {t('updateStatus')} ]</span>
            </button>

            {/* Visual Route Simulator */}
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kigali GPS Route</span>
                </span>
                <span className="text-emerald-700 font-mono-nums">Live Tracking</span>
              </div>
              <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{
                    width:
                      pendingStatus === 'delivered'
                        ? '100%'
                        : pendingStatus === 'on_the_way'
                        ? '75%'
                        : pendingStatus === 'picked_up'
                        ? '40%'
                        : '15%',
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>AUCA Kitchen (Campus)</span>
                <span>Destination ({selectedOrder?.customer.district || 'Gasabo'})</span>
              </div>
            </div>
          </div>

          {/* Card 3: Delivery Information (Wireframe 4) */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide border-b border-stone-100 pb-3">
              {t('deliveryInfo')}
            </h2>

            {selectedOrder ? (
              <div className="space-y-4 text-xs">
                {/* Customer Address */}
                <div className="space-y-1">
                  <span className="text-stone-400 font-semibold uppercase text-[10px] tracking-wider block">
                    {t('customerAddress')}
                  </span>
                  <div className="text-stone-900 font-medium flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{selectedOrder.customer.address}</span>
                  </div>
                </div>

                {/* Phone / Contact */}
                <div className="space-y-1">
                  <span className="text-stone-400 font-semibold uppercase text-[10px] tracking-wider block">
                    {t('phoneContact')}
                  </span>
                  <div className="text-stone-900 font-mono-nums font-semibold flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>{selectedOrder.customer.phone}</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-1">
                  <span className="text-stone-400 font-semibold uppercase text-[10px] tracking-wider block">
                    Order Summary ({selectedOrder.items.length} items)
                  </span>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1.5">
                    {selectedOrder.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-stone-800">
                        <span>{it.quantity}x {it.name[language] || it.name.en}</span>
                        <span className="font-mono-nums text-stone-600">
                          {formatCurrency(it.totalItemPriceRWF, currency, settings.exchangeRateRWFPerUSD)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                      <span>Total to Collect:</span>
                      <span className="font-mono-nums">
                        {formatCurrency(selectedOrder.totalAmountRWF, currency, settings.exchangeRateRWFPerUSD)}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 pt-0.5">
                      Payment Method: <span className="font-semibold capitalize text-stone-800">{selectedOrder.paymentMethod.replace('_', ' ')}</span>{' '}
                      ({selectedOrder.paymentStatus === 'paid' ? 'Paid Online' : 'Collect Cash'})
                    </div>
                  </div>
                </div>

                {/* Estimated Delivery Time */}
                <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{t('estimatedArrival')}</span>
                  </span>
                  <span className="font-bold font-mono-nums">
                    ~{selectedOrder.estimatedDeliveryMinutes} mins
                  </span>
                </div>

                {/* Wireframe 4 Action Button: [ Contact Customer ] */}
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>[ {t('contactCustomer')} ]</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-stone-400">Select an order on the left to see information.</p>
            )}
          </div>
        </div>
      )}

      {/* Simulated Contact Customer Modal */}
      {contactModalOpen && selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900">Rider Contact Console</h3>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                aria-label="Close modal"
                className="p-1 text-stone-400 hover:text-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-2">
              <div>
                Connecting with <strong className="text-stone-900">{selectedOrder.customer.name}</strong> for delivery of <strong className="text-stone-900">Order {selectedOrder.orderNumber}</strong>.
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 font-mono-nums text-sm font-bold text-center text-stone-900">
                {selectedOrder.customer.phone}
              </div>
            </div>

            {simulatedCallActive ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 space-y-2">
                <div className="w-3 h-3 rounded-full bg-emerald-600 mx-auto animate-ping" />
                <div className="font-bold">Calling {selectedOrder.customer.name}...</div>
                <div className="text-[10px] text-emerald-600">Simulating VoIP voice connection</div>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={startPhoneCall}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Customer Directly</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Simulating SMS dispatch: "Hello ${selectedOrder.customer.name}, your Ikaze Kitchen order is arriving in 5 mins!"`);
                    setContactModalOpen(false);
                  }}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Arrival SMS</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
