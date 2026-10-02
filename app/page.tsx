'use client';

import React, { useState, useEffect } from 'react';
import dynamicImport from 'next/dynamic';
import { Navbar } from '../components/Navbar';
import { LevelMap } from '../components/LevelMap';
import { PetSanctuary } from '../components/PetSanctuary';
import { ShopModal } from '../components/ShopModal';
import { SettingsModal } from '../components/SettingsModal';
import { loadGameState, saveGameState, setCurrentLevel, GameState } from '../lib/gameState';
import { getWorldForLevel } from '../game/levelConfigs';
import { initFirebaseAnonymousAuth, loadStateFromFirebase, syncStateWithFirebase, getLocalUserId } from '../lib/firebase';
import { COIN_SHOP_ITEMS, ACCESSORY_CATALOG } from '../components/ShopModal';
import confetti from 'canvas-confetti';

import { Sparkles, CheckCircle2 } from 'lucide-react';
import { soundFX } from '../game/audio/SoundFX';

// Dynamically import GameCanvas with SSR disabled because Phaser 3 requires browser globals (window, navigator)
const DynamicGameCanvas = dynamicImport(
  () => import('../components/GameCanvas').then((mod) => mod.GameCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-[480px] h-[600px] flex flex-col items-center justify-center glass-panel rounded-3xl text-slate-300 font-bold animate-pulse">
        <span className="text-4xl mb-3">🐾</span>
        <span>Loading Phaser Game Engine...</span>
      </div>
    ),
  }
);

