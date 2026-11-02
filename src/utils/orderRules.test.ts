import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderSubtotal,
  calculateItemTotal,
  calculateLoyaltyPointsEarned,
  calculateLoyaltyDiscount,
  getLoyaltyTier,
  canCancelOrder,
  canBeginPreparation,
  validateCheckout,
  formatCurrency,
} from './orderRules';
import { OrderItem } from '../types';

test('calculateItemTotal computes base price, addons, size, and quantities correctly', () => {
  const result = calculateItemTotal(
    4000, // base 4,000 RWF
    2,    // quantity 2
    1000, // size delta +1,000
    [{ priceRWF: 500 }, { priceRWF: 500 }], // addons +1,000
    500   // side +500
  );
  // unit price = 4000 + 1000 + 1000 + 500 = 6,500
  assert.equal(result.unitPriceRWF, 6500);
  // total = 6500 * 2 = 13,000
  assert.equal(result.totalItemPriceRWF, 13000);
});

test('calculateOrderSubtotal sums items accurately', () => {
  const dummyItems: OrderItem[] = [
    {
      id: 'item-1',
      menuItemId: 'm1',
      name: { en: 'Dish 1', fr: 'Plat 1', rw: 'Ifunguro 1', sw: 'Chakula 1' },
      basePriceRWF: 5000,
      quantity: 1,
      selectedAddons: [],
      unitPriceRWF: 5000,
      totalItemPriceRWF: 5000,
    },
    {
      id: 'item-2',
      menuItemId: 'm2',
      name: { en: 'Dish 2', fr: 'Plat 2', rw: 'Ifunguro 2', sw: 'Chakula 2' },
      basePriceRWF: 2500,
      quantity: 2,
      selectedAddons: [],
      unitPriceRWF: 2500,
      totalItemPriceRWF: 5000,
    },
  ];
  assert.equal(calculateOrderSubtotal(dummyItems), 10000);
});

test('calculateLoyaltyPointsEarned awards 10 points per 1,000 RWF', () => {
  assert.equal(calculateLoyaltyPointsEarned(15000), 150);
  assert.equal(calculateLoyaltyPointsEarned(950), 9);
  assert.equal(calculateLoyaltyPointsEarned(0), 0);
});

test('calculateLoyaltyDiscount calculates monetary value capped at subtotal', () => {
  assert.equal(calculateLoyaltyDiscount(100, 5, 2000), 500);
  // capped at maxAllowedRWF
  assert.equal(calculateLoyaltyDiscount(500, 5, 1000), 1000);
});

test('getLoyaltyTier assigns proper tiers based on points threshold', () => {
  assert.equal(getLoyaltyTier(200), 'Bronze');
  assert.equal(getLoyaltyTier(400), 'Silver');
  assert.equal(getLoyaltyTier(1200), 'Gold');
  assert.equal(getLoyaltyTier(3000), 'Platinum');
});

test('Business Rule: Orders cannot be cancelled once marked Preparing', () => {
  assert.equal(canCancelOrder('new'), true);
  assert.equal(canCancelOrder('preparing'), false);
  assert.equal(canCancelOrder('ready'), false);
  assert.equal(canCancelOrder('on_the_way'), false);
  assert.equal(canCancelOrder('delivered'), false);
});

test('Business Rule: Payment must be confirmed before order preparation for online payments', () => {
  // Cash on delivery can be prepared before payment
  assert.equal(canBeginPreparation('cash', 'pending').canPrepare, true);

  // Online card requires payment status = paid
  assert.equal(canBeginPreparation('online_card', 'pending').canPrepare, false);
  assert.equal(canBeginPreparation('online_card', 'paid').canPrepare, true);

  // MoMo requires payment status = paid
  assert.equal(canBeginPreparation('momo', 'pending').canPrepare, false);
  assert.equal(canBeginPreparation('momo', 'paid').canPrepare, true);
});

test('validateCheckout catches missing fields and empty cart', () => {
  const emptyCartValidation = validateCheckout({ name: 'Alex' }, []);
  assert.equal(emptyCartValidation.isValid, false);

  const missingPhone = validateCheckout(
    { name: 'Alex', address: 'Kigali' },
    [{ totalItemPriceRWF: 100 } as OrderItem]
  );
  assert.equal(missingPhone.isValid, false);

  const valid = validateCheckout(
    { name: 'Alex Tuyiseng', phone: '+250788123456', address: 'Kiyovu, Kigali' },
    [{ totalItemPriceRWF: 100 } as OrderItem]
  );
  assert.equal(valid.isValid, true);
});

test('formatCurrency formats RWF and USD properly with 1 USD = 1460 RWF', () => {
  assert.equal(formatCurrency(14600, 'RWF'), '14,600 RWF');
  assert.equal(formatCurrency(14600, 'USD'), '$10.00');
  assert.equal(formatCurrency(1460, 'USD', 1460), '$1.00');
});
