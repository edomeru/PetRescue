'use client';

import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, ShoppingBag, CreditCard, Coins, Zap, Crown, Flame } from 'lucide-react';
import { loadGameState, saveGameState } from '../lib/gameState';
import { getLocalUserId, syncStateWithFirebase } from '../lib/firebase';
import { soundFX } from '../game/audio/SoundFX';
import { prepareCheckoutWindow, navigateToCheckout, closeCheckoutWindow } from '../lib/checkout';
import { isFBInstantEnvironment, purchaseViaFBInstant } from '../lib/fbinstant';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStateUpdate: () => void;
  initialTab?: 'coins' | 'packs';
  returnTab?: 'map' | 'sanctuary' | 'game';
  returnLevel?: number;
}

export interface ShopItem {
  id: string;
  category: 'coins' | 'packs';
  title: string;
  price: string;
  priceInCents: number;
  popular?: boolean;
  bestValue?: boolean;
  description: string;
  coinsAmount?: number;
  rewards: {
    coins?: number;
    hammers?: number;
    rockets?: number;
    colorBombs?: number;
    shuffles?: number;
    accessory?: string;
    isVip?: boolean;
  };
  icon: string;
  bgGradient: string;
}

// ─── Accessory catalog (used both by ShopModal AND PetSanctuary direct-buy) ───
export interface AccessoryItem {
  id: string;
  name: string;
  emoji: string;
  priceInCents: number;
  price: string;
  description: string;
  isFree?: boolean;
  gradient: string;
  rarity: 'free' | 'common' | 'rare' | 'legendary';
}

export const ACCESSORY_CATALOG: AccessoryItem[] = [
  {
    id: 'none',
    name: 'None',
    emoji: '🚫',
    priceInCents: 0,
    price: 'Free',
    description: 'No accessory equipped',
    isFree: true,
    gradient: 'from-slate-700/40 to-slate-800/40 border-slate-600/40',
    rarity: 'free',
  },
  {
    id: 'bow',
    name: 'Bow',
    emoji: '🎀',
    priceInCents: 0,
    price: 'Free',
    description: 'A cute ribbon bow, free for all pets!',
    isFree: true,
    gradient: 'from-pink-500/20 to-rose-500/15 border-pink-400/40',
    rarity: 'free',
  },
  {
    id: 'hat',
    name: 'Top Hat',
    emoji: '🎩',
    priceInCents: 99,
    price: '$0.99',
    description: 'A dapper top hat for a distinguished look',
    gradient: 'from-slate-600/30 to-slate-700/20 border-slate-500/50',
    rarity: 'common',
  },
  {
    id: 'glasses',
    name: 'Glasses',
    emoji: '👓',
    priceInCents: 99,
    price: '$0.99',
    description: 'Smart round glasses for a nerdy-cute vibe',
    gradient: 'from-amber-500/20 to-yellow-600/15 border-amber-400/40',
    rarity: 'common',
  },
  {
    id: 'sunglasses',
    name: 'Sunglasses',
    emoji: '🕶️',
    priceInCents: 149,
    price: '$1.49',
    description: 'Cool shades for the trendiest pets on the block',
    gradient: 'from-blue-500/20 to-cyan-500/15 border-blue-400/40',
    rarity: 'common',
  },
  {
    id: 'tshirt',
    name: 'T-Shirt',
    emoji: '👕',
    priceInCents: 99,
    price: '$0.99',
    description: 'A comfy graphic tee for casual pet fashion',
    gradient: 'from-emerald-500/20 to-teal-500/15 border-emerald-400/40',
    rarity: 'common',
  },
  {
    id: 'jacket',
    name: 'Jacket',
    emoji: '🧥',
    priceInCents: 199,
    price: '$1.99',
    description: 'A stylish leather jacket for the cool pets',
    gradient: 'from-orange-500/25 to-red-500/15 border-orange-400/50',
    rarity: 'rare',
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    emoji: '🧤',
    priceInCents: 149,
    price: '$1.49',
    description: 'A cozy hoodie for the comfiest pet vibes',
    gradient: 'from-violet-500/20 to-purple-500/15 border-violet-400/40',
    rarity: 'common',
  },
  {
    id: 'shoes',
    name: 'Sneakers',
    emoji: '👟',
    priceInCents: 99,
    price: '$0.99',
    description: 'Sporty sneakers for the most athletic pets',
    gradient: 'from-lime-500/20 to-green-500/15 border-lime-400/40',
    rarity: 'common',
  },
  {
    id: 'scarf',
    name: 'Scarf',
    emoji: '🧣',
    priceInCents: 149,
    price: '$1.49',
    description: 'A warm cozy scarf for chilly sanctuary days',
    gradient: 'from-red-500/20 to-rose-500/15 border-red-400/40',
    rarity: 'common',
  },
  {
    id: 'cape',
    name: 'Hero Cape',
    emoji: '🦸',
    priceInCents: 299,
    price: '$2.99',
    description: 'Every rescued hero deserves a magnificent cape!',
    gradient: 'from-purple-500/25 to-indigo-500/20 border-purple-400/60',
    rarity: 'rare',
  },
  {
    id: 'crown',
    name: 'Royal Crown',
    emoji: '👑',
    priceInCents: 399,
    price: '$3.99',
    description: 'The most regal accessory for the most special pets',
    gradient: 'from-amber-400/30 to-yellow-400/20 border-amber-300/70',
    rarity: 'legendary',
  },
];