export const dynamic = 'force-dynamic';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState>(INITIAL_LOAD());
  const [activeTab, setActiveTab] = useState<'map' | 'sanctuary' | 'game'>('map');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [showPandaOverlay, setShowPandaOverlay] = useState<boolean>(false);
  const [autoCountdown, setAutoCountdown] = useState<number>(3);
  const [paymentToast, setPaymentToast] = useState<string | null>(null);
  const [sanctuaryTab, setSanctuaryTab] = useState<'yard' | 'mypets'>('yard');

  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    let current = loadGameState();
    setGameState(current);

    // Determine target screen and level (default: map, or game if returning from Stripe / in-game shop)
    let targetTab: 'map' | 'sanctuary' | 'game' = 'map';
    let targetLevel: number = current.currentLevel || 1;

    // Check query params & stored pending Stripe checkout session
    let storedPending: { returnTab?: 'map' | 'sanctuary' | 'game'; returnLevel?: number; returnPetId?: string } | null = null;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const purchaseStatus = params.get('purchase');
      const tabParam = params.get('tab');
      const levelParam = params.get('level');

      try {
        const rawPending = localStorage.getItem('pet_rescue_stripe_pending');
        if (rawPending) {
          storedPending = JSON.parse(rawPending);
          localStorage.removeItem('pet_rescue_stripe_pending');
        }
      } catch (e) {}

      const destTab = (tabParam as 'map' | 'sanctuary' | 'game') || (purchaseStatus ? storedPending?.returnTab : undefined);
      const destLevel = Number(levelParam || (purchaseStatus ? storedPending?.returnLevel : 0) || 0);

      if (destTab === 'game') {
        targetTab = 'game';
        if (destLevel > 0) targetLevel = destLevel;
        setShowPandaOverlay(false);
      } else if (destTab === 'sanctuary') {
        targetTab = 'sanctuary';
        setShowPandaOverlay(false);
      }
    }

    setSelectedLevel(targetLevel);
    setActiveTab(targetTab);
    setMounted(true);

    // 1. Initialize Firebase Anonymous Auth & Sync
    initFirebaseAnonymousAuth().then(async (uid) => {
      const cloudData = await loadStateFromFirebase(uid);
      if (cloudData) {
        const merged = { ...loadGameState(), ...cloudData };
        saveGameState(merged);
        setGameState(merged);
      }
    });

    // 2. Handle return from Stripe Checkout
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const purchaseStatus = params.get('purchase');
      const itemId = params.get('itemId');
      const petIdParam = params.get('petId');
      const coinsParam = Number(params.get('coins') || 0);

      if (purchaseStatus === 'success') {
        const item = COIN_SHOP_ITEMS.find((i) => i.id === itemId);
        const coinsToAdd = coinsParam || item?.coinsAmount || item?.rewards?.coins || 0;

        const updated = { ...loadGameState() };
        if (coinsToAdd > 0) {
          updated.coins += coinsToAdd;
        }

        // Check if pet adoption
        let isPetAdoption = false;
        let adoptedPetName = '';
        if (itemId?.startsWith('pet_adopt_') || petIdParam) {
          const petIdToAdopt = petIdParam || (itemId ? itemId.replace('pet_adopt_', '') : '');
          if (petIdToAdopt) {
            isPetAdoption = true;
            if (!updated.boughtPetIds) updated.boughtPetIds = [];
            if (!updated.boughtPetIds.includes(petIdToAdopt)) {
              updated.boughtPetIds.push(petIdToAdopt);
            }
            const foundPet = updated.rescuedPets.find((p) => p.id === petIdToAdopt);
            if (foundPet) {
              foundPet.happiness = 100;
              adoptedPetName = foundPet.name;
            }
            setActiveTab('sanctuary');
            setSanctuaryTab('mypets');
          }
        }

        // Check if accessory purchase
        let isAccessoryPurchase = false;
        let accessoryName = '';
        if (itemId?.startsWith('accessory_')) {
          const accId = itemId.replace('accessory_', '');
          if (accId) {
            if (!updated.unlockedAccessories.includes(accId)) {
              updated.unlockedAccessories.push(accId);
            }
            isAccessoryPurchase = true;
            // Get nice name and emoji from ACCESSORY_CATALOG
            const matchedAcc = ACCESSORY_CATALOG.find((a) => a.id === accId || `accessory_${a.id}` === itemId);
            accessoryName = matchedAcc ? `${matchedAcc.emoji} ${matchedAcc.name}` : accId;

            // Auto-equip on target pet if available
            const targetPetId = petIdParam || storedPending?.returnPetId;
            if (targetPetId) {
              const targetPet = updated.rescuedPets.find((p) => p.id === targetPetId);
              if (targetPet) {
                if (!Array.isArray(targetPet.accessories)) {
                  targetPet.accessories = targetPet.accessory && targetPet.accessory !== 'none' ? [targetPet.accessory] : [];
                }
                if (!targetPet.accessories.includes(accId)) {
                  targetPet.accessories.push(accId);
                }
                targetPet.accessory = accId;
              }
            }

            setActiveTab('sanctuary');
          }
        }

        if (item) {
          if (item.rewards.hammers) updated.boosters.hammers += item.rewards.hammers;
          if (item.rewards.rockets) updated.boosters.rockets += item.rewards.rockets;
          if (item.rewards.colorBombs) updated.boosters.colorBombs += item.rewards.colorBombs;
          if (item.rewards.shuffles) updated.boosters.shuffles += item.rewards.shuffles;
          if (item.rewards.accessory && !updated.unlockedAccessories.includes(item.rewards.accessory)) {
            updated.unlockedAccessories.push(item.rewards.accessory);
          }
          if (item.rewards.isVip) {
            updated.isVip = true;
            updated.highestLevelUnlocked = 100;
          }
        }

        saveGameState(updated);
        const uid = getLocalUserId();
        syncStateWithFirebase(uid, updated);
        setGameState(updated);

        // Celebration
        soundFX.playVictory();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        if (isPetAdoption) {
          setPaymentToast(`Adoption Successful! 💖 ${adoptedPetName || 'Your new pet'} is now in "My Pets"! 🎉`);
        } else if (isAccessoryPurchase) {
          setPaymentToast(`Accessory Unlocked! ${accessoryName} is now available in the Sanctuary! ✨`);
        } else {
          setPaymentToast(`Payment Successful! +${coinsToAdd} 🪙 Coins Added to Inventory! 🎉`);
        }
        setTimeout(() => setPaymentToast(null), 5000);

        // Clear query parameters from URL cleanly
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (purchaseStatus === 'canceled') {
        setPaymentToast('Payment was canceled. No charges were made.');
        setTimeout(() => setPaymentToast(null), 4000);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Multi-tab sync: When a player finishes Stripe Checkout in a popup/new tab,
      // the GameJolt/embedded window receives the 'storage' event and automatically updates coins/pets!
      const handleStorage = (event: StorageEvent) => {
        if (event.key === 'pet_rescue_game_state' && event.newValue) {
          try {
            const fresh = JSON.parse(event.newValue);
            setGameState(fresh);
          } catch {}
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => {
        window.removeEventListener('storage', handleStorage);
      };
    }
  }, []);

  // Countdown timer when showPandaOverlay is active
  useEffect(() => {
    if (!showPandaOverlay) return;

    if (autoCountdown <= 0) {
      setShowPandaOverlay(false);
      setActiveTab('game');
      return;
    }

    const timer = setTimeout(() => {
      setAutoCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoCountdown, showPandaOverlay]);

  const refreshGameState = () => {
    setGameState(loadGameState());
  };

  const handleSelectLevel = (level: number) => {
    // Players cannot go back to previous levels/stages
    if (gameState.highestLevelUnlocked && level < gameState.highestLevelUnlocked) {
      return;
    }
    setShowPandaOverlay(false);
    const updated = setCurrentLevel(level);
    setGameState(updated);
    setSelectedLevel(level);
    setActiveTab('game');
  };

  const currentWorld = getWorldForLevel(selectedLevel);
  const worldBgImages: Record<number, string> = {
    1: '/images/jungle_bg.jpg',
    2: '/images/candy_bg.jpg',
    3: '/images/beach_bg.jpg',
    4: '/images/snow_bg.jpg',
    5: '/images/cosmic_bg.jpg',
    6: '/images/volcano_bg.jpg',
    7: '/images/fairy_bg.jpg',
    8: '/images/desert_bg.jpg',
    9: '/images/sky_bg.jpg',
    10: '/images/palace_bg.jpg',
  };
  const activeBg = worldBgImages[currentWorld.id] || '/images/jungle_bg.jpg';

  const worldDecor: Record<number, { leftTop: string[]; leftBottom: string[]; rightTop: string[]; rightBottom: string[] }> = {
    1: { leftTop: ['🌿', '🌺', '🍍', '🏮'], leftBottom: ['🦜', '🌴', '🌸'], rightTop: ['🌿', '🍌', '🌺', '🏮'], rightBottom: ['🐒', '🌴', '🪷'] },
    2: { leftTop: ['🍬', '🍭', '🧁', '✨'], leftBottom: ['🍩', '🍨', '🍧'], rightTop: ['🍬', '🍩', '🍡', '✨'], rightBottom: ['🧁', '🍪', '🍰'] },
    3: { leftTop: ['🏖️', '🌊', '🐚', '🌴'], leftBottom: ['🦀', '🌴', '🦩'], rightTop: ['🏖️', '🌴', '⛵', '🐚'], rightBottom: ['🐬', '🏝️', '🐠'] },
    4: { leftTop: ['❄️', '⛄', '🏔️', '✨'], leftBottom: ['🧊', '🌲', '🎿'], rightTop: ['❄️', '🏔️', '🧊', '✨'], rightBottom: ['🐧', '🌲', '❄️'] },
    5: { leftTop: ['🌌', '🪐', '🚀', '✨'], leftBottom: ['🛸', '🌠', '💫'], rightTop: ['🌌', '🌠', '🪐', '✨'], rightBottom: ['👾', '🌙', '⭐'] },
    6: { leftTop: ['🌋', '💥', '☄️', '🔥'], leftBottom: ['🪵', '🔥', '🪨'], rightTop: ['🌋', '🔥', '☄️', '💥'], rightBottom: ['🦎', '🔥', '🪵'] },
    7: { leftTop: ['🏰', '🍄', '🧚', '✨'], leftBottom: ['🪷', '🌲', '💫'], rightTop: ['🏰', '🧚', '🍄', '✨'], rightBottom: ['🦄', '🌲', '🔮'] },
    8: { leftTop: ['🏜️', '🐫', '🌴', '✨'], leftBottom: ['🏛️', '🌴', '🏺'], rightTop: ['🏜️', '🌴', '🐫', '✨'], rightBottom: ['🦅', '🏜️', '🏺'] },
    9: { leftTop: ['☁️', '🎈', '🌈', '✨'], leftBottom: ['⛵', '☁️', '🕊️'], rightTop: ['☁️', '🌈', '🎈', '✨'], rightBottom: ['🦅', '☁️', '🌤️'] },
    10: { leftTop: ['👑', '💎', '🏰', '✨'], leftBottom: ['🎀', '⚜️', '🏛️'], rightTop: ['👑', '🏰', '💎', '✨'], rightBottom: ['🦄', '🏆', '👑'] },
  };

  const decor = worldDecor[currentWorld.id] || worldDecor[1];

  return (
    <main
      className="min-h-screen flex flex-col justify-between relative overflow-x-hidden transition-all duration-700"
      style={{
        backgroundImage: `url('${activeBg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Left Side World Decor (Desktop Only) */}
      <div className="hidden xl:flex flex-col items-start justify-between fixed top-20 left-4 bottom-8 w-44 pointer-events-none z-10">
        {/* Top Hanging Items */}
        <div className="flex flex-col items-start animate-swing-vine space-y-1">
          {decor.leftTop.map((emoji, i) => (
            <span key={i} className="text-4xl filter drop-shadow-lg">{emoji}</span>
          ))}
        </div>

        {/* Bottom Mascot & Plants */}
        <div className="flex flex-col items-start space-y-1 animate-float-slow">
          {decor.leftBottom.map((emoji, i) => (
            <span key={i} className="text-4xl filter drop-shadow-xl">{emoji}</span>
          ))}
        </div>
      </div>

      {/* Right Side World Decor (Desktop Only) */}
      <div className="hidden xl:flex flex-col items-end justify-between fixed top-20 right-4 bottom-8 w-44 pointer-events-none z-10">
        {/* Top Hanging Items */}
        <div className="flex flex-col items-end animate-swing-vine space-y-1">
          {decor.rightTop.map((emoji, i) => (
            <span key={i} className="text-4xl filter drop-shadow-lg">{emoji}</span>
          ))}
        </div>

        {/* Bottom Mascot & Plants */}
        <div className="flex flex-col items-end space-y-1 animate-float-slow">
          {decor.rightBottom.map((emoji, i) => (
            <span key={i} className="text-4xl filter drop-shadow-xl">{emoji}</span>
          ))}
        </div>
      </div>

      {/* Payment Notification Toast */}
      {paymentToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce-slow max-w-md w-[90%] pointer-events-none">
          <div className="bg-slate-900/95 border-2 border-emerald-400 p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl text-white">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-xs sm:text-sm font-black text-emerald-200">
              {paymentToast}
            </div>
          </div>
        </div>
      )}

      <Navbar
        gameState={gameState}
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStateUpdate={refreshGameState}
      />

      <div className="flex-1 flex flex-col items-center justify-center py-4 relative z-20">
        {activeTab === 'map' ? (
          <LevelMap
            onSelectLevel={handleSelectLevel}
            onOpenSanctuary={() => setActiveTab('sanctuary')}
            onOpenShop={() => setIsShopOpen(true)}
          />
        ) : activeTab === 'sanctuary' ? (
          <PetSanctuary
            onBackToMap={() => setActiveTab('map')}
            onStateUpdate={refreshGameState}
            initialTab={sanctuaryTab}
          />
        ) : (
          <DynamicGameCanvas
            levelNumber={selectedLevel}
            onBackToMap={() => setActiveTab('map')}
            onStateUpdate={refreshGameState}
            onNextLevel={(nextLvl) => handleSelectLevel(nextLvl)}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-300 font-semibold border-t border-white/10 relative z-20 backdrop-blur-md bg-emerald-950/30">
        <div>Pawtora Web Game • Powered by Next.js &amp; Phaser 3 Engine</div>
        <div className="mt-1 text-slate-400 text-[11px]">
          Published &amp; Operated by <strong className="text-slate-200 font-bold">ALARTE EDMER DE JESUS</strong> (Alarte Edmer D) • <a href="/privacy" className="hover:underline text-pink-400">Privacy Policy</a> • <a href="/data-deletion" className="hover:underline text-pink-400">Data Deletion</a>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          © 2026 ALARTE EDMER DE JESUS. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onStateUpdate={refreshGameState}
        returnTab={activeTab}
        returnLevel={selectedLevel}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onStateUpdate={refreshGameState}
      />

      {/* Big Dancing Panda Auto-Launch Overlay (Shows on Map for 2-3s then auto-routes to Game Board) */}
      {showPandaOverlay && activeTab === 'map' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          {/* Spinning Sunburst Rays */}
          <div className="absolute w-[600px] h-[600px] opacity-25 animate-rays-spin pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-300">
              {Array.from({ length: 12 }).map((_, i) => (
                <path
                  key={i}
                  d="M50 50 L45 0 L55 0 Z"
                  transform={`rotate(${i * 30} 50 50)`}
                />
              ))}
            </svg>
          </div>

          <div className="relative glass-modal max-w-md w-full p-6 rounded-3xl flex flex-col items-center text-center shadow-2xl border-4 border-amber-400/40 bg-slate-900/90 z-10">
            {/* Close Button */}
            <button
              onClick={() => {
                soundFX.playClick();
                setShowPandaOverlay(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition z-20"
            >
              ✕
            </button>
            {/* Big Dancing Panda Mascot Character */}
            <div className="relative w-40 h-40 mb-3 flex items-center justify-center">
              {/* Golden Crown */}
              <span className="absolute -top-4 text-3xl z-20 animate-bounce">👑</span>

              {/* Main Panda Character Group */}
              <div className="w-36 h-36 relative animate-panda-dance">
                {/* Left Ear */}
                <div className="absolute top-1 left-2 w-10 h-10 bg-slate-900 rounded-full animate-ear-wiggle border-2 border-slate-700 flex items-center justify-center">
                  <div className="w-5 h-5 bg-slate-800 rounded-full" />
                </div>
                {/* Right Ear */}
                <div className="absolute top-1 right-2 w-10 h-10 bg-slate-900 rounded-full animate-ear-wiggle border-2 border-slate-700 flex items-center justify-center">
                  <div className="w-5 h-5 bg-slate-800 rounded-full" />
                </div>

                {/* Main White Head */}
                <div className="absolute top-6 left-3 w-30 h-28 bg-white rounded-full border-4 border-slate-900 shadow-xl flex flex-col items-center justify-center">
                  {/* Eye Patches */}
                  <div className="flex justify-between w-20 mt-1">
                    <div className="w-7 h-9 bg-slate-900 rounded-full -rotate-12 flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-slate-900 rounded-full" />
                      </div>
                    </div>
                    <div className="w-7 h-9 bg-slate-900 rounded-full rotate-12 flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-slate-900 rounded-full" />
                      </div>
                    </div>
                  </div>
                  {/* Cheeks */}
                  <div className="flex justify-between w-24 -mt-2">
                    <div className="w-4 h-2.5 bg-rose-400/70 rounded-full" />
                    <div className="w-4 h-2.5 bg-rose-400/70 rounded-full" />
                  </div>
                  {/* Nose & Mouth */}
                  <div className="w-3 h-2 bg-slate-900 rounded-full -mt-1" />
                  <div className="w-4 h-3 bg-rose-500 rounded-b-full border border-slate-900 mt-0.5" />
                </div>

                {/* Left Waving Paw */}
                <div className="absolute top-16 -left-3 w-9 h-9 bg-slate-900 rounded-full border-2 border-slate-800 animate-paw-left-dance flex items-center justify-center text-white text-xs font-bold">
                  🐾
                </div>
                {/* Right Waving Paw with Bamboo */}
                <div className="absolute top-16 -right-3 w-9 h-9 bg-slate-900 rounded-full border-2 border-slate-800 animate-paw-right-dance flex items-center justify-center text-emerald-400 text-sm font-bold">
                  🎋
                </div>

                {/* Tapping Feet */}
                <div className="absolute bottom-0 left-6 w-9 h-7 bg-slate-900 rounded-t-full border-2 border-slate-800 animate-feet-left" />
                <div className="absolute bottom-0 right-6 w-9 h-7 bg-slate-900 rounded-t-full border-2 border-slate-800 animate-feet-right" />
              </div>

              {/* Floating Musical Notes & Sparkles */}
              <span className="absolute -top-2 left-1 text-2xl animate-bounce">🎵</span>
              <span className="absolute -top-1 right-2 text-2xl animate-pulse">🎶</span>
              <span className="absolute bottom-2 left-0 text-xl animate-bounce">💖</span>
              <span className="absolute bottom-4 right-1 text-2xl animate-pulse">🎉</span>
            </div>

            {/* Title & Level Info */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-300 font-extrabold text-xs mb-2">
              <Sparkles className="w-4 h-4" /> PAKU THE DANCING PANDA
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mb-1">
              Starting Level {selectedLevel}! 🐼💃
            </h2>
            <p className="text-slate-300 text-xs mb-4">
              Paku is getting your puzzle board ready... Starting in{' '}
              <span className="text-amber-400 font-black text-sm">{autoCountdown}s</span>!
            </p>

            {/* Animated Glowing Loading Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 mb-5 border border-slate-700 overflow-hidden p-0.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-linear shadow-lg"
                style={{ width: `${((3 - autoCountdown) / 3) * 100}%` }}
              />
            </div>

            {/* Immediate Play Button */}
            <button
              onClick={() => {
                soundFX.playClick();
                setShowPandaOverlay(false);
                setActiveTab('game');
              }}
              className="btn-primary w-full py-3 px-6 text-sm font-black flex items-center justify-center gap-2 shadow-xl"
            >
              <span>Play Level {selectedLevel} Now</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function INITIAL_LOAD(): GameState {
  if (typeof window === 'undefined') {
    return {
      coins: 250,
      lives: 5,
      maxLives: 5,
      currentLevel: 1,
      highestLevelUnlocked: 1,
      levelStars: { 1: 0 },
      levelScores: { 1: 0 },
      boosters: { hammers: 2, rockets: 2, colorBombs: 1, shuffles: 3 },
      rescuedPets: [],
      boughtPetIds: [],
      unlockedAccessories: ['none', 'bow'],
      isVip: false,
      soundEnabled: true,
      bgmEnabled: true,
    };
  }
  return loadGameState();
}
