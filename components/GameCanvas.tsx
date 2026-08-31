'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, RefreshCw, Trophy, ArrowLeft, ArrowRight, Zap, Hammer, Rocket, Shuffle, Flame } from 'lucide-react';
import { createPetRescueGame } from '../game/PetRescueGame';
import { LEVEL_CONFIGS, LevelConfig, getPetForLevel } from '../game/levelConfigs';
import { MainGameScene } from '../game/scenes/MainGameScene';
import { loadGameState, saveGameState, completeLevel, addCoins, addBoosters, GameState } from '../lib/gameState';
import { soundFX } from '../game/audio/SoundFX';

export interface StageMascot {
  emoji: string;
  name: string;
  speech: string;
  bgColor: string;
}

export const STAGE_MASCOTS: Record<number, StageMascot> = {
  1: { emoji: '🐶', name: 'Buddy the Puppy', speech: 'Woof! Amazing rescue!', bgColor: 'from-amber-400 via-orange-400 to-rose-500' },
  2: { emoji: '🐱', name: 'Luna the Kitten', speech: 'Purrfect victory!', bgColor: 'from-pink-400 via-rose-400 to-purple-500' },
  3: { emoji: '🐰', name: 'Clover the Bunny', speech: 'Hooray! You saved us!', bgColor: 'from-emerald-400 via-teal-400 to-cyan-500' },
  4: { emoji: '🐦', name: 'Sky the Bird', speech: 'Tweet! High flier!', bgColor: 'from-sky-400 via-blue-500 to-indigo-600' },
  5: { emoji: '🐼', name: 'Paku the Panda', speech: 'Bamboo-tastic job!', bgColor: 'from-emerald-300 via-teal-500 to-slate-700' },
  6: { emoji: '🐻', name: 'Barnaby Bear', speech: 'Pawsome victory!', bgColor: 'from-amber-500 via-orange-500 to-yellow-600' },
  7: { emoji: '🦁', name: 'Leo the Lion', speech: 'Roaring success!', bgColor: 'from-yellow-400 via-amber-500 to-orange-600' },
  8: { emoji: '🐨', name: 'Koko Koala', speech: 'Un-bear-ably awesome!', bgColor: 'from-teal-400 via-cyan-500 to-blue-600' },
  9: { emoji: '🐧', name: 'Pippin Penguin', speech: 'Coolest rescuer ever!', bgColor: 'from-blue-400 via-indigo-500 to-purple-600' },
  10: { emoji: '🦄', name: 'Starlight Unicorn', speech: 'Legendary Pet Hero!', bgColor: 'from-purple-400 via-pink-500 to-amber-300' },
};

interface GameCanvasProps {
  levelNumber: number;
  onBackToMap: () => void;
  onStateUpdate: () => void;
  onNextLevel: (nextLevelNumber: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  levelNumber,
  onBackToMap,
  onStateUpdate,
  onNextLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const levelConfig: LevelConfig = LEVEL_CONFIGS[levelNumber] || LEVEL_CONFIGS[1];
  const mascotKey = ((levelNumber - 1) % 10) + 1;
  const mascot: StageMascot = STAGE_MASCOTS[mascotKey] || STAGE_MASCOTS[1];

  const [gameState, setGameState] = useState<GameState>(loadGameState());
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(levelConfig.moves);
  const [petsRescued, setPetsRescued] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [selectedBooster, setSelectedBooster] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeBuyBooster, setActiveBuyBooster] = useState<'hammer' | 'rocket' | 'colorBomb' | 'nuclear' | null>(null);
  const [buyBoosterNotice, setBuyBoosterNotice] = useState<string | null>(null);

