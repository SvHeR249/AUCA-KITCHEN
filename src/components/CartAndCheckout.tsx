import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { CustomerInfo, PaymentMethod } from '../types';
import { calculateLoyaltyDiscount, formatCurrency, validateCheckout } from '../utils/orderRules';
import { KIGALI_SECTORS } from '../data/mockData';
import {
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Smartphone,
  Banknote,
  Coins,
  MapPin,
  FileText,
  ShoppingBag,
  AlertCircle,
  ArrowLeft,
  LogIn,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

interface CartAndCheckoutProps {
  onBackToMenu: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CartAndCheckout: React.FC<CartAndCheckoutProps> = ({
  onBackToMenu,
  onOrderSuccess,
}) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotalRWF,
    customerProfile,
    isAuthenticated,
    setIsAuthModalOpen,
    settings,
    currency,
    language,
    placeOrder,
    t,
  } = useRestaurant();

  const [customer, setCustomer] = useState<CustomerInfo>({
    id: customerProfile.id,
    name: customerProfile.name,
    email: customerProfile.email,
    phone: customerProfile.phone,
    address: customerProfile.address,
    city: 'Kigali',
    district: 'Gasabo',
  });

  // Sync customer fields when user signs in or signs up
  useEffect(() => {
    setCustomer({
      id: customerProfile.id,
      name: customerProfile.name,
      email: customerProfile.email,
      phone: customerProfile.phone,
      address: customerProfile.address,
      city: 'Kigali',
      district: 'Gasabo',
    });
  }, [customerProfile]);

  const [selectedSector, setSelectedSector] = useState(KIGALI_SECTORS[0]);
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simulated Mobile Money modal prompt
  const [momoPromptOpen, setMomoPromptOpen] = useState(false);

  const deliveryFee =
    cartSubtotalRWF >= settings.freeDeliveryThresholdRWF ? 0 : settings.deliveryFeeRWF;
  const loyaltyDiscount = calculateLoyaltyDiscount(
    pointsToRedeem,
    settings.rwfDiscountPerPoint,
    cartSubtotalRWF
  );
  const totalAmountRWF = Math.max(0, cartSubtotalRWF + deliveryFee - loyaltyDiscount);

  const maxRedeemablePoints = Math.min(
    customerProfile.loyaltyPoints,
    Math.floor(cartSubtotalRWF / settings.rwfDiscountPerPoint)
  );

  const handlePlaceOrder = async () => {
    setErrorMessage(null);

    // Business Rule (PDF Page 9 & User Request):
    // Customer must sign in or sign up before confirming the order
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    const fullCustomer: CustomerInfo = {
      ...customer,
      address: customer.address.includes(selectedSector)
        ? customer.address
        : `${customer.address} (${selectedSector})`,
      city: 'Kigali',
    };

    const validation = validateCheckout(fullCustomer, cart);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Please fill in all required delivery details.');
      return;
    }

    setIsSubmitting(true);

    if (paymentMethod === 'momo') {
      setMomoPromptOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 1600));
      setMomoPromptOpen(false);
    } else if (paymentMethod === 'online_card') {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    const result = await placeOrder(fullCustomer, paymentMethod, pointsToRedeem, orderNotes);
    setIsSubmitting(false);

    if (result.success && result.orderId) {
      onOrderSuccess(result.orderId);
    } else {
      setErrorMessage(result.error || 'Could not complete order. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4 border border-amber-200">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">{t('emptyCartTitle')}</h2>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">{t('emptyCartDesc')}</p>
        <button
          type="button"
          onClick={onBackToMenu}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToMenu')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <button
            type="button"
            onClick={onBackToMenu}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToMenu')}</span>
          </button>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            {t('yourCart')} & {t('deliveryDetails')}
          </h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-medium"
        >
          Clear Cart
        </button>
      </div>

      {/* Authentication Status Callout Banner */}
      {!isAuthenticated ? (
        <div className="p-5 rounded-2xl bg-[#0B2545] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Account Required to Confirm Order</span>
            </div>
            <p className="text-xs text-stone-200">
              Sign in to your AUCA Kitchen account or sign up in seconds to confirm your order, earn loyalty points, and track or cancel your order in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 shrink-0 shadow-xs"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Sign Up Now</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Signed in as <strong>{customerProfile.name}</strong> ({customerProfile.email}) · Ready to confirm order
            </span>
          </div>
          <span className="font-mono-nums font-bold text-emerald-700">
            {customerProfile.loyaltyPoints} pts available
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Wireframe 2: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Selected Items + Address + Order Notes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected Items */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Selected Items ({cart.length})
            </h2>

            <div className="divide-y divide-stone-100">
              {cart.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-sm text-stone-900">
                      {item.name[language] || item.name.en}
                    </div>

                    {/* Customization Details */}
                    <div className="text-[11px] text-stone-500 space-y-0.5">
                      {item.selectedSize && <div>Size: {item.selectedSize.name[language] || item.selectedSize.name.en}</div>}
                      {item.selectedSpiciness && <div>Spice: {item.selectedSpiciness.name[language] || item.selectedSpiciness.name.en}</div>}
                      {item.selectedSide && <div>Side: {item.selectedSide.name[language] || item.selectedSide.name.en}</div>}
                      {item.selectedAddons.length > 0 && (
                        <div>
                          Addons: {item.selectedAddons.map((a) => a.name[language] || a.name.en).join(', ')}
                        </div>
                      )}
                      {item.itemNotes && <div className="italic text-stone-600">Note: "{item.itemNotes}"</div>}
                    </div>

                    <div className="text-xs font-mono-nums font-semibold text-stone-700 pt-1">
                      {formatCurrency(item.unitPriceRWF, currency, settings.exchangeRateRWFPerUSD)} each
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-bold font-mono-nums text-stone-900">
                      {formatCurrency(item.totalItemPriceRWF, currency, settings.exchangeRateRWFPerUSD)}
                    </span>

                    <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-1.5 hover:bg-stone-200 text-stone-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono-nums font-bold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-1.5 hover:bg-stone-200 text-stone-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                      className="text-[11px] text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address Form */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{t('deliveryDetails')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">{t('fullName')}</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="e.g. Sirelkhatim Abdallah"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">{t('phoneNumber')}</label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="+250 788 000 000"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-medium mb-1">{t('kigaliSector')}</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 font-medium cursor-pointer"
                >
                  {KIGALI_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-medium mb-1">{t('deliveryAddress')}</label>
                <input
                  type="text"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="Street / House Number / Campus Building"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 font-medium"
                />
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-stone-700 text-xs font-medium mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('deliveryNotes')}</span>
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder={t('deliveryNotesPlaceholder')}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-800 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary + Payment Options + Place Order */}
        <div className="lg:col-span-5 space-y-6">
          {/* Loyalty Points Redemption Box */}
          <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/70 rounded-2xl border border-amber-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>{t('redeemLoyaltyTitle')}</span>
              </span>
              <span className="font-mono-nums font-semibold text-amber-800">
                {customerProfile.loyaltyPoints} pts available
              </span>
            </div>

            {customerProfile.loyaltyPoints >= settings.minPointsToRedeem ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600 text-[11px]">
                  <span>Points to redeem:</span>
                  <span className="font-mono-nums font-bold text-stone-900">{pointsToRedeem} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxRedeemablePoints}
                  step="50"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-600"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">100 pts = 500 RWF</span>
                  <span className="font-mono-nums font-bold text-amber-700">
                    -{formatCurrency(loyaltyDiscount, currency, settings.exchangeRateRWFPerUSD)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-stone-500">
                You need at least {settings.minPointsToRedeem} points to unlock checkout discounts. Earn
                10 points for every 1,000 RWF!
              </p>
            )}
          </div>

          {/* Checkout Breakdown (Wireframe 2) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                {t('orderSummary')}
              </h2>
              <span className="text-[11px] text-stone-500 font-mono-nums">
                1 USD = {settings.exchangeRateRWFPerUSD.toLocaleString()} RWF
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-mono-nums font-semibold text-stone-900">
                  {formatCurrency(cartSubtotalRWF, currency, settings.exchangeRateRWFPerUSD)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>{t('deliveryFee')}</span>
                <span className="font-mono-nums font-semibold text-stone-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">{t('freeDelivery')}</span>
                  ) : (
                    formatCurrency(deliveryFee, currency, settings.exchangeRateRWFPerUSD)
                  )}
                </span>
              </div>

              {loyaltyDiscount > 0 && (
                <div className="flex items-center justify-between text-amber-700 font-medium">
                  <span>{t('loyaltyDiscount')}</span>
                  <span className="font-mono-nums font-bold">
                    -{formatCurrency(loyaltyDiscount, currency, settings.exchangeRateRWFPerUSD)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-base font-bold text-stone-900">
                <span>{t('totalAmount')}</span>
                <span className="font-mono-nums text-lg text-stone-900">
                  {formatCurrency(totalAmountRWF, currency, settings.exchangeRateRWFPerUSD)}
                </span>
              </div>
            </div>

            {/* Payment Options (Wireframe 2) */}
            <div className="space-y-2.5 pt-2">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                {t('paymentMethod')}
              </label>

              <div className="space-y-2">
                {/* MTN / Airtel Mobile Money */}
                <label
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-amber-500 bg-amber-50/50 text-stone-900 font-semibold ring-1 ring-amber-500'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment-option"
                      checked={paymentMethod === 'momo'}
                      onChange={() => setPaymentMethod('momo')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-amber-600" />
                      <span>{t('momoPay')}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-800 font-mono-nums">
                    Instant Push
                  </span>
                </label>

                {/* Online Card */}
                <label
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    paymentMethod === 'online_card'
                      ? 'border-amber-500 bg-amber-50/50 text-stone-900 font-semibold ring-1 ring-amber-500'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment-option"
                      checked={paymentMethod === 'online_card'}
                      onChange={() => setPaymentMethod('online_card')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>{t('onlineCard')}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400">Visa / Mastercard</span>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-amber-500 bg-amber-50/50 text-stone-900 font-semibold ring-1 ring-amber-500'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment-option"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>{t('cashOnDelivery')}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400">Pay on Delivery</span>
                </label>
              </div>
            </div>

            {/* Wireframe 2 Action Button: [ PLACE ORDER ] or [ SIGN IN TO CONFIRM ORDER ] */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="w-full py-3.5 bg-[#0B2545] hover:bg-[#134074] disabled:bg-stone-400 text-white rounded-xl text-sm font-bold tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>{t('processingPayment')}</span>
              ) : !isAuthenticated ? (
                <>
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Sign In / Sign Up to Confirm Order</span>
                </>
              ) : (
                <>
                  <span>Confirm & {t('placeOrder')}</span>
                  <span>·</span>
                  <span className="font-mono-nums text-amber-300">
                    {formatCurrency(totalAmountRWF, currency, settings.exchangeRateRWFPerUSD)}
                  </span>
                </>
              )}
            </button>

            <div className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1">
              <span>{t('pointsEarnNotice')}</span>
              <span className="font-bold font-mono-nums text-amber-600">
                +{Math.floor((cartSubtotalRWF / 1000) * settings.loyaltyPointsPer1000RWF)}
              </span>
              <span>{t('pointsOnThisOrder')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Mobile Money Prompt Modal */}
      {momoPromptOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-amber-400 text-stone-950 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-stone-950 text-amber-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              MTN
            </div>
            <div>
              <h3 className="font-extrabold text-lg">MoMo Pay Push Prompt</h3>
              <p className="text-xs text-stone-900/80 mt-1">
                Authorizing payment of{' '}
                <span className="font-mono-nums font-bold">
                  {formatCurrency(totalAmountRWF, 'RWF')}
                </span>{' '}
                to <span className="font-semibold">AUCA KITCHEN</span>.
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-xs font-mono">
              <div>Phone: {customer.phone}</div>
              <div className="text-[10px] text-stone-600 mt-1">Simulating user PIN verification...</div>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-950 animate-ping" />
              <span>Confirming transaction with gateway...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
