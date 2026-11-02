import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem } from '../types';
import { formatCurrency } from '../utils/orderRules';
import { CustomizationModal } from './CustomizationModal';
import { AucaLogo } from './AucaLogo';
import {
  Search,
  Flame,
  Star,
  Clock,
  Heart,
  Plus,
  UtensilsCrossed,
  Sparkles,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

interface CustomerMenuProps {
  onOpenCart: () => void;
}

export const CustomerMenu: React.FC<CustomerMenuProps> = ({ onOpenCart }) => {
  const {
    menuItems,
    categories,
    language,
    currency,
    settings,
    customerProfile,
    toggleFavorite,
    addToCart,
    cartCount,
    cartSubtotalRWF,
    isAuthenticated,
    t,
  } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }

      // Dietary filter
      if (selectedDietary !== 'all' && !item.dietary.includes(selectedDietary as any)) {
        return false;
      }

      // Search query filter (matches name or description in any language)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = Object.values(item.name).some((v) => v.toLowerCase().includes(query));
        const descMatch = Object.values(item.description).some((v) =>
          v.toLowerCase().includes(query)
        );
        if (!nameMatch && !descMatch) return false;
      }

      return true;
    });
  }, [menuItems, selectedCategory, selectedDietary, searchQuery]);

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // If item has sizes or required options, open modal. Otherwise quick add.
    if (
      (item.customizationOptions.sizes && item.customizationOptions.sizes.length > 1) ||
      (item.customizationOptions.spicinessLevels &&
        item.customizationOptions.spicinessLevels.length > 1) ||
      (item.customizationOptions.sides && item.customizationOptions.sides.length > 0)
    ) {
      setCustomizingItem(item);
      return;
    }

    addToCart({
      id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: item.id,
      name: item.name,
      basePriceRWF: item.basePriceRWF,
      quantity: 1,
      selectedAddons: [],
      unitPriceRWF: item.basePriceRWF,
      totalItemPriceRWF: item.basePriceRWF,
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Editorial Hero Banner with AUCA University Crest */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0B2545] text-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2545] via-[#134074]/95 to-amber-900/40 z-0" />
        <div className="relative z-10 max-w-5xl px-6 py-10 sm:px-10 sm:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Adventist University of Central Africa (AUCA)</span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-200">Campus & Kigali Express</span>
            </div>

            <div className="flex items-center gap-4">
              <AucaLogo size={60} className="hidden sm:block" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-balance">
                {t('restaurantName')}
              </h1>
            </div>

            <p className="text-stone-200 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
              {t('tagline')}. Browse our menu, customize your dishes, and sign in or create an account
              at checkout to confirm and track your order in real time.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-200">
            <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700/60">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Prep Time: 15–25 mins</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700/60">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>4.9 Customer Rating (800+ reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Rate: 1 USD = 1,460 RWF · 10 Pts / 1,000 RWF</span>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Wireframe 1: Search Bar & Filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label="Search food menu items"
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 placeholder:text-stone-400 shadow-xs"
            />
          </div>

          {/* Dietary Filter Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto text-xs shrink-0">
            <button
              type="button"
              onClick={() => setSelectedDietary('all')}
              className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedDietary === 'all'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Diets
            </button>
            <button
              type="button"
              onClick={() => setSelectedDietary('chef-special')}
              className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedDietary === 'chef-special'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Chef's Special
            </button>
            <button
              type="button"
              onClick={() => setSelectedDietary('halal')}
              className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedDietary === 'halal'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Halal
            </button>
            <button
              type="button"
              onClick={() => setSelectedDietary('vegetarian')}
              className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedDietary === 'vegetarian'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Vegetarian
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-stone-200">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-t-lg font-semibold border-b-2 transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'border-stone-900 text-stone-900 bg-white shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            {t('allCategories')} ({menuItems.length})
          </button>
          {categories.map((cat) => {
            const count = menuItems.filter((m) => m.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-t-lg font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'border-stone-900 text-stone-900 bg-white shadow-xs'
                    : 'border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300'
                }`}
              >
                {cat.name[language] || cat.name.en} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Wireframe 1: Food Cards Grid */}
      <section>
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
            <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">No dishes match your filter</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Try searching for different ingredients, or clear your dietary preferences.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDietary('all');
              }}
              className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isFav = customerProfile.favoriteItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setCustomizingItem(item)}
                  className="group cursor-pointer bg-white rounded-2xl border border-stone-200 hover:border-stone-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  {/* Visual Header / Food Card Top */}
                  <div className={`relative h-44 bg-gradient-to-br ${item.accentBg} p-5 flex flex-col justify-between overflow-hidden`}>
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-md text-white text-[11px] font-medium">
                        <Clock className="w-3 h-3 text-amber-300" />
                        <span>{item.prepTimeMinutes} {t('prepTime')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        aria-label="Add to favorites"
                        className="p-2 rounded-full bg-black/25 backdrop-blur-xs text-white hover:text-red-400 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-center my-auto z-10 transform group-hover:scale-110 transition-transform duration-300">
                      <span className="text-6xl drop-shadow-md select-none">{item.imageEmoji}</span>
                    </div>

                    <div className="flex items-center justify-between text-white/90 text-xs z-10">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span className="font-bold font-mono-nums">{item.rating}</span>
                        <span className="text-white/70">({item.reviewCount})</span>
                      </div>
                      {item.calories && (
                        <span className="text-[11px] text-white/80 font-mono-nums">
                          {item.calories} {t('calories')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                          {item.name[language] || item.name.en}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {item.description[language] || item.description.en}
                      </p>
                    </div>

                    {/* Metadata line without pills */}
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      {item.dietary.map((d, idx) => (
                        <React.Fragment key={d}>
                          <span className="capitalize">{d.replace('-', ' ')}</span>
                          {idx < item.dietary.length - 1 && <span aria-hidden="true">·</span>}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Price and Action Bar */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">
                          Price
                        </span>
                        <span className="text-base font-bold font-mono-nums text-stone-900">
                          {formatCurrency(item.basePriceRWF, currency, settings.exchangeRateRWFPerUSD)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomizingItem(item);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors"
                        >
                          {t('customize')}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(item, e)}
                          aria-label={`Add ${item.name.en} to cart`}
                          className="p-2 rounded-lg bg-stone-900 hover:bg-amber-600 text-white transition-colors shadow-xs"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Cart Checkout Bar when items are added */}
      {cartCount > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4">
          <div className="bg-[#0B2545] text-white p-4 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 font-extrabold font-mono-nums flex items-center justify-center">
                {cartCount}
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in your order
                </div>
                <div className="text-xs text-amber-300 font-mono-nums font-semibold">
                  Subtotal: {formatCurrency(cartSubtotalRWF, currency, settings.exchangeRateRWFPerUSD)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenCart}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 shrink-0 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAuthenticated ? 'Review & Confirm Order' : 'Sign In & Confirm Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
        />
      )}
    </div>
  );
};