  const BOOSTER_BUY_CONFIGS: Record<
    'hammer' | 'rocket' | 'colorBomb' | 'nuclear',
    {
      name: 'hammer' | 'rocket' | 'colorBomb' | 'nuclear';
      key: keyof GameState['boosters'];
      title: string;
      description: string;
      price: number;
      icon: React.ReactNode;
      emoji: string;
      bgGradient: string;
      buttonGradient: string;
      noticeSuccess: string;
      buyBtnLabel: string;
      useBtnLabel: string;
    }
  > = {
    hammer: {
      name: 'hammer',
      key: 'hammers',
      title: 'Hammer Booster',
      description: 'Smash any single block or obstacle on the board instantly!',
      price: 30,
      icon: <Hammer className="w-10 h-10 text-white drop-shadow" />,
      emoji: '🔨',
      bgGradient: 'from-amber-400 via-orange-500 to-rose-500',
      buttonGradient: 'from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500',
      noticeSuccess: 'Hammer Purchased! 🔨 (+1)',
      buyBtnLabel: 'Buy 1 Hammer',
      useBtnLabel: 'Use Hammer Now! 🔨',
    },
    rocket: {
      name: 'rocket',
      key: 'rockets',
      title: 'Rocket Booster',
      description: 'Launch a rocket to blast through an entire row and column!',
      price: 200,
      icon: <Rocket className="w-10 h-10 text-white drop-shadow" />,
      emoji: '🚀',
      bgGradient: 'from-indigo-400 via-purple-500 to-pink-500',
      buttonGradient: 'from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-500',
      noticeSuccess: 'Rocket Purchased! 🚀 (+1)',
      buyBtnLabel: 'Buy 1 Rocket',
      useBtnLabel: 'Use Rocket Now! 🚀',
    },
    colorBomb: {
      name: 'colorBomb',
      key: 'colorBombs',
      title: 'Bomb Booster',
      description: 'Explode and remove all blocks of the selected color!',
      price: 150,
      icon: <Zap className="w-10 h-10 text-white drop-shadow" />,
      emoji: '💣',
      bgGradient: 'from-purple-400 via-fuchsia-500 to-pink-500',
      buttonGradient: 'from-purple-500 via-fuchsia-500 to-purple-600 hover:from-purple-400 hover:to-fuchsia-500',
      noticeSuccess: 'Bomb Purchased! ⚡ (+1)',
      buyBtnLabel: 'Buy 1 Bomb',
      useBtnLabel: 'Use Bomb Now! ⚡',
    },
    nuclear: {
      name: 'nuclear',
      key: 'shuffles',
      title: 'Nuclear Explosion',
      description: 'Unleash a Giant Panda to crush a huge surrounding area!',
      price: 300,
      icon: <span className="text-4xl drop-shadow">🐼</span>,
      emoji: '🐼',
      bgGradient: 'from-emerald-400 via-teal-500 to-slate-700',
      buttonGradient: 'from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500',
      noticeSuccess: 'Nuclear Panda Purchased! 🐼 (+1)',
      buyBtnLabel: 'Buy 1 Nuclear Panda',
      useBtnLabel: 'Use Nuclear Now! 🐼',
    },
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance if any
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    setIsVictory(false);
    setIsGameOver(false);
    setScore(0);
    setMovesLeft(levelConfig.moves);
    setPetsRescued(0);
    setSelectedBooster(null);
    setCountdown(null);

    const handleBoosterUsed = (bType: string) => {
      const updatedState = { ...loadGameState() };
      const map: Record<string, keyof GameState['boosters']> = {
        hammer: 'hammers',
        rocket: 'rockets',
        colorBomb: 'colorBombs',
        nuclear: 'shuffles',
        shuffle: 'shuffles',
      };
      const key = map[bType];
      if (key && updatedState.boosters[key] > 0) {
        updatedState.boosters[key]--;
        saveGameState(updatedState);
        setGameState(updatedState);
        onStateUpdate();

        // Continuous Booster Mode: If there are remaining boosters, keep it selected!
        if (updatedState.boosters[key] > 0) {
          const boosterNameMap: Record<string, 'hammer' | 'rocket' | 'colorBomb' | 'nuclear'> = {
            hammer: 'hammer',
            rocket: 'rocket',
            colorBomb: 'colorBomb',
            nuclear: 'nuclear',
            shuffle: 'nuclear',
          };
          const bName = boosterNameMap[bType] || (bType as 'hammer' | 'rocket' | 'colorBomb' | 'nuclear');
          setSelectedBooster(bName);
          getScene()?.setActiveBooster(bName);
        } else {
          // De-select when count hits 0 and show the buy modal
          setSelectedBooster(null);
          getScene()?.setActiveBooster(null);
          const buyNameMap: Record<string, 'hammer' | 'rocket' | 'colorBomb' | 'nuclear'> = {
            hammer: 'hammer',
            rocket: 'rocket',
            colorBomb: 'colorBomb',
            nuclear: 'nuclear',
            shuffle: 'nuclear',
          };
          const buyName = buyNameMap[bType];
          if (buyName) {
            setActiveBuyBooster(buyName);
          }
        }
      } else {
        setSelectedBooster(null);
        getScene()?.setActiveBooster(null);
      }
    };

    const game = createPetRescueGame(
      'phaser-game-container',
      levelConfig,
      (data) => {
        setScore(data.score);
        setMovesLeft(data.movesLeft);
        setPetsRescued(data.petsRescued);
        setIsGameOver(data.isGameOver);
        setIsVictory(data.isVictory);

        if (data.isVictory) {
          // Trigger Candy Crush style multi-burst confetti celebration!
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
          setTimeout(() => confetti({ particleCount: 110, spread: 100, origin: { y: 0.5 } }), 300);
          setTimeout(() => confetti({ particleCount: 130, spread: 110, origin: { y: 0.4 } }), 600);

          // Calculate 1 to 3 stars based on moves left
          const stars = data.movesLeft >= 6 ? 3 : data.movesLeft >= 2 ? 2 : 1;
          const updated = completeLevel(levelConfig.level, data.score, stars, levelConfig.petType);
          setGameState(updated);
          onStateUpdate();

          // Start 5s auto-advance countdown if next level exists
          if (levelConfig.level < 100) {
            setCountdown(5);
          }
        }
      },
      handleBoosterUsed
    );

    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [levelNumber]);

