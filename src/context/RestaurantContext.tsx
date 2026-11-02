import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Currency,
  CustomerInfo,
  CustomerProfile,
  Language,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  SystemSettings,
  UserAccount,
  UserRole,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMER_PROFILE,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_USERS,
} from '../data/mockData';
import {
  calculateLoyaltyDiscount,
  calculateLoyaltyPointsEarned,
  calculateOrderSubtotal,
  canBeginPreparation,
  canCancelOrder,
  getLoyaltyTier,
} from '../utils/orderRules';
import { UI_TRANSLATIONS } from '../data/translations';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface RestaurantContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  role: UserRole;
  setRole: (r: UserRole) => void;
  t: (key: string) => string;

  // Authentication (FR1 & Business Rule: Customers must create an account / sign in before placing orders)
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signIn: (email: string, password?: string) => { success: boolean; error?: string };
  signUp: (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
  }) => { success: boolean; error?: string };
  signOut: () => void;

  // Menu
  categories: MenuCategory[];
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;

  // Cart
  cart: OrderItem[];
  addToCart: (item: OrderItem) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotalRWF: number;

  // Customer Profile & Loyalty
  customerProfile: CustomerProfile;
  toggleFavorite: (itemId: string) => void;
  redeemPoints: (points: number) => void;

  // Orders
  orders: Order[];
  activeTrackOrderId: string | null;
  setActiveTrackOrderId: (id: string | null) => void;
  placeOrder: (
    customer: CustomerInfo,
    paymentMethod: PaymentMethod,
    pointsToRedeem: number,
    orderNotes?: string
  ) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  updateOrderStatus: (orderId: string, nextStatus: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string) => { success: boolean; error?: string };

  // Users & System Settings
  users: UserAccount[];
  addUser: (user: Omit<UserAccount, 'id'>) => void;
  updateUser: (id: string, updates: Partial<UserAccount>) => void;
  settings: SystemSettings;
  updateSettings: (updates: Partial<SystemSettings>) => void;

  // Notifications
  notifications: NotificationToast[];
  dismissNotification: (id: string) => void;
  triggerChime: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ORDERS: 'auca_restaurant_orders_v2',
  MENU: 'auca_restaurant_menu_v2',
  PROFILE: 'auca_restaurant_profile_v2',
  SETTINGS: 'auca_restaurant_settings_v2',
  CART: 'auca_restaurant_cart_v2',
  ROLE: 'auca_restaurant_role_v2',
  LANG: 'auca_restaurant_lang_v2',
  CURR: 'auca_restaurant_currency_v2',
  AUTH: 'auca_restaurant_auth_v2',
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANG) as Language) || 'en';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem(STORAGE_KEYS.CURR) as Currency) || 'RWF';
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'customer';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [categories] = useState<MenuCategory[]>(INITIAL_CATEGORIES);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MENU);
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_PROFILE;
  });

  const [cart, setCart] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        restaurantName: 'AUCA KITCHEN',
        exchangeRateRWFPerUSD: 1460,
      };
    }
    return INITIAL_SYSTEM_SETTINGS;
  });

  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [activeTrackOrderId, setActiveTrackOrderId] = useState<string | null>(() => {
    return INITIAL_ORDERS[0]?.id || null;
  });
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(customerProfile));
  }, [customerProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem(STORAGE_KEYS.CURR, curr);
  };

  const setRole = (r: UserRole) => {
    setRoleState(r);
    localStorage.setItem(STORAGE_KEYS.ROLE, r);
  };

  // Translation helper
  const t = (key: string): string => {
    return UI_TRANSLATIONS[language]?.[key] || UI_TRANSLATIONS['en']?.[key] || key;
  };

  // Web Audio chime for real-time kitchen bell or order alerts
  const triggerChime = () => {
    if (!settings.soundAlertsEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext unavailable or restricted
    }
  };

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: NotificationToast = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
    triggerChime();

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      dismissNotification(id);
    }, 6000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Authentication Actions (FR1: Customers register and log in)
  const signIn = (email: string, _password?: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const existingUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existingUser) {
      setCustomerProfile((prev) => ({
        ...prev,
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
      }));
    } else {
      // Allow signing in with any valid email and update profile email
      const derivedName = trimmedEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      setCustomerProfile((prev) => ({
        ...prev,
        name: prev.email.toLowerCase() === trimmedEmail ? prev.name : derivedName,
        email: trimmedEmail,
      }));
    }

    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    addNotification('Welcome Back!', `Signed in to AUCA KITCHEN as ${trimmedEmail}`, 'success');
    return { success: true };
  };

  const signUp = (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
  }): { success: boolean; error?: string } => {
    if (!data.name || data.name.trim().length < 2) {
      return { success: false, error: 'Please provide your full name.' };
    }
    if (!data.email || !data.email.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (!data.phone || data.phone.trim().length < 6) {
      return { success: false, error: 'Please provide a valid phone number.' };
    }

    const newCustomerId = `cust-${Date.now()}`;
    const newProfile: CustomerProfile = {
      id: newCustomerId,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address?.trim() || 'AUCA Masoro Campus, Kigali',
      loyaltyPoints: 100, // Welcome bonus 100 pts!
      loyaltyTier: 'Bronze',
      totalOrdersCount: 0,
      favoriteItemIds: ['dish-1'],
      pointHistory: [
        {
          id: `ph-welcome-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          delta: +100,
          reason: 'AUCA KITCHEN New Account Welcome Bonus',
        },
      ],
    };

    setCustomerProfile(newProfile);
    setUsers((prev) => [
      ...prev,
      {
        id: newCustomerId,
        name: newProfile.name,
        email: newProfile.email,
        phone: newProfile.phone,
        role: 'customer',
        status: 'active',
      },
    ]);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    addNotification(
      'Account Created!',
      `Welcome ${newProfile.name}! You received 100 bonus loyalty points.`,
      'success'
    );
    return { success: true };
  };

  const signOut = () => {
    setIsAuthenticated(false);
    addNotification('Signed Out', 'You have signed out of your account.', 'info');
  };

  // Cart operations
  const addToCart = (item: OrderItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (p) =>
          p.menuItemId === item.menuItemId &&
          p.selectedSize?.id === item.selectedSize?.id &&
          p.selectedSpiciness?.id === item.selectedSpiciness?.id &&
          p.selectedSide?.id === item.selectedSide?.id &&
          JSON.stringify(p.selectedAddons.map((a) => a.id).sort()) ===
            JSON.stringify(item.selectedAddons.map((a) => a.id).sort()) &&
          (p.itemNotes || '') === (item.itemNotes || '')
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const current = next[existingIndex];
        const newQty = current.quantity + item.quantity;
        next[existingIndex] = {
          ...current,
          quantity: newQty,
          totalItemPriceRWF: current.unitPriceRWF * newQty,
        };
        return next;
      }
      return [...prev, item];
    });

    addNotification('Added to Order', `${item.name[language] || item.name.en} added to cart.`, 'success');
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              totalItemPriceRWF: item.unitPriceRWF * quantity,
            }
          : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotalRWF = calculateOrderSubtotal(cart);

  // Favorites
  const toggleFavorite = (itemId: string) => {
    setCustomerProfile((prev) => {
      const exists = prev.favoriteItemIds.includes(itemId);
      const favoriteItemIds = exists
        ? prev.favoriteItemIds.filter((id) => id !== itemId)
        : [...prev.favoriteItemIds, itemId];
      return { ...prev, favoriteItemIds };
    });
  };

  const redeemPoints = (points: number) => {
    setCustomerProfile((prev) => {
      const nextPoints = Math.max(0, prev.loyaltyPoints - points);
      return {
        ...prev,
        loyaltyPoints: nextPoints,
        loyaltyTier: getLoyaltyTier(nextPoints),
      };
    });
  };

  // Order Placement
  const placeOrder = async (
    customer: CustomerInfo,
    paymentMethod: PaymentMethod,
    pointsToRedeem: number,
    orderNotes?: string
  ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return {
        success: false,
        error: 'Please sign in or create an account to confirm and place your order.',
      };
    }

    if (cart.length === 0) {
      return { success: false, error: 'Cart is empty.' };
    }

    const subtotal = cartSubtotalRWF;
    const deliveryFee = subtotal >= settings.freeDeliveryThresholdRWF ? 0 : settings.deliveryFeeRWF;
    const discount = calculateLoyaltyDiscount(
      pointsToRedeem,
      settings.rwfDiscountPerPoint,
      subtotal
    );
    const totalAmount = Math.max(0, subtotal + deliveryFee - discount);
    const pointsEarned = calculateLoyaltyPointsEarned(subtotal, settings.loyaltyPointsPer1000RWF);

    const existingNums = orders
      .map((o) => parseInt(o.orderNumber.replace('#', ''), 10))
      .filter((n) => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 104;
    const orderNumber = `#${nextNum.toString().padStart(3, '0')}`;

    const orderId = `ord-${Date.now()}`;
    const initialPaymentStatus: PaymentStatus =
      paymentMethod === 'cash' ? 'pending' : 'paid';

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customer,
      items: [...cart],
      subtotalRWF: subtotal,
      deliveryFeeRWF: deliveryFee,
      discountRWF: discount,
      pointsEarned,
      pointsRedeemed: pointsToRedeem,
      totalAmountRWF: totalAmount,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      paymentReference:
        paymentMethod === 'momo'
          ? `MOMO-${Math.floor(1000000 + Math.random() * 9000000)}`
          : paymentMethod === 'online_card'
          ? `VISA-${Math.floor(10000 + Math.random() * 90000)}`
          : undefined,
      status: 'new',
      assignedDriverId: 'drv-alex',
      assignedDriverName: 'Alex Tuyiseng',
      assignedDriverPhone: '+250 782 555 789',
      estimatedDeliveryMinutes: 35,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: orderNotes,
      statusTimeline: [
        {
          status: 'new',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actor: customer.name,
          note: `Order ${orderNumber} placed via ${
            paymentMethod === 'momo'
              ? 'MTN Mobile Money'
              : paymentMethod === 'online_card'
              ? 'Credit/Debit Card'
              : 'Cash on Delivery'
          }`,
        },
      ],
    };

    // Update customer loyalty ledger
    setCustomerProfile((prev) => {
      const netPoints = prev.loyaltyPoints - pointsToRedeem + pointsEarned;
      const historyItem = {
        id: `ph-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        delta: pointsEarned - pointsToRedeem,
        reason: `Order ${orderNumber} (${pointsEarned > 0 ? `+${pointsEarned} earned` : ''} ${
          pointsToRedeem > 0 ? `-${pointsToRedeem} redeemed` : ''
        })`,
      };
      return {
        ...prev,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        loyaltyPoints: Math.max(0, netPoints),
        loyaltyTier: getLoyaltyTier(netPoints),
        totalOrdersCount: prev.totalOrdersCount + 1,
        pointHistory: [historyItem, ...prev.pointHistory],
      };
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setActiveTrackOrderId(orderId);

    addNotification(
      `Order ${orderNumber} Confirmed!`,
      `Thank you ${customer.name}! You can track or cancel your order before Kitchen Staff accepts it.`,
      'success'
    );

    return { success: true, orderId };
  };

  // Staff & Delivery Order Status Updates
  const updateOrderStatus = (orderId: string, nextStatus: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        if (nextStatus === 'preparing') {
          const check = canBeginPreparation(ord.paymentMethod, ord.paymentStatus);
          if (!check.canPrepare) {
            addNotification('Payment Required', check.reason || 'Payment not yet confirmed.', 'warning');
            return ord;
          }
        }

        const now = new Date();
        const timelineItem = {
          status: nextStatus,
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actor:
            role === 'staff'
              ? 'Kitchen Staff'
              : role === 'delivery'
              ? 'Rider Alex'
              : role === 'manager'
              ? 'Manager'
              : 'System',
          note: note || `Status transitioned to ${nextStatus}`,
        };

        const updatedOrder: Order = {
          ...ord,
          status: nextStatus,
          updatedAt: now.toISOString(),
          statusTimeline: [...ord.statusTimeline, timelineItem],
        };

        if (nextStatus === 'delivered' && ord.paymentMethod === 'cash') {
          updatedOrder.paymentStatus = 'paid';
        }

        return updatedOrder;
      })
    );

    addNotification('Order Updated', `Order status moved to ${nextStatus}.`, 'info');
  };

  // Cancellation adhering to PDF Business Rule
  const cancelOrder = (orderId: string): { success: boolean; error?: string } => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found.' };

    if (!canCancelOrder(order.status)) {
      const err = 'Orders cannot be canceled once Kitchen Staff has accepted and marked them "Preparing".';
      addNotification('Cancellation Blocked', err, 'error');
      return { success: false, error: err };
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
          statusTimeline: [
            ...ord.statusTimeline,
            {
              status: 'cancelled',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actor: customerProfile.name || 'Customer',
              note: 'Order cancelled by customer before kitchen staff accepted order.',
            },
          ],
        };
      })
    );

    addNotification('Order Cancelled', `Order ${order.orderNumber} has been cancelled.`, 'warning');
    return { success: true };
  };

  // Menu Management
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `dish-${Date.now()}`,
    };
    setMenuItems((prev) => [newItem, ...prev]);
    addNotification('Menu Updated', `Dish "${newItem.name[language] || newItem.name.en}" added.`, 'success');
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    addNotification('Menu Updated', 'Menu item updated successfully.', 'success');
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    addNotification('Menu Item Removed', 'Dish removed from active catalog.', 'info');
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  // User Management
  const addUser = (user: Omit<UserAccount, 'id'>) => {
    const newUser: UserAccount = {
      ...user,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    addNotification('User Created', `User account ${newUser.name} created.`, 'success');
  };

  const updateUser = (id: string, updates: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    addNotification('Settings Saved', 'System configurations updated.', 'success');
  };

  return (
    <RestaurantContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        role,
        setRole,
        t,
        isAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signIn,
        signUp,
        signOut,
        categories,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotalRWF,
        customerProfile,
        toggleFavorite,
        redeemPoints,
        orders,
        activeTrackOrderId,
        setActiveTrackOrderId,
        placeOrder,
        updateOrderStatus,
        cancelOrder,
        users,
        addUser,
        updateUser,
        settings,
        updateSettings,
        notifications,
        dismissNotification,
        triggerChime,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
