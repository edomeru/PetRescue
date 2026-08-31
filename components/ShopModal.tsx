'use client';

import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, Check, ShoppingBag, Zap, Crown, Flame, CreditCard } from 'lucide-react';
import { loadGameState, addCoins, addBoosters, saveGameState, GameState } from '../lib/gameState';
import { soundFX } from '../game/audio/SoundFX';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStateUpdate: () => void;
}

export interface ShopItem {
  id: string;
  title: string;
  price: string;
  priceInCents: number;
  popular?: boolean;
  description: string;
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
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'starter_pack',
    title: 'Starter Saver Pack',
    price: '$1.99',
    priceInCents: 199,
    popular: true,
    description: '500 Coins + 3 Rockets + 🎀 Bow Accessory',
    rewards: { coins: 500, rockets: 3, accessory: 'bow' },
    icon: '📦',
  },
  {
    id: 'vip_pass',
    title: 'VIP Rescue Pass',
    price: '$4.99',
    priceInCents: 499,
    description: 'Unlock All Levels + 1,000 Coins + 👑 Crown',
    rewards: { coins: 1000, isVip: true, accessory: 'crown' },
    icon: '👑',
  },
  {
    id: 'mega_chest',
    title: 'Mega Coin Chest',
    price: '$9.99',
    priceInCents: 999,
    description: '3,000 Coins + 10 Hammers + 10 Rockets + 👓 Glasses',
    rewards: { coins: 3000, hammers: 10, rockets: 10, accessory: 'glasses' },
    icon: '💎',
  },
  {
    id: 'booster_pack',
    title: 'Booster Variety Box',
    price: '$0.99',
    priceInCents: 99,
    description: '2 Hammers + 2 Rockets + 2 Color Bombs',
    rewards: { hammers: 2, rockets: 2, colorBombs: 2, shuffles: 2 },
    icon: '⚡',
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, onStateUpdate }) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async (item: ShopItem) => {
    soundFX.playClick();
    setLoadingItemId(item.id);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          priceInCents: item.priceInCents,
          title: item.title,
          description: item.description,
        }),
      });

      const data = await response.json();

      if (data.mode === 'stripe' && data.url) {
        // Redirect to real Stripe Hosted Checkout session
        window.location.href = data.url;
      } else {
        // Instant Sandbox Simulator (awards items immediately for local testing)
        setTimeout(() => {
          awardRewards(item);
          setLoadingItemId(null);
          soundFX.playVictory();
          setSuccessMessage(`Purchased ${item.title}! Rewards added to inventory. 🎉`);
        }, 600);
      }
    } catch (err) {
      console.error('Purchase error:', err);
      // Fallback award in sandbox mode
      awardRewards(item);
      setLoadingItemId(null);
      soundFX.playVictory();
      setSuccessMessage(`Purchased ${item.title}! Rewards added to inventory. 🎉`);
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
      state.highestLevelUnlocked = 10; // Unlock all levels for VIP
    }

    saveGameState(state);
    onStateUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-modal w-full max-w-2xl rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center text-amber-300">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span>In-Game Shop</span>
                <span className="text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-wider">
                  Stripe Enabled
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                One-time purchases to unlock powerups, accessories & levels!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300 font-bold text-sm text-center animate-bounce-slow">
            {successMessage}
          </div>
        )}

        {/* Shop Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {SHOP_ITEMS.map((item) => {
            const isLoading = loadingItemId === item.id;

            return (
              <div
                key={item.id}
                className={`relative glass-panel rounded-2xl p-5 flex flex-col justify-between border transition hover:border-amber-400/50 ${
                  item.popular ? 'bg-gradient-to-b from-amber-500/10 to-purple-500/10 border-amber-400/40' : 'border-white/10'
                }`}
              >
                {item.popular && (
                  <span className="absolute -top-3 right-4 bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow">
                    Most Popular
                  </span>
                )}

                <div className="flex items-start gap-4 mb-3">
                  <span className="text-4xl">{item.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-white text-base leading-tight mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-300 font-medium">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
                  <span className="text-xl font-black text-amber-400">{item.price}</span>
                  <button
                    disabled={isLoading}
                    onClick={() => handlePurchase(item)}
                    className="btn-gold px-4 py-2 text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    {isLoading ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sandbox Indicator */}
        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sandbox Mode Active: Instant purchase simulation enabled</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">No card required</span>
        </div>
      </div>
    </div>
  );
};