  // Auto-advance timer logic
  useEffect(() => {
    if (countdown === null || !isVictory) return;

    if (countdown <= 0) {
      if (levelNumber < 100) {
        onNextLevel(levelNumber + 1);
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isVictory, levelNumber, onNextLevel]);

  // Clear active booster whenever buy booster modal opens
  useEffect(() => {
    if (activeBuyBooster) {
      setSelectedBooster(null);
      getScene()?.setActiveBooster(null);
    }
  }, [activeBuyBooster]);

  const handleBoosterClick = (
    boosterType: 'hammers' | 'rockets' | 'colorBombs' | 'shuffles',
    name: 'hammer' | 'rocket' | 'colorBomb' | 'nuclear'
  ) => {
    soundFX.playClick();
    if (gameState.boosters[boosterType] <= 0) {
      setSelectedBooster(null);
      getScene()?.setActiveBooster(null);
      setActiveBuyBooster(name);
      return;
    }

    if (selectedBooster === name) {
      setSelectedBooster(null);
      getScene()?.setActiveBooster(null);
    } else {
      setSelectedBooster(name);
      getScene()?.setActiveBooster(name);
    }
  };

  const handleBuyBooster = (bName: 'hammer' | 'rocket' | 'colorBomb' | 'nuclear') => {
    const config = BOOSTER_BUY_CONFIGS[bName];
    if (!config) return;

    if (gameState.coins < config.price) {
      soundFX.playClick();
      setBuyBoosterNotice(`Not enough coins! Need ${config.price} 🪙 to buy ${config.title}.`);
      setTimeout(() => setBuyBoosterNotice(null), 3000);
      return;
    }

    soundFX.playChaChing();
    const updatedState = { ...loadGameState() };
    updatedState.coins -= config.price;
    updatedState.boosters[config.key] = (updatedState.boosters[config.key] || 0) + 1;
    saveGameState(updatedState);
    setGameState(updatedState);
    onStateUpdate();

    setBuyBoosterNotice(config.noticeSuccess);
    setTimeout(() => setBuyBoosterNotice(null), 2500);
  };

  const getScene = (): MainGameScene | null => {
    if (gameRef.current) {
      return gameRef.current.scene.getScene('MainGameScene') as MainGameScene;
    }
    return null;
  };

  const handleRestart = () => {
    soundFX.playClick();
    setIsGameOver(false);
    setIsVictory(false);
    setScore(0);
    setMovesLeft(levelConfig.moves);
    setPetsRescued(0);
    setSelectedBooster(null);
    setCountdown(null);

    const scene = getScene();
    if (scene) {
      scene.scene.restart({ levelConfig, onGameStateChange: scene['onGameStateChange'] });
    }
  };

  const starsEarned = movesLeft >= 6 ? 3 : movesLeft >= 2 ? 2 : 1;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-6">
      {/* Top Game Bar */}
      <div className="w-full flex items-center justify-between bg-slate-950/90 backdrop-blur-xl p-4 rounded-3xl mb-6 border-2 border-slate-700/80 shadow-2xl">
        <button
          onClick={() => {
            soundFX.playClick();
            onBackToMap();
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 rounded-full font-black transition text-sm text-white border border-slate-600 shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" /> <span className="tracking-wide">Map</span>
        </button>

        <div className="flex items-center gap-6 sm:gap-8">
          {/* Moves */}
          <div className="text-center">
            <span className="text-[11px] uppercase tracking-widest text-amber-200/90 font-black block mb-0.5 drop-shadow">MOVES</span>
            <div className="text-3xl font-black text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{movesLeft}</div>
          </div>

          {/* Level & Coins */}
          <div className="text-center border-x-2 border-slate-700/80 px-6 sm:px-8">
            <span className="text-[11px] uppercase tracking-widest text-amber-200/90 font-black block mb-0.5 drop-shadow">LEVEL {levelNumber}</span>
            <div className="text-3xl font-black text-yellow-300 flex items-center justify-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <span>{score}</span>
              <span className="text-2xl drop-shadow">🪙</span>
              <span className="text-xs font-black text-amber-300 uppercase tracking-wide">COINS</span>
            </div>
          </div>

          {/* Rescue Goal */}
          <div className="text-center">
            <span className="text-[11px] uppercase tracking-widest text-emerald-200/90 font-black block mb-0.5 drop-shadow">RESCUE GOAL</span>
            <div className="text-3xl font-black text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center gap-1.5">
              <span>{petsRescued} / {levelConfig.petsToRescue}</span>
              <span className="text-2xl drop-shadow">{getPetForLevel(levelNumber).emoji}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="p-3 bg-slate-800/90 hover:bg-slate-700/90 rounded-full transition text-white border border-slate-600 shadow-md active:scale-95"
          title="Restart Level"
        >
          <RefreshCw className="w-5 h-5 text-amber-400" />
        </button>
      </div>

      {/* Main Canvas & Booster Side Deck */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
        {/* Phaser Container */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700/50 bg-slate-900/90">
          <div id="phaser-game-container" ref={containerRef} className="w-[540px] h-[720px] max-w-full" />

          {/* Victory Modal Overlay (Candy Crush Style with BIG Cheering Panda Mascot) */}
          {isVictory && (
            <div className="absolute inset-0 glass-modal flex flex-col items-center justify-between p-5 text-center z-20 overflow-hidden">
              {/* Spinning Celebration Light Rays Backdrop */}
              <div className="absolute w-[500px] h-[500px] -top-10 opacity-20 pointer-events-none animate-rays-spin">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-300">
                  {[...Array(12)].map((_, i) => (
                    <polygon key={i} points="50,50 42,0 58,0" transform={`rotate(${i * 30} 50 50)`} />
                  ))}
                </svg>
              </div>

              {/* Glowing Background Radial Halo */}
              <div className="absolute w-80 h-80 bg-amber-400/25 rounded-full blur-3xl animate-pulse pointer-events-none" />

              {/* Candy Crush Banner Title */}
              <div className="animate-candy-swoop relative z-10 mt-1">
                <span className="text-xs uppercase font-black tracking-widest text-amber-300 bg-amber-500/30 border border-amber-400/50 px-4 py-1 rounded-full shadow-lg">
                  SWEET VICTORY! 🐾
                </span>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-amber-200 tracking-tight drop-shadow-lg mt-1">
                  LEVEL {levelNumber} COMPLETED!
                </h2>
              </div>

              {/* CENTERPIECE: Candy Crush Pink Badge + Golden Stars + BIG CHEERING PANDA MASCOT */}
              <div className="relative flex flex-col items-center justify-center my-1 z-10 w-full">
                {/* Floating Speech Bubble */}
                <div className="relative bg-white text-slate-950 font-black text-xs px-4 py-1.5 rounded-2xl shadow-2xl mb-1 flex items-center gap-1.5 animate-bounce-slow border-2 border-amber-400">
                  <span className="text-base">🐼</span>
                  <span>"HOORAY! YOU SAVED ALL THE PETS! 🐾"</span>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-8 border-t-amber-400" />
                </div>

                {/* Candy Crush Magenta Level Badge with Golden Star Ring */}
                <div className="relative flex items-center justify-center mb-2 animate-candy-swoop">
                  {/* Pink Badge Circle */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-b from-pink-500 via-rose-600 to-pink-700 ring-4 ring-amber-400 shadow-2xl flex items-center justify-center border-2 border-white/80">
                    <span className="text-2xl font-black italic text-white drop-shadow">{levelNumber}</span>
                  </div>

                  {/* 3 Popping Golden Stars around Badge */}
                  <div className="absolute -top-3 -left-4 animate-star-pop-1">
                    <Sparkles className="w-7 h-7 text-amber-300 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
                  </div>
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 animate-star-pop-2">
                    <Sparkles className="w-9 h-9 text-amber-300 fill-amber-400 drop-shadow-[0_0_14px_rgba(251,191,36,0.9)]" />
                  </div>
                  <div className="absolute -top-3 -right-4 animate-star-pop-3">
                    <Sparkles className="w-7 h-7 text-amber-300 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
                  </div>
                </div>

                {/* THE BIG HIGH-ENERGY DANCING PANDA MASCOT (Candy Crush Style!) */}
                <div className="relative w-48 h-48 animate-panda-dance flex items-center justify-center">
                  <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-2xl">
                    {/* Floating Bamboo Stick */}
                    <g transform="translate(148, 75) rotate(15)">
                      <rect x="0" y="0" width="8" height="75" rx="3" fill="#22c55e" />
                      <line x1="0" y1="20" x2="8" y2="20" stroke="#15803d" strokeWidth="2" />
                      <line x1="0" y1="45" x2="8" y2="45" stroke="#15803d" strokeWidth="2" />
                      <path d="M 8 15 C 18 10, 22 2, 22 2 C 22 2, 16 18, 8 20 Z" fill="#4ade80" />
                    </g>

                    {/* Dancing Left Paw (Pumping Up & Down to Beat) */}
                    <g className="animate-paw-left-dance" transform="translate(20, 85)">
                      <ellipse cx="15" cy="20" rx="15" ry="24" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
                      <ellipse cx="15" cy="25" rx="9" ry="11" fill="#f43f5e" opacity="0.8" />
                      <circle cx="7" cy="10" r="3" fill="#ffffff" />
                      <circle cx="15" cy="7" r="3" fill="#ffffff" />
                      <circle cx="23" cy="10" r="3" fill="#ffffff" />
                    </g>

                    {/* Dancing Right Paw (Pumping Up & Down to Beat) */}
                    <g className="animate-paw-right-dance" transform="translate(150, 85)">
                      <ellipse cx="15" cy="20" rx="15" ry="24" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
                      <ellipse cx="15" cy="25" rx="9" ry="11" fill="#f43f5e" opacity="0.8" />
                      <circle cx="7" cy="10" r="3" fill="#ffffff" />
                      <circle cx="15" cy="7" r="3" fill="#ffffff" />
                      <circle cx="23" cy="10" r="3" fill="#ffffff" />
                    </g>

                    {/* Tapping Left Dancing Foot */}
                    <g className="animate-feet-left" transform="translate(62, 165)">
                      <ellipse cx="12" cy="15" rx="14" ry="10" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                      <ellipse cx="12" cy="15" rx="7" ry="4" fill="#f43f5e" opacity="0.7" />
                    </g>

                    {/* Tapping Right Dancing Foot */}
                    <g className="animate-feet-right" transform="translate(112, 165)">
                      <ellipse cx="12" cy="15" rx="14" ry="10" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                      <ellipse cx="12" cy="15" rx="7" ry="4" fill="#f43f5e" opacity="0.7" />
                    </g>

                    {/* Wiggling Left Ear */}
                    <g className="animate-ear-wiggle" transform="translate(42, 38)">
                      <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="0" cy="0" r="12" fill="#334155" />
                    </g>

                    {/* Wiggling Right Ear */}
                    <g className="animate-ear-wiggle" transform="translate(158, 38)">
                      <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="0" cy="0" r="12" fill="#334155" />
                    </g>

                    {/* Golden Crown on Head */}
                    <g transform="translate(82, 10)">
                      <path d="M 0 25 L 9 5 L 18 20 L 27 5 L 36 25 Z" fill="#ffd700" stroke="#b45309" strokeWidth="2" />
                      <circle cx="9" cy="5" r="3" fill="#ef4444" />
                      <circle cx="18" cy="20" r="2.5" fill="#3b82f6" />
                      <circle cx="27" cy="5" r="3" fill="#ef4444" />
                    </g>

                    {/* Main White Head & Chubby Body */}
                    <ellipse cx="100" cy="148" rx="45" ry="32" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2.5" />
                    <ellipse cx="100" cy="95" rx="65" ry="55" fill="#ffffff" stroke="#e2e8f0" strokeWidth="3" />
                    <ellipse cx="100" cy="120" rx="42" ry="25" fill="#f8fafc" />

                    {/* Black Eye Patches */}
                    <ellipse cx="72" cy="85" rx="19" ry="24" fill="#0f172a" transform="rotate(-15 72 85)" />
                    <ellipse cx="128" cy="85" rx="19" ry="24" fill="#0f172a" transform="rotate(15 128 85)" />

                    {/* Sparkling 3D Eyes */}
                    <circle cx="74" cy="85" r="9" fill="#ffffff" />
                    <circle cx="126" cy="85" r="9" fill="#ffffff" />
                    <circle cx="75" cy="86" r="6" fill="#0f172a" />
                    <circle cx="125" cy="86" r="6" fill="#0f172a" />
                    <circle cx="72" cy="82" r="3" fill="#ffffff" />
                    <circle cx="122" cy="82" r="3" fill="#ffffff" />
                    <circle cx="77" cy="89" r="1.5" fill="#ffffff" />
                    <circle cx="127" cy="89" r="1.5" fill="#ffffff" />

                    {/* Cute Black Nose */}
                    <ellipse cx="100" cy="102" rx="9" ry="6.5" fill="#0f172a" />
                    <ellipse cx="98" cy="100" rx="3" ry="1.8" fill="#ffffff" opacity="0.8" />

                    {/* Big Cheering Smile */}
                    <path d="M 84 112 Q 100 132 116 112" fill="#dc2626" stroke="#0f172a" strokeWidth="2.5" />
                    <path d="M 90 120 Q 100 128 110 120" fill="#f43f5e" />

                    {/* Rosy Blush Cheeks */}
                    <ellipse cx="50" cy="102" rx="11" ry="7" fill="#fb7185" opacity="0.65" />
                    <ellipse cx="150" cy="102" rx="11" ry="7" fill="#fb7185" opacity="0.65" />
                  </svg>

                  {/* Dancing Musical Notes & Sparkles popping around Panda */}
                  <span className="absolute -top-3 left-0 text-2xl animate-music-note-1">🎵</span>
                  <span className="absolute -top-1 right-2 text-2xl animate-music-note-2">🎶</span>
                  <span className="absolute top-8 -right-3 text-xl animate-bounce">💖</span>
                  <span className="absolute bottom-2 left-0 text-xl animate-pulse">🐾</span>
                  <span className="absolute bottom-4 right-1 text-2xl animate-bounce">🎉</span>
                </div>

                <span className="text-[12px] font-black text-amber-300 tracking-wider uppercase mt-1 drop-shadow">
                  👑 BAMBOO PANDA MASCOT 🐾
                </span>
              </div>

              {/* Score & Rewards Panel */}
              <div className="bg-slate-900/85 rounded-2xl p-2.5 w-full max-w-xs text-slate-300 font-semibold space-y-0.5 border border-slate-700/60 shadow-inner z-10">
                <div className="flex justify-between text-xs">
                  <span>Level Coins Acquired:</span>
                  <span className="text-amber-300 font-black flex items-center gap-1">{score} 🪙</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Bonus Reward:</span>
                  <span className="text-amber-400 font-black">+{50 + starsEarned * 25} 🪙</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs z-10 mb-1">
                {levelNumber < 100 && (
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      onNextLevel(levelNumber + 1);
                    }}
                    className="w-full btn-next-level py-3 px-5 text-sm flex items-center justify-center gap-2 shadow-2xl"
                  >
                    <span>Next Level {levelNumber + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <div className="flex gap-2 w-full">
                  <button
                    onClick={onBackToMap}
                    className="flex-1 btn-secondary py-2.5 px-3 text-xs font-bold"
                  >
                    Map
                  </button>
                  <button
                    onClick={handleRestart}
                    className="flex-1 btn-primary py-2.5 px-3 text-xs font-bold"
                  >
                    Replay
                  </button>
                </div>
              </div>

              {levelNumber < 10 && countdown !== null && (
                <span className="text-[10px] font-bold text-amber-300/90 animate-pulse z-10">
                  Starting Level {levelNumber + 1} automatically in {countdown}s...
                </span>
              )}
            </div>
          )}

          {/* Game Over Modal Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 glass-modal flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
              <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-4 ring-8 ring-rose-500/10">
                <Flame className="w-10 h-10 text-rose-500" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Out of Moves!</h2>
              <p className="text-slate-300 text-sm mb-6 max-w-xs">
                Don't give up! Use boosters or try a fresh puzzle to save the pets.
              </p>

              <div className="flex gap-3">
                <button onClick={onBackToMap} className="btn-secondary px-6 py-3 text-sm">
                  Map
                </button>
                <button onClick={handleRestart} className="btn-primary px-6 py-3 text-sm">
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Boosters Side Toolbar */}
        <div className="flex md:flex-col gap-4 bg-slate-950/85 backdrop-blur-2xl p-4 rounded-3xl border-2 border-slate-700/80 shadow-2xl">
          <div className="hidden md:block text-xs font-black text-amber-300 uppercase tracking-widest text-center mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            Boosters
          </div>

          {/* Hammer */}
          <button
            onClick={() => handleBoosterClick('hammers', 'hammer')}
            className={`relative group p-4 rounded-2xl flex flex-col items-center justify-center transition-all ${
              selectedBooster === 'hammer'
                ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white ring-4 ring-rose-400/60 shadow-xl scale-105'
                : 'bg-slate-900/90 hover:bg-slate-800/90 text-white border border-slate-700/80 shadow-md'
            }`}
          >
            <Hammer className="w-6 h-6 mb-1 text-white group-hover:scale-110 transition drop-shadow" />
            <span className="text-[11px] font-black uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              Hammer
            </span>
            <span className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-full shadow-lg border-2 border-slate-950 drop-shadow">
              {gameState.boosters.hammers}
            </span>
          </button>

          {/* Rocket */}
          <button
            onClick={() => handleBoosterClick('rockets', 'rocket')}
            className={`relative group p-4 rounded-2xl flex flex-col items-center justify-center transition-all ${
              selectedBooster === 'rocket'
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white ring-4 ring-indigo-400/60 shadow-xl scale-105'
                : 'bg-slate-900/90 hover:bg-slate-800/90 text-white border border-slate-700/80 shadow-md'
            }`}
          >
            <Rocket className="w-6 h-6 mb-1 text-white group-hover:scale-110 transition drop-shadow" />
            <span className="text-[11px] font-black uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              Rocket
            </span>
            <span className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-full shadow-lg border-2 border-slate-950 drop-shadow">
              {gameState.boosters.rockets}
            </span>
          </button>

          {/* Color Bomb */}
          <button
            onClick={() => handleBoosterClick('colorBombs', 'colorBomb')}
            className={`relative group p-4 rounded-2xl flex flex-col items-center justify-center transition-all ${
              selectedBooster === 'colorBomb'
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white ring-4 ring-purple-400/60 shadow-xl scale-105'
                : 'bg-slate-900/90 hover:bg-slate-800/90 text-white border border-slate-700/80 shadow-md'
            }`}
          >
            <Zap className="w-6 h-6 mb-1 text-white group-hover:scale-110 transition drop-shadow" />
            <span className="text-[11px] font-black uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              Bomb
            </span>
            <span className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-full shadow-lg border-2 border-slate-950 drop-shadow">
              {gameState.boosters.colorBombs}
            </span>
          </button>

          {/* Nuclear Explosion Panda Booster */}
          <button
            onClick={() => handleBoosterClick('shuffles', 'nuclear')}
            className={`relative group p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
              selectedBooster === 'nuclear'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-400/60 shadow-xl scale-105 animate-pulse'
                : 'bg-slate-900/90 hover:bg-slate-800/90 text-white border border-slate-700/80 shadow-md'
            }`}
            title="Nuclear Explosion: Transform tile into a Big Panda to crush surrounding area!"
          >
            <span className="text-2xl mb-0.5 group-hover:scale-125 transition drop-shadow">🐼</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-yellow-300 leading-tight text-center drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)]">
              NUCLEAR<br />EXPLOSION
            </span>
            <span className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-full shadow-lg border-2 border-slate-950 drop-shadow">
              {gameState.boosters.shuffles}
            </span>
          </button>
        </div>
      </div>

      {/* Dynamic Buy Booster Modal (Hammer, Rocket, Bomb, Nuclear) */}
      {activeBuyBooster && (
        (() => {
          const config = BOOSTER_BUY_CONFIGS[activeBuyBooster];
          const count = gameState.boosters[config.key];

          return (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
            >
              <div
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 border-2 border-amber-500/40 shadow-2xl flex flex-col items-center text-center overflow-hidden"
              >
                {/* Background Glow */}
                <div className="absolute w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none -top-10" />

                {/* Close Button */}
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setActiveBuyBooster(null);
                    setBuyBoosterNotice(null);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
                >
                  ✕
                </button>

                {/* Booster Icon with Notification Badge */}
                <div className="relative mb-3 group">
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${config.bgGradient} rounded-3xl flex items-center justify-center shadow-lg border-2 border-amber-300/50`}
                  >
                    {config.icon}
                  </div>
                  {/* Notification Badge showing remaining booster count */}
                  <span className="absolute -top-2 -right-2 px-3 py-1 bg-amber-500 text-white text-xs font-black rounded-full shadow-lg border border-amber-200">
                    {count}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-1 tracking-wide">{config.title}</h3>
                <p className="text-xs text-slate-300 mb-4 max-w-xs">{config.description}</p>

                {/* Info Cards: Remaining Count & Total Accumulated Money/Coins */}
                <div className="w-full grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                      Available
                    </span>
                    <span className="text-xl font-black text-amber-400 flex items-center gap-1">
                      <span>{count}</span> {config.emoji}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                      Total Coins
                    </span>
                    <span className="text-xl font-black text-yellow-300 flex items-center gap-1">
                      <span>{gameState.coins}</span> 🪙
                    </span>
                  </div>
                </div>

                {/* Notice Message */}
                {buyBoosterNotice && (
                  <div className="mb-4 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    {buyBoosterNotice}
                  </div>
                )}

                {/* Buy Action Button */}
                <button
                  onClick={() => handleBuyBooster(activeBuyBooster)}
                  className={`w-full py-3.5 px-6 bg-gradient-to-r ${config.buttonGradient} text-white font-black text-sm rounded-2xl shadow-lg border border-amber-300/40 active:scale-95 transition flex items-center justify-center gap-2`}
                >
                  <span>{config.buyBtnLabel}</span>
                  <span className="bg-slate-950/40 px-2.5 py-1 rounded-full text-xs text-yellow-300 border border-amber-300/30 flex items-center gap-1">
                    {config.price} 🪙
                  </span>
                </button>

                {/* Use Booster immediately button if count > 0 */}
                {count > 0 && (
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      const boosterToUse = activeBuyBooster;
                      setActiveBuyBooster(null);
                      setBuyBoosterNotice(null);
                      setSelectedBooster(boosterToUse);
                      getScene()?.setActiveBooster(boosterToUse);
                    }}
                    className="w-full mt-2.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition"
                  >
                    {config.useBtnLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};
