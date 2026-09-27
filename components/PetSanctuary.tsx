'use client';

import React, { useState } from 'react';
import { Heart, Utensils, Sparkles, ArrowLeft, Check, ShoppingBag, Lock } from 'lucide-react';
import { loadGameState, saveGameState, interactWithPet, PetData, GameState, isPetBought, buyPet } from '../lib/gameState';
import { soundFX } from '../game/audio/SoundFX';
import { PetAvatar, getPetBreed } from './PetAvatar';
import { PetFullBody } from './PetFullBody';
import { ACCESSORY_CATALOG, AccessoryItem } from './ShopModal';

interface PetSanctuaryProps {
  onBackToMap: () => void;
  onStateUpdate: () => void;
  initialTab?: 'yard' | 'mypets';
}

export const PetSanctuary: React.FC<PetSanctuaryProps> = ({
  onBackToMap,
  onStateUpdate,
  initialTab = 'yard',
}) => {
  const [gameState, setGameState] = useState<GameState>(loadGameState());
  const [activeTab, setActiveTab] = useState<'yard' | 'mypets'>(initialTab);
  const [selectedPetId, setSelectedPetId] = useState<string>(gameState.rescuedPets[0]?.id || '');
  const [activeHeartPetId, setActiveHeartPetId] = useState<string | null>(null);
  const [isAdopting, setIsAdopting] = useState(false);

  const selectedPet = gameState.rescuedPets.find((p) => p.id === selectedPetId) || gameState.rescuedPets[0];
  const selectedBreed = selectedPet ? getPetBreed(selectedPet) : null;
  const isSelectedBought = selectedPet ? isPetBought(gameState, selectedPet.id) : false;

  const boughtPets = gameState.rescuedPets.filter((p) => isPetBought(gameState, p.id));
  const displayedPets = activeTab === 'mypets' ? boughtPets : gameState.rescuedPets;

  const handlePetAction = (action: 'pet' | 'feed' | 'accessory' | 'wear_all' | 'unequip_all', acc?: string) => {
    if (!selectedPet) return;
    soundFX.playClick();

    if (action === 'pet') {
      soundFX.playRescueChime();
      setActiveHeartPetId(selectedPet.id);
      setTimeout(() => setActiveHeartPetId(null), 1000);
    } else if (action === 'feed') {
      soundFX.playPop();
    } else if (action === 'wear_all') {
      soundFX.playVictory();
    }

    const updated = interactWithPet(selectedPet.id, action, acc);
    setGameState(updated);
    onStateUpdate();
  };

  const handleBuyPet = async (pet: PetData) => {
    if (!pet) return;
    try {
      setIsAdopting(true);
      soundFX.playClick();

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'pet_rescue_stripe_pending',
          JSON.stringify({ returnTab: 'sanctuary', returnPetId: pet.id })
        );
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: `pet_adopt_${pet.id}`,
          petId: pet.id,
          title: `Adopt ${pet.name} (${selectedBreed?.name || 'Pet'})`,
          description: `Permanent VIP Adoption into My Pets Lounge`,
          priceInCents: 299,
          returnTab: 'sanctuary',
          userId: 'guest',
        }),
      });

      const data = await res.json();

      if (data.mode === 'sandbox') {
        soundFX.playVictory();
        const updated = buyPet(pet.id);
        setGameState(updated);
        onStateUpdate();
        setActiveTab('mypets');
        setIsAdopting(false);
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout error. Please try again.');
        setIsAdopting(false);
      }
    } catch (e) {
      console.error('Adoption error:', e);
      setIsAdopting(false);
    }
  };

  const handleBuyAccessory = async (acc: AccessoryItem) => {
    if (!selectedPet) return;
    try {
      setIsAdopting(true);
      soundFX.playClick();

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'pet_rescue_stripe_pending',
          JSON.stringify({ returnTab: 'sanctuary', returnPetId: selectedPet.id })
        );
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: `accessory_${acc.id}`,
          title: `${acc.emoji} ${acc.name} Accessory`,
          description: acc.description,
          priceInCents: acc.priceInCents,
          returnTab: 'sanctuary',
          userId: 'guest',
        }),
      });

      const data = await res.json();

      if (data.mode === 'sandbox') {
        soundFX.playVictory();
        const updated = loadGameState();
        if (!updated.unlockedAccessories.includes(acc.id)) {
          updated.unlockedAccessories.push(acc.id);
        }
        if (selectedPet) {
          const target = updated.rescuedPets.find((p) => p.id === selectedPet.id);
          if (target) {
            if (!Array.isArray(target.accessories)) {
              target.accessories = target.accessory && target.accessory !== 'none' ? [target.accessory] : [];
            }
            if (!target.accessories.includes(acc.id)) {
              target.accessories.push(acc.id);
            }
            target.accessory = acc.id;
          }
        }
        saveGameState(updated);
        setGameState({ ...updated });
        onStateUpdate();
        setIsAdopting(false);
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout error. Please try again.');
        setIsAdopting(false);
      }
    } catch (e) {
      console.error('Accessory purchase error:', e);
      setIsAdopting(false);
    }
  };

  const getRarityStyle = (rarity: AccessoryItem['rarity'], isUnlocked: boolean, isEquipped: boolean) => {
    if (isEquipped) return 'bg-gradient-to-br from-amber-400/40 to-amber-500/30 ring-2 ring-amber-400 border-amber-300/80 shadow-amber-400/20 shadow-lg';
    if (!isUnlocked) return 'bg-slate-950/70 border-slate-800/80 opacity-80';
    switch (rarity) {
      case 'free':    return 'bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-slate-600/50 hover:border-slate-400/60';
      case 'common':  return 'bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-600/40 hover:border-blue-400/50';
      case 'rare':    return 'bg-gradient-to-br from-purple-900/40 to-indigo-900/30 border-purple-500/40 hover:border-purple-400/60';
      case 'legendary': return 'bg-gradient-to-br from-amber-900/40 to-yellow-900/30 border-amber-500/50 hover:border-amber-400/70';
      default:        return 'bg-slate-900/40 border-slate-700';
    }
  };

  const getRarityLabel = (rarity: AccessoryItem['rarity']) => {
    switch (rarity) {
      case 'free':      return { label: 'FREE',        style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'common':    return { label: 'COMMON',      style: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'rare':      return { label: 'RARE ✦',      style: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'legendary': return { label: '✦ LEGEND',   style: 'bg-amber-400/20 text-amber-300 border-amber-400/40' };
      default:          return { label: '',             style: '' };
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between glass-panel p-4 rounded-3xl mb-6 shadow-xl border border-white/20">
        <button
          onClick={() => { soundFX.playClick(); onBackToMap(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full font-bold transition text-sm text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Level Map
        </button>

        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <span>🐾 Pet Sanctuary Lounge</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-emerald-400/30">
            {gameState.rescuedPets.length} Rescued
          </span>
        </h1>

        <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 px-4 py-1.5 rounded-full text-amber-300 font-black text-sm">
          <span>🪙 {gameState.coins} Coins</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 bg-slate-950/70 p-1.5 rounded-2xl border border-white/10 shadow-lg">
          <button
            onClick={() => { soundFX.playClick(); setActiveTab('yard'); }}
            className={`px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition ${
              activeTab === 'yard'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🏡 Sanctuary Yard</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 text-current font-extrabold">
              {gameState.rescuedPets.length}
            </span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('mypets');
              if (boughtPets.length > 0 && !isPetBought(gameState, selectedPetId)) {
                setSelectedPetId(boughtPets[0].id);
              }
            }}
            className={`px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition ${
              activeTab === 'mypets'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 scale-102'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>💖 My Pets</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-extrabold">
              {boughtPets.length}
            </span>
          </button>
        </div>

        <div className="hidden sm:block text-xs font-bold text-slate-400">
          {activeTab === 'mypets'
            ? '⭐ VIP Lounge: Your Adopted Forever Pets'
            : 'Click any pet to view their animated profile & adopt!'}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Pet Yard / My Pets Grid */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[460px] border border-white/20 bg-gradient-to-b from-indigo-900/40 via-purple-900/30 to-emerald-950/40">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-white/10 px-3 py-1 rounded-full text-slate-300">
              {activeTab === 'mypets' ? '💖 My Pets Lounge' : '🏡 Sanctuary Yard'}
            </span>
            {activeTab === 'mypets' && (
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                VIP Adopted Room
              </span>
            )}
          </div>

          {activeTab === 'mypets' && boughtPets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10 my-auto">
              <div className="text-6xl mb-4 animate-bounce">🏡💖</div>
              <h3 className="text-xl font-black text-white mb-2">No Adopted Pets in "My Pets" Yet!</h3>
              <p className="text-sm text-slate-300 max-w-md mb-6 font-medium">
                Choose any pet in the Sanctuary Yard and click the <strong className="text-amber-300">"BUY ME"</strong> button to adopt them!
              </p>
              <button
                onClick={() => { soundFX.playClick(); setActiveTab('yard'); }}
                className="btn-gold px-6 py-2.5 text-sm flex items-center gap-2 font-black shadow-lg"
              >
                <span>Browse Sanctuary Yard ➔</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-10 px-4 relative z-10">
              {displayedPets.map((pet, idx) => {
                const isSelected = pet.id === selectedPetId;
                const hasHearts = activeHeartPetId === pet.id;
                const breed = getPetBreed(pet, idx);
                const isBought = isPetBought(gameState, pet.id);

                return (
                  <div
                    key={pet.id}
                    onClick={() => { soundFX.playClick(); setSelectedPetId(pet.id); }}
                    className={`relative group flex flex-col items-center p-4 rounded-3xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/20 ring-4 ring-pink-400/80 scale-105 shadow-2xl'
                        : 'bg-white/5 hover:bg-white/10 hover:scale-100'
                    }`}
                  >
                    {hasHearts && (
                      <div className="absolute -top-6 animate-bounce text-pink-400 text-2xl font-black">❤️❤️❤️</div>
                    )}
                    {isBought && (
                      <div className="absolute -top-2 -left-2 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] rounded-full shadow-md flex items-center gap-1 border border-amber-300">
                        <Sparkles className="w-3 h-3 fill-current" />
                        <span>MY PET</span>
                      </div>
                    )}
                    {(() => {
                      const accList = (pet.accessories && pet.accessories.length > 0)
                        ? pet.accessories
                        : (pet.accessory && pet.accessory !== 'none' ? [pet.accessory] : []);
                      if (accList.length === 0) return null;
                      return (
                        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-amber-400 text-slate-900 font-extrabold text-[10px] rounded-full shadow flex items-center gap-0.5 max-w-[80px] overflow-hidden">
                          {accList.map((id) => ACCESSORY_CATALOG.find((a) => a.id === id)?.emoji).filter(Boolean).slice(0, 3).join('')}
                          {accList.length > 3 && <span className="text-[9px]">+{accList.length - 3}</span>}
                        </div>
                      );
                    })()}
                    <div className="mb-2 group-hover:scale-110 transition duration-300 animate-float flex items-center justify-center">
                      <PetAvatar pet={pet} size={84} index={idx} />
                    </div>
                    <div className="text-sm font-black text-white">{pet.name}</div>
                    <div className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 mt-0.5">
                      {breed.name}
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden border border-slate-700">
                      <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${pet.happiness}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 mt-1">Happiness: {pet.happiness}%</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center text-xs text-slate-400 font-medium">
            {activeTab === 'mypets'
              ? 'These are your adopted pets! Give them love and dress them up! 💖'
              : 'Click on any pet to select them and show love! ❤️'}
          </div>
        </div>

        {/* Right Col: Pet Detail + Wardrobe */}
        {selectedPet ? (
          <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4 border border-white/20 overflow-y-auto max-h-[80vh]">
            {/* Pet Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{selectedPet.name}</h2>
                {isSelectedBought && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shadow">
                    ⭐ OWNED
                  </span>
                )}
              </div>
              <span className="text-xs uppercase font-extrabold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                Rescued Lvl {selectedPet.rescuedAtLevel}
              </span>
            </div>

            {/* Animated Full Body */}
            <div className="flex flex-col items-center pt-4 px-4 pb-5 bg-slate-900/70 rounded-2xl border border-slate-800 relative text-center">
              {/* Decorative Glows (clipped inside inner container so they don't bleed) */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
              </div>
              <PetFullBody pet={selectedPet} initialPose="walking" size={190} showControls={true} />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black mt-2 relative z-10">
                🐾 {selectedBreed?.name || 'Pet'}
              </div>
              <p className="text-[11px] text-slate-300 font-medium mt-1 max-w-xs relative z-10">{selectedBreed?.description}</p>

              {/* BUY ME / Owned */}
              {!isSelectedBought ? (
                <div className="w-full mt-3 pt-3 border-t border-white/10 flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleBuyPet(selectedPet)}
                    disabled={isAdopting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-pink-500/30 flex items-center justify-center gap-2 transform active:scale-95 transition disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
                    <span>{isAdopting ? 'Connecting to Stripe...' : 'BUY ME 💖 ($2.99)'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-semibold">Adopt forever into "My Pets" • Stripe Checkout</span>
                </div>
              ) : (
                <div className="w-full mt-3 pt-3 border-t border-white/10">
                  <div className="p-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 rounded-2xl flex items-center justify-between text-xs font-black text-emerald-300 shadow">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                      <span>Living in "My Pets"</span>
                    </span>
                    {activeTab !== 'mypets' && (
                      <button
                        onClick={() => setActiveTab('mypets')}
                        className="px-2.5 py-1 bg-emerald-400 text-slate-950 font-black rounded-xl hover:bg-emerald-300 transition text-[11px]"
                      >
                        View in My Pets ➔
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Care Buttons — only for owned pets */}
            {isSelectedBought && (
              <div className="space-y-2">
                <button
                  onClick={() => handlePetAction('pet')}
                  className="w-full btn-primary py-2.5 px-4 flex items-center justify-center gap-2 text-xs shadow-md"
                >
                  <Heart className="w-4 h-4 fill-white" /> Pet {selectedPet.name} (+10 Happy)
                </button>
                <button
                  onClick={() => handlePetAction('feed')}
                  disabled={gameState.coins < 10}
                  className="w-full btn-gold py-2.5 px-4 flex items-center justify-center gap-2 text-xs shadow-md disabled:opacity-50"
                >
                  <Utensils className="w-4 h-4" /> Feed Treat (10 🪙 → +25 Happy)
                </button>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Happiness</span>
                    <span className="text-emerald-400">{selectedPet.happiness}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full transition-all duration-500"
                      style={{ width: `${selectedPet.happiness}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ════ ACCESSORY WARDROBE ════ */}
            {isSelectedBought ? (
              <div className="space-y-2">
                {(() => {
                  const equippedAccs = selectedPet
                    ? (selectedPet.accessories && selectedPet.accessories.length > 0
                        ? selectedPet.accessories
                        : (selectedPet.accessory && selectedPet.accessory !== 'none' ? [selectedPet.accessory] : []))
                    : [];

                  return (
                    <>
                      {/* Header with quick Wear All / Clear buttons */}
                      <div className="flex items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <div>
                          <h3 className="text-xs font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                            Wardrobe
                          </h3>
                          <span className="text-[10px] text-amber-400 font-bold">
                            {equippedAccs.length === 0
                              ? 'No accessories equipped'
                              : `${equippedAccs.length} accessory${equippedAccs.length > 1 ? 'ies' : ''} wearing`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handlePetAction('wear_all')}
                            className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300 transition shadow active:scale-95 flex items-center gap-1"
                            title="Equip all unlocked accessories at once"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Wear All</span>
                          </button>
                          <button
                            onClick={() => handlePetAction('unequip_all')}
                            disabled={equippedAccs.length === 0}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700"
                            title="Unequip all accessories"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Grid */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {ACCESSORY_CATALOG.map((acc) => {
                          const isUnlocked = gameState.unlockedAccessories.includes(acc.id);
                          const isEquipped = acc.id === 'none'
                            ? equippedAccs.length === 0
                            : equippedAccs.includes(acc.id);
                          const rarityInfo = getRarityLabel(acc.rarity);

                          return (
                            <div
                              key={acc.id}
                              className={`relative rounded-xl border p-2 flex flex-col items-center gap-1 transition cursor-pointer select-none active:scale-95 ${getRarityStyle(acc.rarity, isUnlocked, isEquipped)}`}
                              onClick={() => {
                                if (acc.id === 'none') {
                                  handlePetAction('unequip_all');
                                } else if (isUnlocked) {
                                  handlePetAction('accessory', acc.id);
                                }
                              }}
                            >
                              {/* Equipped badge */}
                              {isEquipped && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow">
                                  <Check className="w-2.5 h-2.5 text-slate-900 stroke-[3]" />
                                </span>
                              )}
                              {/* Lock for paid & not bought */}
                              {!isUnlocked && !acc.isFree && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
                                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                                </span>
                              )}

                              {/* Emoji */}
                              <span className={`text-xl ${!isUnlocked && !acc.isFree ? 'opacity-40 grayscale' : ''}`}>
                                {acc.emoji}
                              </span>

                              {/* Name */}
                              <span className={`text-[10px] font-black text-center leading-tight ${isEquipped ? 'text-amber-300' : isUnlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                                {acc.name}
                              </span>

                              {/* Badge / Buy button */}
                              {acc.isFree ? (
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${rarityInfo.style}`}>
                                  FREE
                                </span>
                              ) : isUnlocked ? (
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${rarityInfo.style}`}>
                                  {rarityInfo.label}
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleBuyAccessory(acc); }}
                                  disabled={isAdopting}
                                  className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 hover:from-amber-300 hover:to-orange-300 transition active:scale-95 disabled:opacity-50 shadow-sm"
                                >
                                  {acc.price}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-[10px] text-slate-500 text-center font-medium">
                        Tap any accessory to toggle on/off • Stack them all together! ✨
                      </p>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 text-center flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-2">
                  <Heart className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white mb-1">Adopt to Unlock the Wardrobe!</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Click <strong className="text-pink-400">"BUY ME"</strong> above to adopt{' '}
                  <strong className="text-amber-300">{selectedPet.name}</strong> and unlock shirts, jackets, hats, shoes & more!
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 border-t border-white/10 text-center text-xs text-slate-400">
              {isSelectedBought
                ? '💳 Tap any price tag to buy via Stripe!'
                : 'Available for adoption via Stripe Checkout'}
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
