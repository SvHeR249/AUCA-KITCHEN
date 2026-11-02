export type Language = 'en' | 'fr' | 'rw' | 'sw';
export type Currency = 'RWF' | 'USD';

export type UserRole = 'customer' | 'staff' | 'delivery' | 'manager';

export type OrderStatus =
  | 'new'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'online_card' | 'momo' | 'cash';
export type PaymentStatus = 'paid' | 'pending' | 'failed';

export interface LocalizedString {
  en: string;
  fr: string;
  rw: string;
  sw: string;
}

export interface MenuItemSize {
  id: string;
  name: LocalizedString;
  priceDeltaRWF: number;
}

export interface MenuItemSpiciness {
  id: string;
  name: LocalizedString;
  level: number;
}

export interface MenuItemAddon {
  id: string;
  name: LocalizedString;
  priceRWF: number;
}

export interface MenuItemSide {
  id: string;
  name: LocalizedString;
  priceRWF: number;
}

export interface MenuItem {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  categoryId: string;
  basePriceRWF: number;
  isAvailable: boolean;
  prepTimeMinutes: number;
  calories?: number;
  dietary: ('vegetarian' | 'vegan' | 'halal' | 'gluten-free' | 'chef-special')[];
  imageEmoji: string;
  accentBg: string;
  rating: number;
  reviewCount: number;
  customizationOptions: {
    sizes?: MenuItemSize[];
    spicinessLevels?: MenuItemSpiciness[];
    addons?: MenuItemAddon[];
    sides?: MenuItemSide[];
  };
}

export interface MenuCategory {
  id: string;
  name: LocalizedString;
  iconName: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: LocalizedString;
  basePriceRWF: number;
  quantity: number;
  selectedSize?: MenuItemSize;
  selectedSpiciness?: MenuItemSpiciness;
  selectedAddons: MenuItemAddon[];
  selectedSide?: MenuItemSide;
  itemNotes?: string;
  unitPriceRWF: number;
  totalItemPriceRWF: number;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  notes?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#101"
  customer: CustomerInfo;
  items: OrderItem[];
  subtotalRWF: number;
  deliveryFeeRWF: number;
  discountRWF: number;
  pointsEarned: number;
  pointsRedeemed: number;
  totalAmountRWF: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  status: OrderStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  statusTimeline: OrderStatusEvent[];
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  totalOrdersCount: number;
  favoriteItemIds: string[];
  pointHistory: {
    id: string;
    date: string;
    delta: number;
    reason: string;
  }[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  status: 'active' | 'suspended';
  assignedZone?: string;
}

export interface SystemSettings {
  restaurantName: string;
  exchangeRateRWFPerUSD: number;
  deliveryFeeRWF: number;
  freeDeliveryThresholdRWF: number;
  taxPercent: number;
  loyaltyPointsPer1000RWF: number;
  rwfDiscountPerPoint: number;
  minPointsToRedeem: number;
  acceptOnlineCards: boolean;
  acceptMobileMoney: boolean;
  acceptCashOnDelivery: boolean;
  soundAlertsEnabled: boolean;
}