export const COIN_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'coins_500',
    category: 'coins',
    title: 'Pouch of Coins',
    price: '$0.99',
    priceInCents: 99,
    coinsAmount: 500,
    description: '+500 Gold Coins for boosters & pet care!',
    rewards: { coins: 500 },
    icon: '🪙',
    bgGradient: 'from-amber-500/20 to-yellow-600/10 border-amber-400/40',
  },
  {
    id: 'coins_1500',
    category: 'coins',
    title: 'Bag of Gold',
    price: '$1.99',
    priceInCents: 199,
    popular: true,
    coinsAmount: 1500,
    description: '+1,500 Gold Coins + bonus 300 coins included!',
    rewards: { coins: 1500 },
    icon: '💰',
    bgGradient: 'from-amber-400/25 to-orange-500/15 border-amber-300/60',
  },
  {
    id: 'coins_5000',
    category: 'coins',
    title: 'Treasure Vault',
    price: '$4.99',
    priceInCents: 499,
    bestValue: true,
    coinsAmount: 5000,
    description: '+5,000 Gold Coins (Best Value for Serious Rescuers)',
    rewards: { coins: 5000 },
    icon: '👑',
    bgGradient: 'from-purple-500/25 to-amber-500/20 border-purple-400/60',
  },
  {
    id: 'starter_pack',
    category: 'packs',
    title: 'Starter Hero Bundle',
    price: '$1.99',
    priceInCents: 199,
    popular: true,
    coinsAmount: 500,
    description: '500 Coins + 3 Rockets + 🎀 Bow Accessory',
    rewards: { coins: 500, rockets: 3, accessory: 'bow' },
    icon: '📦',
    bgGradient: 'from-indigo-500/20 to-purple-500/15 border-indigo-400/40',
  },
  {
    id: 'booster_variety',
    category: 'packs',
    title: 'Ultimate Booster Box',
    price: '$2.99',
    priceInCents: 299,
    coinsAmount: 800,
    description: '800 Coins + 3 Hammers + 3 Rockets + 3 Color Bombs + 2 Nuclear Pandas',
    rewards: { coins: 800, hammers: 3, rockets: 3, colorBombs: 3, shuffles: 2 },
    icon: '⚡',
    bgGradient: 'from-emerald-500/20 to-teal-500/15 border-emerald-400/40',
  },
  {
    id: 'vip_pass',
    category: 'packs',
    title: 'VIP Legend Pass',
    price: '$4.99',
    priceInCents: 499,
    bestValue: true,
    coinsAmount: 1000,
    description: 'Unlock All Levels 1-100 + 1,000 Coins + 👑 Royal Crown',
    rewards: { coins: 1000, isVip: true, accessory: 'crown' },
    icon: '💎',
    bgGradient: 'from-amber-400/20 to-pink-500/20 border-amber-300/50',
  },
  // ─── Accessory purchase items (resolved on Stripe return by itemId) ───
  ...ACCESSORY_CATALOG
    .filter((a) => !a.isFree)
    .map((a) => ({
      id: `accessory_${a.id}`,
      category: 'packs' as const,
      title: `${a.emoji} ${a.name}`,
      price: a.price,
      priceInCents: a.priceInCents,
      description: a.description,
      rewards: { accessory: a.id },
      icon: a.emoji,
      bgGradient: a.gradient,
    })),
];

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  onStateUpdate,
  initialTab = 'coins',
  returnTab = 'map',
  returnLevel = 1,
}) => {
  const [activeTab, setActiveTab] = useState<'coins' | 'packs'>(initialTab);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentItems = COIN_SHOP_ITEMS.filter((i) => i.category === activeTab);

  const handlePurchase = async (item: ShopItem) => {
    soundFX.playClick();
    const userId = getLocalUserId();

    // 1. Facebook Instant Games In-App Purchases (native Facebook checkout)
    if (isFBInstantEnvironment()) {
      setLoadingItemId(item.id);
      setSuccessMessage(null);
      try {
        const fbRes = await purchaseViaFBInstant(item.id, userId);
        if (fbRes.success) {
          awardRewards(item);
          soundFX.playVictory();
          setSuccessMessage(`Purchased ${item.title} via Facebook Pay! Added to your inventory. 🎉`);
        } else if (!fbRes.canceled) {
          alert(fbRes.error || 'Facebook purchase could not be completed.');
        }
      } catch (fbErr: any) {
        console.warn('Facebook Instant Games purchase error:', fbErr);
      } finally {
        setLoadingItemId(null);
      }
      return;
    }

    // 2. Standard Web & Iframe checkout (Stripe / Sandbox for itch.io, GameJolt, CrazyGames, Vercel)
    // Prepare checkout popup window immediately on click if running in an iframe (e.g. GameJolt)
    const checkoutWindow = prepareCheckoutWindow();
    setLoadingItemId(item.id);
    setSuccessMessage(null);

    // Persist pending context in localStorage so returning from Stripe restores exact tab & level
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'pet_rescue_stripe_pending',
          JSON.stringify({
            returnTab,
            returnLevel,
            timestamp: Date.now(),
          })
        );
      } catch (e) {}
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          priceInCents: item.priceInCents,
          title: item.title,
          description: item.description,
          userId,
          coinAmount: item.coinsAmount || item.rewards.coins || 0,
          returnTab,
          returnLevel,
        }),
      });

      const data = await response.json();

      if (data.mode === 'stripe' && data.url) {
        // Redirect to real Stripe Hosted Checkout session safely (navigates popup if in iframe)
        navigateToCheckout(data.url, checkoutWindow);
        setLoadingItemId(null);
      } else {
        closeCheckoutWindow(checkoutWindow);
        // Instant Sandbox Simulator (awards items immediately for local testing)
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('pet_rescue_stripe_pending');
          } catch (e) {}
        }
        setTimeout(() => {
          awardRewards(item);
          setLoadingItemId(null);
          soundFX.playVictory();
          setSuccessMessage(`Purchased ${item.title}! Added to your inventory. 🎉`);
        }, 600);
      }
    } catch (err) {
      console.error('Purchase error:', err);
      closeCheckoutWindow(checkoutWindow);
      // Fallback award in sandbox mode
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('pet_rescue_stripe_pending');
        } catch (e) {}
      }
      awardRewards(item);
      setLoadingItemId(null);
      soundFX.playVictory();
      setSuccessMessage(`Purchased ${item.title}! Added to your inventory. 🎉`);
    }
  };

  const awardRewards = (item: ShopItem) => {
    const state = loadGameState();

    if (item.rewards.coins) state.coins += item.rewards.coins;
    if (item.rewards.hammers) state.boosters.hammers += item.rewards.hammers;
    if (item.rewards.rockets) state.boosters.rockets += item.rewards.rockets;
    if (item.rewards.colorBombs) state.boosters.colorBombs += item.rewards.colorBombs;
    if (item.rewards.shuffles) state.boosters.shuffles += item.rewards.shuffles;

    if (item.rewards.accessory && !state.unlockedAccessories.includes(item.rewards.accessory)) {
      state.unlockedAccessories.push(item.rewards.accessory);
    }

    if (item.rewards.isVip) {
      state.isVip = true;
      state.highestLevelUnlocked = 100; // Unlock all levels for VIP
    }

    saveGameState(state);
    const userId = getLocalUserId();
    syncStateWithFirebase(userId, state);
    onStateUpdate();
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div className="glass-modal w-full max-w-2xl rounded-3xl p-6 relative overflow-hidden shadow-2xl border-2 border-amber-400/40 bg-slate-900/95 max-h-[92vh] flex flex-col justify-between">
        {/* Background Ambient Glow */}
        <div className="absolute w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -top-10 -left-10" />
        <div className="absolute w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />

        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Coins className="w-7 h-7 drop-shadow" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>Coin & Booster Shop</span>
                  <span className="text-[10px] font-extrabold bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/40 uppercase tracking-wider">
                    💳 Stripe Powered
                  </span>
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  Instant coin top-up with credit card for boosters and pet accessories!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-full transition text-slate-300 hover:text-white border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('coins');
              }}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                activeTab === 'coins'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>🪙 Buy Coins</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('packs');
              }}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                activeTab === 'packs'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>📦 Booster Bundles</span>
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300 font-bold text-xs sm:text-sm text-center animate-bounce-slow flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Shop Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[50vh] pr-1">
            {currentItems.map((item) => {
              const isLoading = loadingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`relative rounded-2xl p-4 flex flex-col justify-between border-2 bg-gradient-to-b ${item.bgGradient} transition hover:scale-[1.02] shadow-xl backdrop-blur-sm`}
                >
                  {item.popular && (
                    <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-lg border border-yellow-200">
                      ★ Popular
                    </span>
                  )}
                  {item.bestValue && (
                    <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-lg border border-purple-200">
                      👑 Best Value
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-3xl drop-shadow">{item.icon}</span>
                      <div>
                        <h3 className="font-black text-white text-sm leading-tight">{item.title}</h3>
                        {item.coinsAmount && (
                          <span className="text-xs font-black text-yellow-300 drop-shadow flex items-center gap-1">
                            +{item.coinsAmount} 🪙
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 font-semibold mb-3 leading-snug">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 mt-auto flex items-center justify-between">
                    <span className="text-lg font-black text-amber-300 drop-shadow">{item.price}</span>
                    <button
                      disabled={isLoading}
                      onClick={() => handlePurchase(item)}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 transition"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isLoading ? 'Loading...' : 'Pay Card'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-4 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Stripe Checkout • Instant In-Game Delivery</span>
          </div>
          <span className="text-[10px] text-indigo-300 font-bold">Safe & Secure 🔒</span>
        </div>
      </div>
    </div>
  );
};
