'use client';

import React from 'react';
import { X, Volume2, HelpCircle, RefreshCw, Shield, Sparkles } from 'lucide-react';
import { INITIAL_STATE, saveGameState } from '../lib/gameState';
import { soundFX } from '../game/audio/SoundFX';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStateUpdate: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onStateUpdate }) => {
  if (!isOpen) return null;

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all game progress and rescued pets?')) {
      saveGameState(INITIAL_STATE);
      soundFX.playClick();
      onStateUpdate();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-modal w-full max-w-md rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-white/20">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-pink-400" /> Settings & Help
          </h2>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 space-y-3">
          <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">How To Play</h3>
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <p>🧩 <strong>Match Blocks:</strong> Click clusters of 2 or more matching blocks to pop them.</p>
            <p>🐾 <strong>Rescue Pets:</strong> Drop puppies, kittens, and bunnies to the bottom rescue zone.</p>
            <p>⚡ <strong>Use Boosters:</strong> Use Hammers, Rockets, and Color Bombs to clear obstacles!</p>
            <p>❤️ <strong>Pet Lounge:</strong> Feed and dress up your saved pets in the Sanctuary!</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleResetData}
            className="w-full py-3 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" /> Reset All Save Data
          </button>
        </div>

        <div className="text-center text-[10px] text-slate-500 font-semibold border-t border-white/10 pt-4">
          Pawtora Web App Game • Built with Next.js & Phaser 3
        </div>
      </div>
    </div>
  );
};
