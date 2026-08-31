'use client';

import React, { useState } from 'react';
import { Play, Star, Lock, ShieldCheck, Sparkles, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { loadGameState } from '../lib/gameState';
import { LEVEL_CONFIGS, WORLD_THEMES } from '../game/levelConfigs';
import { soundFX } from '../game/audio/SoundFX';

interface LevelMapProps {
  onSelectLevel: (levelNumber: number) => void;
  onOpenSanctuary: () => void;
  onOpenShop: () => void;
}

export const LevelMap: React.FC<LevelMapProps> = ({ onSelectLevel, onOpenSanctuary, onOpenShop }) => {
  const state = loadGameState();
  const initialWorld = Math.min(10, Math.max(1, Math.ceil((state.highestLevelUnlocked || 1) / 10)));
  const [selectedWorld, setSelectedWorld] = useState<number>(initialWorld);

  const totalStars = Object.values(state.levelStars).reduce((acc, s) => acc + s, 0);
  const currentWorld = WORLD_THEMES[selectedWorld] || WORLD_THEMES[1];

  const startLvl = (selectedWorld - 1) * 10 + 1;
  const endLvl = selectedWorld * 10;

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-6">
      {/* Banner Card */}
      <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-2xl border border-white/20">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg text-center md:text-left mb-6 md:mb-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-300 font-extrabold text-xs mb-3">
            <Sparkles className="w-4 h-4" /> PET RESCUE 100 LEVELS ADVENTURE
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-2">
            Save Cute Pets <br /> & Build Your Sanctuary!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">
            100 Levels across 10 magical worlds! Match blocks, drop pets to safety, and collect rewards.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenSanctuary();
            }}
            className="btn-primary px-6 py-3 flex items-center justify-center gap-2 text-sm shadow-lg"
          >
            <Heart className="w-4 h-4 fill-white" /> Pet Sanctuary ({state.rescuedPets.length})
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenShop();
            }}
            className="btn-gold px-6 py-3 flex items-center justify-center gap-2 text-sm shadow-lg"
          >
            <Sparkles className="w-4 h-4" /> Shop & Boosters
          </button>
        </div>
      </div>

      {/* 10 World Selection Tabs Bar */}
      <div className="w-full mb-6 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {Object.values(WORLD_THEMES).map((w) => {
            const isWorldUnlocked = state.highestLevelUnlocked >= (w.id - 1) * 10 + 1;
            const isSelected = selectedWorld === w.id;

            return (
              <button
                key={w.id}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedWorld(w.id);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition shadow-md ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/40 scale-105'
                    : isWorldUnlocked
                    ? 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    : 'bg-slate-950/60 text-slate-500 border border-slate-900 opacity-60'
                }`}
              >
                <span className="text-base">{w.emoji}</span>
                <span>World {w.id}</span>
                {!isWorldUnlocked && <Lock className="w-3 h-3 text-slate-500 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active World Info Banner */}
      <div className={`w-full rounded-3xl p-5 mb-6 bg-gradient-to-r ${currentWorld.bgGradient} border-2 border-slate-700/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center gap-4 text-center sm:text-left">
          <span className="text-4xl sm:text-5xl drop-shadow-md">{currentWorld.emoji}</span>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black/40 text-amber-300 border border-amber-400/30">
                World {currentWorld.id}
              </span>
              <span className="text-xs font-bold text-slate-300">
                Levels {startLvl}–{endLvl}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              {currentWorld.name}
            </h2>
            <p className="text-slate-300 text-xs font-medium mt-0.5">
              {currentWorld.description}
            </p>
          </div>
        </div>

        {/* World Pagination Controls */}
        <div className="flex items-center gap-2">
          <button
            disabled={selectedWorld <= 1}
            onClick={() => {
              soundFX.playClick();
              setSelectedWorld((prev) => Math.max(1, prev - 1));
            }}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900/80 rounded-full transition text-white border border-slate-700 shadow-md"
            title="Previous World"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-black text-slate-200 px-3">
            {selectedWorld} / 10
          </span>
          <button
            disabled={selectedWorld >= 10}
            onClick={() => {
              soundFX.playClick();
              setSelectedWorld((prev) => Math.min(10, prev + 1));
            }}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900/80 rounded-full transition text-white border border-slate-700 shadow-md"
            title="Next World"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Map Stats */}
      <div className="flex items-center justify-between w-full mb-4 px-2">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <span>Level Select</span>
          <span className="text-xs bg-slate-900/90 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-amber-400/30">
            {state.highestLevelUnlocked} / 100 Unlocked
          </span>
        </h2>
        <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-400/30 px-4 py-1.5 rounded-full text-amber-300 font-black text-xs sm:text-sm shadow-md">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{totalStars} / 300 Stars</span>
        </div>
      </div>

      {/* Level Grid (10 Levels per World) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full mb-8">
        {Array.from({ length: 10 }).map((_, idx) => {
          const lvl = startLvl + idx;
          const config = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
          const isUnlocked = lvl <= state.highestLevelUnlocked;
          const stars = state.levelStars[lvl] || 0;
          const highScore = state.levelScores[lvl] || 0;

          const petEmoji =
            config.petType === 'puppy' ? '🐶' :
            config.petType === 'kitten' ? '🐱' :
            config.petType === 'bunny' ? '🐰' :
            config.petType === 'bird' ? '🐦' : '🦄';

          return (
            <div
              key={lvl}
              onClick={() => {
                if (isUnlocked) {
                  soundFX.playClick();
                  onSelectLevel(lvl);
                }
              }}
              className={`relative group rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                isUnlocked
                  ? 'bg-slate-900/85 hover:bg-slate-800/90 border-2 border-slate-700/80 hover:border-amber-400/80 hover:-translate-y-2 shadow-xl hover:shadow-2xl'
                  : 'bg-slate-950/70 border border-slate-900 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Level Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center font-black text-lg text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                  {lvl}
                </span>

                {isUnlocked ? (
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= stars ? 'text-amber-400 fill-amber-400 drop-shadow' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <Lock className="w-5 h-5 text-slate-500" />
                )}
              </div>

              {/* Level Info */}
              <div className="mb-4">
                <div className="text-xs font-black text-pink-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span>Rescue: {config.petsToRescue} {config.petType}s</span>
                  <span className="text-sm">{petEmoji}</span>
                </div>
                <div className="text-[11px] text-slate-300 font-bold">
                  {config.moves} Moves
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="text-[10px] text-slate-400 font-extrabold">
                  {highScore > 0 ? (
                    <span className="text-amber-300 flex items-center gap-1">Best: {highScore} 🪙</span>
                  ) : (
                    <span>Not Played</span>
                  )}
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow ${
                    isUnlocked
                      ? 'bg-amber-400 text-slate-950 group-hover:scale-110 shadow-amber-400/20'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
