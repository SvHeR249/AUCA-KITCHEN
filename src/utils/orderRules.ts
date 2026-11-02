import { Currency, CustomerInfo, LoyaltyTier, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from '../types';

/**
 * Calculates the total sum for order items.
 */
export function calculateOrderSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.totalItemPriceRWF, 0);
}

/**
 * Calculates item price with customizations
 */
export function calculateItemTotal(
  basePriceRWF: number,
  quantity: number,
  sizeDeltaRWF = 0,
  addons: { priceRWF: number }[] = [],
  sidePriceRWF = 0
): { unitPriceRWF: number; totalItemPriceRWF: number } {
  const addonsTotal = addons.reduce((sum, a) => sum + a.priceRWF, 0);
  const unitPriceRWF = Math.max(0, basePriceRWF + sizeDeltaRWF + addonsTotal + sidePriceRWF);
  const totalItemPriceRWF = unitPriceRWF * Math.max(1, quantity);
  return { unitPriceRWF, totalItemPriceRWF };
}

/**
 * Calculates loyalty points earned from a subtotal.
 * Default: 10 points per 1,000 RWF spent.
 */
export function calculateLoyaltyPointsEarned(subtotalRWF: number, ratePer1000 = 10): number {
  if (subtotalRWF <= 0) return 0;
  return Math.floor((subtotalRWF / 1000) * ratePer1000);
}

/**
 * Calculates monetary discount from redeemed loyalty points.
 * e.g., 100 points = 500 RWF discount.
 * Ensures discount does not exceed the subtotal.
 */
export function calculateLoyaltyDiscount(
  pointsToRedeem: number,
  rwfDiscountPerPoint = 5,
  maxAllowedRWF = Infinity
): number {
  if (pointsToRedeem <= 0) return 0;
  const rawDiscount = pointsToRedeem * rwfDiscountPerPoint;
  return Math.min(rawDiscount, Math.max(0, maxAllowedRWF));
}

/**
 * Determines customer loyalty tier based on cumulative points.
 */
export function getLoyaltyTier(points: number): LoyaltyTier {
  if (points >= 2500) return 'Platinum';
  if (points >= 1000) return 'Gold';
  if (points >= 400) return 'Silver';
  return 'Bronze';
}

/**
 * Business Rule (PDF Page 9):
 * "Orders cannot be canceled once they are marked 'Preparing'."
 * Returns true if customer can cancel this order.
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return status === 'new';
}

/**
 * Business Rule (PDF Page 9):
 * "Payment must be confirmed before order preparation begins for online payments."
 * For cash on delivery, kitchen can prepare before payment.
 * For online card or Mobile Money (MoMo), payment must be 'paid'.
 */
export function canBeginPreparation(
  paymentMethod: PaymentMethod,
  paymentStatus: PaymentStatus
): { canPrepare: boolean; reason?: string } {
  if (paymentMethod === 'cash') {
    return { canPrepare: true };
  }

  if (paymentStatus === 'paid') {
    return { canPrepare: true };
  }

  return {
    canPrepare: false,
    reason: 'Payment must be confirmed before order preparation begins for online or mobile money payments.'
  };
}

/**
 * Validates checkout readiness before placing order.
 * PDF Page 9 & 13: Customers must have account/details before placing order and cart must not be empty.
 */
export function validateCheckout(
  customer: Partial<CustomerInfo>,
  items: OrderItem[]
): { isValid: boolean; error?: string } {
  if (!items || items.length === 0) {
    return { isValid: false, error: 'Your cart is empty. Please select menu items.' };
  }

  if (!customer.name || customer.name.trim().length < 2) {
    return { isValid: false, error: 'Please enter a valid customer name.' };
  }

  if (!customer.phone || customer.phone.trim().length < 6) {
    return { isValid: false, error: 'Please enter a valid contact phone number.' };
  }

  if (!customer.address || customer.address.trim().length < 3) {
    return { isValid: false, error: 'Please provide a delivery address.' };
  }

  return { isValid: true };
}

/**
 * Formats monetary amounts in RWF or USD.
 */
export function formatCurrency(
  amountRWF: number,
  currency: Currency = 'RWF',
  exchangeRateRWFPerUSD = 1460
): string {
  if (currency === 'USD') {
    const usd = amountRWF / exchangeRateRWFPerUSD;
    return `$${usd.toFixed(2)}`;
  }
  return `${Math.round(amountRWF).toLocaleString()} RWF`;
}

/**
 * Human-readable next action status for kitchen/delivery workflow
 */
export function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'new':
      return 'New Order';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready for Pickup';
    case 'assigned':
      return 'Driver Assigned';
    case 'picked_up':
      return 'Picked Up';
    case 'on_the_way':
      return 'On the Way';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}
