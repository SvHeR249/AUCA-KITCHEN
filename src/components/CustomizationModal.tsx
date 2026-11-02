import React, { useState } from 'react';
import {
  MenuItem,
  MenuItemAddon,
  MenuItemSide,
  MenuItemSize,
  MenuItemSpiciness,
  OrderItem,
} from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import { calculateItemTotal, formatCurrency } from '../utils/orderRules';
import { X, Plus, Minus, Flame, Sparkles } from 'lucide-react';

interface CustomizationModalProps {
  item: MenuItem;
  onClose: () => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({ item, onClose }) => {
  const { language, currency, settings, addToCart, t } = useRestaurant();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<MenuItemSize | undefined>(
    item.customizationOptions.sizes?.[0]
  );
  const [selectedSpiciness, setSelectedSpiciness] = useState<MenuItemSpiciness | undefined>(
    item.customizationOptions.spicinessLevels?.[0]
  );
  const [selectedSide, setSelectedSide] = useState<MenuItemSide | undefined>(
    item.customizationOptions.sides?.[0]
  );
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [itemNotes, setItemNotes] = useState('');

  const toggleAddon = (addon: MenuItemAddon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const { unitPriceRWF, totalItemPriceRWF } = calculateItemTotal(
    item.basePriceRWF,
    quantity,
    selectedSize?.priceDeltaRWF || 0,
    selectedAddons,
    selectedSide?.priceRWF || 0
  );

  const handleAddOrder = () => {
    const orderItem: OrderItem = {
      id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: item.id,
      name: item.name,
      basePriceRWF: item.basePriceRWF,
      quantity,
      selectedSize,
      selectedSpiciness,
      selectedAddons,
      selectedSide,
      itemNotes: itemNotes.trim() || undefined,
      unitPriceRWF,
      totalItemPriceRWF,
    };

    addToCart(orderItem);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-dish-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-br from-stone-900 to-stone-800 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner">
              {item.imageEmoji}
            </div>
            <div className="pr-6">
              <h3 id="modal-dish-title" className="text-xl font-bold text-white tracking-tight">
                {item.name[language] || item.name.en}
              </h3>
              <p className="text-xs text-stone-300 line-clamp-2 mt-1">
                {item.description[language] || item.description.en}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-stone-100">
          {/* Sizes */}
          {item.customizationOptions.sizes && item.customizationOptions.sizes.length > 0 && (
            <div className="pt-2 first:pt-0">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
                {t('portionSize')}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {item.customizationOptions.sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 text-left rounded-xl border text-xs transition-all ${
                      selectedSize?.id === size.id
                        ? 'border-amber-500 bg-amber-50/60 text-stone-900 font-semibold ring-1 ring-amber-500'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/50'
                    }`}
                  >
                    <div className="font-medium">{size.name[language] || size.name.en}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5 font-mono-nums">
                      {size.priceDeltaRWF > 0
                        ? `+${formatCurrency(size.priceDeltaRWF, currency, settings.exchangeRateRWFPerUSD)}`
                        : 'Included'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spice Level */}
          {item.customizationOptions.spicinessLevels && item.customizationOptions.spicinessLevels.length > 0 && (
            <div className="pt-4">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>{t('spiceLevel')}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.customizationOptions.spicinessLevels.map((spice) => (
                  <button
                    key={spice.id}
                    type="button"
                    onClick={() => setSelectedSpiciness(spice)}
                    className={`p-2.5 text-center rounded-xl border text-xs transition-all ${
                      selectedSpiciness?.id === spice.id
                        ? 'border-red-500 bg-red-50/70 text-red-950 font-semibold ring-1 ring-red-500'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div>{spice.name[language] || spice.name.en}</div>
                    <div className="text-[10px] text-red-500 mt-0.5">
                      {'🌶️'.repeat(Math.max(1, spice.level))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Complementary Side */}
          {item.customizationOptions.sides && item.customizationOptions.sides.length > 0 && (
            <div className="pt-4">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
                {t('chooseSide')}
              </label>
              <div className="space-y-2">
                {item.customizationOptions.sides.map((side) => (
                  <label
                    key={side.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      selectedSide?.id === side.id
                        ? 'border-amber-500 bg-amber-50/50 text-stone-900 font-semibold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="side-option"
                        checked={selectedSide?.id === side.id}
                        onChange={() => setSelectedSide(side)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>{side.name[language] || side.name.en}</span>
                    </div>
                    <span className="text-stone-500 font-mono-nums">
                      {side.priceRWF > 0
                        ? `+${formatCurrency(side.priceRWF, currency, settings.exchangeRateRWFPerUSD)}`
                        : 'Free'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {item.customizationOptions.addons && item.customizationOptions.addons.length > 0 && (
            <div className="pt-4">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('extraAddons')}</span>
              </label>
              <div className="space-y-2">
                {item.customizationOptions.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                        isChecked
                          ? 'border-stone-900 bg-stone-50 text-stone-900 font-semibold'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(addon)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>{addon.name[language] || addon.name.en}</span>
                      </div>
                      <span className="text-stone-600 font-mono-nums font-medium">
                        +{formatCurrency(addon.priceRWF, currency, settings.exchangeRateRWFPerUSD)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="pt-4">
            <label
              htmlFor="special-instructions"
              className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5"
            >
              {t('specialInstructions')}
            </label>
            <textarea
              id="special-instructions"
              rows={2}
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              placeholder={t('specialInstructionsPlaceholder')}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-stone-800 resize-none bg-stone-50/50"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-2 hover:bg-stone-100 text-stone-700 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 text-xs font-bold font-mono-nums text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="p-2 hover:bg-stone-100 text-stone-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs text-stone-500">
              <span className="font-mono-nums font-semibold text-stone-800">
                {formatCurrency(unitPriceRWF, currency, settings.exchangeRateRWFPerUSD)}
              </span>{' '}
              each
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddOrder}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>{t('addItemToCart')}</span>
            <span>·</span>
            <span className="font-mono-nums text-amber-300">
              {formatCurrency(totalItemPriceRWF, currency, settings.exchangeRateRWFPerUSD)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
