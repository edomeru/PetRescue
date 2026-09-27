'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Volume2, VolumeX, ShoppingBag, Map, Sparkles, Settings } from 'lucide-react';
import { GameState } from '../lib/gameState';
import { soundFX } from '../game/audio/SoundFX';

interface NavbarProps {
  gameState: GameState;
  activeTab: 'map' | 'sanctuary' | 'game';
  onNavigate: (tab: 'map' | 'sanctuary' | 'game') => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onStateUpdate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  gameState,
  activeTab,
  onNavigate,
  onOpenShop,
  onOpenSettings,
  onStateUpdate,
}) => {
  // Defer client-only values to avoid SSR/hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rescuedCount = mounted ? gameState.rescuedPets.length : 0;
  const coins = mounted ? gameState.coins : 0;
  const soundEnabled = mounted ? gameState.soundEnabled : true;

  const toggleSound = () => {
    const newState = !gameState.soundEnabled;
    soundFX.setSoundEnabled(newState);
    gameState.soundEnabled = newState;
    onStateUpdate();
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-emerald-950/40 border-b border-emerald-500/20 px-4 py-3 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => {
            soundFX.playClick();
            onNavigate('map');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-xl shadow-lg group-hover:scale-105 transition">
            🐾
          </div>
          <div>
            <span className="font-black text-xl text-white tracking-tight leading-none block">
              Pawtora <span className="text-pink-400 font-extrabold text-sm">3D</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Puzzle & Sanctuary
            </span>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="hidden sm:flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/10">
          <button
            onClick={() => {
              soundFX.playClick();
              onNavigate('map');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition ${
              activeTab === 'map'
                ? 'bg-pink-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Map className="w-3.5 h-3.5" /> Level Map
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onNavigate('sanctuary');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition ${
              activeTab === 'sanctuary'
                ? 'bg-pink-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" /> Sanctuary ({rescuedCount})
          </button>
        </nav>

        {/* Stats & Actions */}
        <div className="flex items-center gap-3">
          {/* Lives Counter */}
          <div className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-full text-rose-300 text-xs font-black">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            <span>{mounted ? gameState.lives : 0} / {mounted ? gameState.maxLives : 0}</span>
          </div>

          {/* Coins Badge */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenShop();
            }}
            className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 hover:bg-amber-400/30 px-3.5 py-1.5 rounded-full text-amber-300 text-xs font-black transition cursor-pointer"
          >
            <span>🪙 {coins}</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-slate-300"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenSettings();
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-slate-300"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
