'use client';

import React, { useState } from 'react';
import { Heart, Utensils, Sparkles, ArrowLeft, Crown, Glasses, Smile } from 'lucide-react';
import { loadGameState, interactWithPet, PetData, GameState } from '../lib/gameState';
import { soundFX } from '../game/audio/SoundFX';

interface PetSanctuaryProps {
  onBackToMap: () => void;
  onStateUpdate: () => void;
}

export const PetSanctuary: React.FC<PetSanctuaryProps> = ({ onBackToMap, onStateUpdate }) => {
  const [gameState, setGameState] = useState<GameState>(loadGameState());
  const [selectedPetId, setSelectedPetId] = useState<string>(gameState.rescuedPets[0]?.id || '');
  const [activeHeartPetId, setActiveHeartPetId] = useState<string | null>(null);

  const selectedPet = gameState.rescuedPets.find((p) => p.id === selectedPetId) || gameState.rescuedPets[0];

  const handlePetAction = (action: 'pet' | 'feed' | 'accessory', acc?: string) => {
    if (!selectedPet) return;
    soundFX.playClick();

    if (action === 'pet') {
      soundFX.playRescueChime();
      setActiveHeartPetId(selectedPet.id);
      setTimeout(() => setActiveHeartPetId(null), 1000);
    } else if (action === 'feed') {
      soundFX.playPop();
    }

    const updated = interactWithPet(selectedPet.id, action, acc);
    setGameState(updated);
    onStateUpdate();
  };

  const getPetEmoji = (type: PetData['type']) => {
    switch (type) {
      case 'puppy':
        return '🐶';
      case 'kitten':
        return '🐱';
      case 'bunny':
        return '🐰';
      case 'bird':
        return '🐦';
      case 'unicorn':
        return '🦄';
      default:
        return '🐾';
    }
  };

  const getAccessoryBadge = (acc: string) => {
    switch (acc) {
      case 'hat':
        return '🎩 Hat';
      case 'bow':
        return '🎀 Bow';
      case 'glasses':
        return '👓 Glasses';
      case 'crown':
        return '👑 Crown';
      default:
        return 'None';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between glass-panel p-4 rounded-3xl mb-6 shadow-xl">
        <button
          onClick={() => {
            soundFX.playClick();
            onBackToMap();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full font-bold transition text-sm text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Level Map
        </button>

        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <span>🐾 Pet Sanctuary Lounge</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-emerald-400/30">
            {gameState.rescuedPets.length} Saved
          </span>
        </h1>

        <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 px-4 py-1.5 rounded-full text-amber-300 font-black text-sm">
          <span>🪙 {gameState.coins} Coins</span>
        </div>
      </div>

      {/* Main Sanctuary Yard & Interaction Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Interactive Yard */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[440px] border border-white/20 bg-gradient-to-b from-indigo-900/40 via-purple-900/30 to-emerald-950/40">
          <div className="absolute top-4 left-4 z-10">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-white/10 px-3 py-1 rounded-full text-slate-300">
              Sanctuary Yard
            </span>
          </div>

          {/* Floating Pets in Yard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-12 px-4 relative z-10">
            {gameState.rescuedPets.map((pet) => {
              const isSelected = pet.id === selectedPetId;
              const hasHearts = activeHeartPetId === pet.id;

              return (
                <div
                  key={pet.id}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedPetId(pet.id);
                  }}
                  className={`relative group flex flex-col items-center p-4 rounded-3xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/20 ring-4 ring-pink-400/80 scale-105 shadow-2xl'
                      : 'bg-white/5 hover:bg-white/10 hover:scale-100'
                  }`}
                >
                  {/* Floating Heart Effect */}
                  {hasHearts && (
                    <div className="absolute -top-6 animate-bounce text-pink-400 text-2xl font-black">
                      ❤️❤️❤️
                    </div>
                  )}

                  {/* Accessory Badge */}
                  {pet.accessory !== 'none' && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-400 text-slate-900 font-extrabold text-[10px] rounded-full shadow">
                      {getAccessoryBadge(pet.accessory)}
                    </div>
                  )}

                  <div className="text-6xl mb-2 group-hover:scale-110 transition duration-300 animate-float">
                    {getPetEmoji(pet.type)}
                  </div>
                  <div className="text-sm font-black text-white">{pet.name}</div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden border border-slate-700">
                    <div
                      className="bg-emerald-400 h-full transition-all duration-500"
                      style={{ width: `${pet.happiness}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 mt-1">
                    Happiness: {pet.happiness}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-center text-xs text-slate-400 font-medium">
            Click on any pet to select them and show love! ❤️
          </div>
        </div>

        {/* Right Col: Pet Care & Dress Up Controls */}
        {selectedPet ? (
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-white/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>{getPetEmoji(selectedPet.type)}</span>
                  <span>{selectedPet.name}</span>
                </h2>
                <span className="text-xs uppercase font-extrabold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                  Rescued Lvl {selectedPet.rescuedAtLevel}
                </span>
              </div>

              {/* Happiness Bar */}
              <div className="mb-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Pet Happiness</span>
                  <span className="text-emerald-400">{selectedPet.happiness} / 100</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full transition-all duration-500"
                    style={{ width: `${selectedPet.happiness}%` }}
                  />
                </div>
              </div>

              {/* Care Actions */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handlePetAction('pet')}
                  className="w-full btn-primary py-3 px-4 flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <Heart className="w-4 h-4 fill-white" /> Pet {selectedPet.name} (+10 Happy)
                </button>
                <button
                  onClick={() => handlePetAction('feed')}
                  disabled={gameState.coins < 10}
                  className="w-full btn-gold py-3 px-4 flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-50"
                >
                  <Utensils className="w-4 h-4" /> Feed Treat (10 🪙 -&gt; +25 Happy)
                </button>
              </div>

              {/* Accessories Selection */}
              <div>
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-3">
                  Accessorize Pet
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['none', 'bow', 'hat', 'glasses', 'crown'].map((acc) => {
                    const isUnlocked = gameState.unlockedAccessories.includes(acc);
                    const isEquipped = selectedPet.accessory === acc;

                    return (
                      <button
                        key={acc}
                        disabled={!isUnlocked}
                        onClick={() => handlePetAction('accessory', acc)}
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          isEquipped
                            ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                            : isUnlocked
                            ? 'bg-white/10 hover:bg-white/20 text-slate-200'
                            : 'bg-slate-900/40 text-slate-600 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {getAccessoryBadge(acc)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
              Unlock new accessories in the Shop!
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center text-center text-slate-400">
            No pet selected.
          </div>
        )}
      </div>
    </div>
  );
};
