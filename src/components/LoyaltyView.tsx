import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatCurrency } from '../utils/orderRules';
import {
  Coins,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  Gift,
  ArrowRight,
  Heart,
  Plus,
} from 'lucide-react';

interface LoyaltyViewProps {
  onBackToMenu: () => void;
}

export const LoyaltyView: React.FC<LoyaltyViewProps> = ({ onBackToMenu }) => {
  const { customerProfile, menuItems, addToCart, currency, settings, language, t } =
    useRestaurant();

  const tierNextThresholds = {
    Bronze: 400,
    Silver: 1000,
    Gold: 2500,
    Platinum: 5000,
  };

  const nextThreshold = tierNextThresholds[customerProfile.loyaltyTier] || 1000;
  const progressPercent = Math.min(
    100,
    Math.round((customerProfile.loyaltyPoints / nextThreshold) * 100)
  );

  const favoriteItems = menuItems.filter((item) =>
    customerProfile.favoriteItemIds.includes(item.id)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Loyalty Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white p-8 sm:p-10 shadow-xl border border-stone-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-4 h-4" />
              <span>AUCA Gourmet Club</span>
              <span>·</span>
              <span>{customerProfile.loyaltyTier} Tier Member</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {customerProfile.name}
            </h1>
            <p className="text-xs text-stone-300 max-w-md">
              Earn 10 points for every 1,000 RWF spent. Redeem your points for instant meal discounts
              and chef tasting perks across Kigali.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0 min-w-[180px]">
            <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider block">
              Active Points Balance
            </span>
            <div className="text-3xl font-black font-mono-nums text-white my-1">
              {customerProfile.loyaltyPoints}
            </div>
            <div className="text-[11px] text-stone-300 font-mono-nums">
              ≈{' '}
              {formatCurrency(
                customerProfile.loyaltyPoints * settings.rwfDiscountPerPoint,
                currency,
                settings.exchangeRateRWFPerUSD
              )}{' '}
              in discounts
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 space-y-2">
          <div className="flex justify-between text-xs text-stone-300">
            <span>
              Current Tier: <strong>{customerProfile.loyaltyTier}</strong>
            </span>
            <span>
              Next Tier at <strong>{nextThreshold} pts</strong>
            </span>
          </div>
          <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2 Column: Benefits & Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier Benefits */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Tier Perks & Privileges</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
              <Gift className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-stone-900">Direct Checkout Redemption</div>
                <div className="text-[11px] text-stone-500">
                  Redeem 100 points for 500 RWF off any food order.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-stone-900">Priority Kitchen Dispatch</div>
                <div className="text-[11px] text-stone-500">
                  Silver and Gold members enjoy expedited preparation queues during peak hours.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
              <Coins className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-stone-900">Birthday & Holiday Surprises</div>
                <div className="text-[11px] text-stone-500">
                  Bonus 500 points credit on anniversary and major celebrations.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Points History Ledger */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-stone-700" />
            <span>Points Ledger & Activity</span>
          </h2>

          <div className="space-y-2.5 max-h-64 overflow-y-auto text-xs">
            {customerProfile.pointHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-stone-900">{item.reason}</div>
                  <div className="text-[10px] text-stone-400 font-mono-nums">{item.date}</div>
                </div>
                <span
                  className={`font-mono-nums font-bold text-xs ${
                    item.delta >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {item.delta >= 0 ? `+${item.delta}` : item.delta} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Favorite Dishes & Fast Reorder */}
      {favoriteItems.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Your Favorite Dishes</span>
            </h2>
            <button
              type="button"
              onClick={onBackToMenu}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
            >
              Browse Full Menu →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {favoriteItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.imageEmoji}</span>
                  <div>
                    <h3 className="font-bold text-xs text-stone-900 line-clamp-1">
                      {item.name[language] || item.name.en}
                    </h3>
                    <span className="font-mono-nums text-xs font-semibold text-stone-700">
                      {formatCurrency(item.basePriceRWF, currency, settings.exchangeRateRWFPerUSD)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    addToCart({
                      id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                      menuItemId: item.id,
                      name: item.name,
                      basePriceRWF: item.basePriceRWF,
                      quantity: 1,
                      selectedAddons: [],
                      unitPriceRWF: item.basePriceRWF,
                      totalItemPriceRWF: item.basePriceRWF,
                    })
                  }
                  className="w-full py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Reorder Dish</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
