'use client';

import React, { useState } from 'react';
import { PetData } from '../lib/gameState';
import { getPetBreed } from './PetAvatar';

interface PetFullBodyProps {
  pet: PetData;
  initialPose?: 'walking' | 'sitting';
  size?: number;
  className?: string;
  showControls?: boolean;
}

export const PetFullBody: React.FC<PetFullBodyProps> = ({
  pet,
  initialPose = 'walking',
  size = 200,
  className = '',
  showControls = true,
}) => {
  const [pose, setPose] = useState<'walking' | 'sitting'>(initialPose);
  const breed = getPetBreed(pet);
  const activeAccessories: string[] = (pet as any).accessories && Array.isArray((pet as any).accessories) && (pet as any).accessories.length > 0
    ? (pet as any).accessories
    : (pet.accessory && pet.accessory !== 'none' ? [pet.accessory] : []);
  const hasAcc = (id: string) => activeAccessories.includes(id);

  const isBird = pet.type === 'bird';
  const isBunny = pet.type === 'bunny';
  const isUnicorn = pet.type === 'unicorn';
  const isDogOrCat = !isBird && !isBunny && !isUnicorn;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* SVG Container */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size * 0.95 }}
      >
        <svg
          viewBox="-8 -8 176 166"
          width={size}
          height={size * 0.95}
          className="w-full h-full overflow-visible select-none drop-shadow-xl"
        >
          <style>{`
            @keyframes walkBob {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-4px) rotate(1deg); }
            }
            @keyframes birdHop {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              40% { transform: translateY(-7px) rotate(-1deg); }
              60% { transform: translateY(-7px) rotate(1deg); }
              80% { transform: translateY(0px) rotate(0deg); }
            }
            @keyframes birdWingFlap {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-18deg) scaleY(1.05); }
            }
            @keyframes birdLeg1 {
              0%, 100% { transform: rotate(-15deg); }
              50% { transform: rotate(15deg); }
            }
            @keyframes birdLeg2 {
              0%, 100% { transform: rotate(15deg); }
              50% { transform: rotate(-15deg); }
            }
            @keyframes legWalkFront {
              0%, 100% { transform: rotate(-14deg); }
              50% { transform: rotate(14deg); }
            }
            @keyframes legWalkBack {
              0%, 100% { transform: rotate(14deg); }
              50% { transform: rotate(-14deg); }
            }
            @keyframes tailWag {
              0%, 100% { transform: rotate(-12deg); }
              50% { transform: rotate(16deg); }
            }
            @keyframes breatheSit {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02, 0.98); }
            }
            @keyframes earWiggle {
              0%, 100% { transform: rotate(0deg); }
              20% { transform: rotate(3deg); }
              40% { transform: rotate(-2deg); }
            }

            .anim-walk-body {
              animation: walkBob 0.6s ease-in-out infinite;
              transform-origin: 80px 120px;
            }
            .anim-bird-hop {
              animation: birdHop 0.7s ease-in-out infinite;
              transform-origin: 80px 120px;
            }
            .anim-bird-wing {
              animation: birdWingFlap 0.7s ease-in-out infinite;
              transform-origin: 70px 75px;
            }
            .anim-bird-leg-1 {
              animation: birdLeg1 0.7s ease-in-out infinite;
              transform-origin: 72px 105px;
            }
            .anim-bird-leg-2 {
              animation: birdLeg2 0.7s ease-in-out infinite;
              transform-origin: 88px 105px;
            }
            .anim-leg-1 {
              animation: legWalkFront 0.6s ease-in-out infinite;
              transform-origin: 65px 95px;
            }
            .anim-leg-2 {
              animation: legWalkBack 0.6s ease-in-out infinite;
              transform-origin: 95px 95px;
            }
            .anim-tail-wag {
              animation: tailWag 0.5s ease-in-out infinite;
              transform-origin: 115px 85px;
            }
            .anim-sit-breathe {
              animation: breatheSit 2.5s ease-in-out infinite;
              transform-origin: 80px 110px;
            }
            .anim-ear-wiggle {
              animation: earWiggle 3s ease-in-out infinite;
              transform-origin: 80px 45px;
            }
          `}</style>

          {/* Ground Soft Oval Shadow */}
          <ellipse
            cx="80"
            cy="138"
            rx={pose === 'walking' ? '46' : '40'}
            ry="7"
            fill="#0F172A"
            opacity="0.35"
          />

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* 1. BIRD FULL-BODY (MACAW, COCKATIEL, TOUCAN) — EXACTLY 2 LEGS! */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {isBird && (
            <g className={pose === 'walking' ? 'anim-bird-hop' : 'anim-sit-breathe'}>
              {/* Long Elegant Cascading Parrot Tail Feathers */}
              <g>
                <path
                  d="M92 90 C108 105, 118 128, 122 142 C114 138, 102 120, 90 98 Z"
                  fill="#1E3A8A"
                />
                <path
                  d="M88 92 C102 108, 110 128, 114 140 C106 134, 96 116, 86 98 Z"
                  fill="#2563EB"
                />
                <path
                  d="M84 94 C96 110, 102 124, 106 136 C98 128, 92 112, 82 98 Z"
                  fill="#DC2626"
                />
              </g>

              {/* 2 BIRD LEGS & PERCHING CLAWS (WALKING OR SITTING) */}
              {pose === 'walking' ? (
                <g>
                  {/* Leg 1 (Left Talon - 2 legs total) */}
                  <g className="anim-bird-leg-1">
                    <line x1="72" y1="105" x2="72" y2="132" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                    {/* Claws hidden under shoe */}
                    {!hasAcc('shoes') && (
                      <g>
                        <line x1="72" y1="132" x2="65" y2="135" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="72" y1="132" x2="74" y2="136" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="72" y1="132" x2="78" y2="134" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                      </g>
                    )}
                    {/* Shoe on left leg */}
                    {hasAcc('shoes') && (
                      <g>
                        <ellipse cx="72" cy="133" rx="8" ry="4.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
                        <ellipse cx="72" cy="136" rx="8" ry="2" fill="#FFFFFF" />
                      </g>
                    )}
                  </g>
                  {/* Leg 2 (Right Talon - 2 legs total) */}
                  <g className="anim-bird-leg-2">
                    <line x1="88" y1="105" x2="88" y2="132" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                    {/* Claws hidden under shoe */}
                    {!hasAcc('shoes') && (
                      <g>
                        <line x1="88" y1="132" x2="81" y2="135" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="88" y1="132" x2="90" y2="136" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="88" y1="132" x2="94" y2="134" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                      </g>
                    )}
                    {/* Shoe on right leg */}
                    {hasAcc('shoes') && (
                      <g>
                        <ellipse cx="88" cy="133" rx="8" ry="4.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
                        <ellipse cx="88" cy="136" rx="8" ry="2" fill="#FFFFFF" />
                      </g>
                    )}
                  </g>
                </g>
              ) : (
                /* Sitting / Perching Legs (2 claws gripping) */
                <g>
                  <line x1="74" y1="112" x2="74" y2="132" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                  {hasAcc('shoes') ? (
                    <g>
                      <ellipse cx="74" cy="133" rx="7" ry="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
                      <ellipse cx="74" cy="136" rx="7" ry="2" fill="#FFFFFF" />
                    </g>
                  ) : (
                    <ellipse cx="74" cy="133" rx="5" ry="3" fill="#1E293B" />
                  )}
                  <line x1="86" y1="112" x2="86" y2="132" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                  {hasAcc('shoes') ? (
                    <g>
                      <ellipse cx="86" cy="133" rx="7" ry="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
                      <ellipse cx="86" cy="136" rx="7" ry="2" fill="#FFFFFF" />
                    </g>
                  ) : (
                    <ellipse cx="86" cy="133" rx="5" ry="3" fill="#1E293B" />
                  )}
                </g>
              )}

              {/* Hero Cape behind bird body */}
              {hasAcc('cape') && (
                <path d="M72 70 C50 82, 42 110, 48 132 C62 130, 82 125, 88 108 Z" fill="#7C3AED" opacity="0.95" />
              )}

              {/* Plump Avian Body (Cobalt Blue with Sunny Golden Belly) */}
              <ellipse cx="80" cy="85" rx="24" ry="28" fill="#2563EB" />
              {/* Golden Chest & Belly */}
              <path
                d="M62 75 C60 98, 70 110, 84 110 C92 110, 96 98, 94 75 C86 70, 70 70, 62 75 Z"
                fill="#FBBF24"
              />

              {/* Bird Torso Clothing */}
              {hasAcc('tshirt') && (
                <g transform="translate(78, 86)">
                  <ellipse cx="0" cy="0" rx="18" ry="18" fill="#10B981" stroke="#059669" strokeWidth="0.8" />
                  <text x="0" y="3" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">★</text>
                </g>
              )}
              {hasAcc('jacket') && (
                <g transform="translate(78, 86)">
                  <ellipse cx="0" cy="0" rx="19" ry="18" fill="#1E293B" stroke="#475569" strokeWidth="1" />
                  <line x1="0" y1="-18" x2="0" y2="18" stroke="#F59E0B" strokeWidth="1" />
                  <circle cx="-5" cy="0" r="1.5" fill="#F59E0B" />
                </g>
              )}
              {hasAcc('hoodie') && (
                <g transform="translate(78, 86)">
                  <ellipse cx="0" cy="0" rx="19" ry="18" fill="#7C3AED" stroke="#6D28D9" strokeWidth="1" />
                  <rect x="-8" y="2" width="16" height="8" rx="2" fill="#6D28D9" />
                </g>
              )}

              {/* Layered Bird Wings on Side */}
              <g className={pose === 'walking' ? 'anim-bird-wing' : ''}>
                <path
                  d="M66 65 C54 75, 52 100, 68 108 C64 95, 66 80, 76 70 Z"
                  fill="#1D4ED8"
                />
                <path
                  d="M64 74 C56 82, 56 98, 68 104 C64 94, 66 84, 72 76 Z"
                  fill="#3B82F6"
                />
              </g>

              {/* ── BIRD HEAD & CURVED PARROT BEAK (NO CAT EARS!) ── */}
              <g transform="translate(18, 4)">
                {/* Cobalt Round Bird Head */}
                <circle cx="62" cy="40" r="22" fill="#2563EB" />
                {/* Feathery Top Crown Crest */}
                <path d="M58 20 Q64 10 70 16 Q66 22 64 24" fill="#1D4ED8" />
                <path d="M54 22 Q58 12 62 18" fill="#3B82F6" />

                {/* White Facial Skin Patch */}
                <ellipse cx="54" cy="38" rx="8" ry="7" fill="#FFFFFF" />

                {/* Round Sparkly Dark Eye */}
                <circle cx="54" cy="38" r="3.8" fill="#0F172A" />
                <circle cx="52.8" cy="36.8" r="1.3" fill="#FFFFFF" />

                {/* Large Curved Black Parrot / Macaw Beak */}
                <path d="M56 36 Q74 38 72 52 Q60 55 56 46 Z" fill="#0F172A" />
                <path d="M58 46 Q66 48 64 54 Q60 54 58 48 Z" fill="#334155" />

                {/* Accessories for Bird — head items */}
                {hasAcc('bow') && (
                  <g transform="translate(62, 18)">
                    <ellipse cx="0" cy="0" rx="2.5" ry="2.5" fill="#DB2777" />
                    <path d="M0 0 C-8 -6, -8 6, 0 0 Z" fill="#F43F5E" />
                    <path d="M0 0 C8 -6, 8 6, 0 0 Z" fill="#F43F5E" />
                  </g>
                )}
                {hasAcc('hat') && (
                  <g transform="translate(62, 10)">
                    <ellipse cx="0" cy="7" rx="14" ry="3" fill="#0F172A" />
                    <path d="M-8 7 L-7 -6 L7 -6 L8 7 Z" fill="#1E293B" />
                    <path d="M-7.8 4 L-7.5 7 L7.5 7 L7.8 4 Z" fill="#F59E0B" />
                  </g>
                )}
                {hasAcc('crown') && (
                  <g transform="translate(62, 8)">
                    <path d="M-10 8 L-12 -2 L-4 2 L0 -5 L4 2 L12 -2 L10 8 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
                    <circle cx="0" cy="-5" r="1.8" fill="#3B82F6" />
                    <rect x="-8" y="5" width="16" height="2" fill="#FEF08A" rx="1" />
                  </g>
                )}
                {hasAcc('glasses') && (
                  <g transform="translate(56, 38)">
                    <rect x="-10" y="-4" width="10" height="8" rx="2" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.2" />
                    <line x1="0" y1="0" x2="4" y2="0" stroke="#F59E0B" strokeWidth="1.2" />
                  </g>
                )}
                {hasAcc('sunglasses') && (
                  <g transform="translate(56, 38)">
                    <rect x="-10" y="-4" width="10" height="8" rx="2" fill="#111827" stroke="#6366F1" strokeWidth="1.2" />
                    <rect x="2" y="-4" width="10" height="8" rx="2" fill="#111827" stroke="#6366F1" strokeWidth="1.2" />
                    <line x1="0" y1="-1" x2="2" y2="-1" stroke="#6366F1" strokeWidth="1.2" />
                  </g>
                )}
                {hasAcc('scarf') && (
                  <g transform="translate(80, 60)">
                    <path d="M-14 0 Q0 6 14 0 Q0 -4 -14 0 Z" fill="#EF4444" />
                    <path d="M8 0 Q14 6 14 14" stroke="#EF4444" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </g>
                )}
              </g>
            </g>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* 2. BUNNY FULL-BODY (COTTON PUFF TAIL, LONG EARS, BUNNY PAWS)  */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {isBunny && (
            <g className={pose === 'walking' ? 'anim-walk-body' : 'anim-sit-breathe'}>
              {/* Cape behind Bunny */}
              {hasAcc('cape') && (
                <path d="M60 70 C42 85, 36 115, 46 135 C64 135, 96 135, 110 135 C116 115, 114 85, 98 70 Z" fill="#7C3AED" opacity="0.95" />
              )}

              {/* Fluffy Round Cotton Ball Tail */}
              <circle cx="112" cy="98" r="9" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

              {/* Hind Thumper Feet — left */}
              <ellipse cx="62" cy="120" rx="12" ry="10" fill={breed.id === 'snow-bunny' ? '#E2E8F0' : '#B45309'} />
              {hasAcc('shoes') ? (
                <g>
                  <ellipse cx="60" cy="130" rx="10" ry="5.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
                  <ellipse cx="60" cy="133" rx="10" ry="2.5" fill="#FFFFFF" />
                </g>
              ) : (
                <ellipse cx="60" cy="130" rx="8" ry="4.5" fill="#FFFFFF" />
              )}
              {/* Hind Thumper Feet — right */}
              <ellipse cx="98" cy="120" rx="12" ry="10" fill={breed.id === 'snow-bunny' ? '#E2E8F0' : '#B45309'} />
              {hasAcc('shoes') ? (
                <g>
                  <ellipse cx="100" cy="130" rx="10" ry="5.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
                  <ellipse cx="100" cy="133" rx="10" ry="2.5" fill="#FFFFFF" />
                </g>
              ) : (
                <ellipse cx="100" cy="130" rx="8" ry="4.5" fill="#FFFFFF" />
              )}

              {/* Pear-shaped Fluffy Bunny Body */}
              <ellipse cx="80" cy="92" rx="28" ry="26" fill={breed.id === 'snow-bunny' ? '#FFFFFF' : '#D97706'} />
              <ellipse cx="80" cy="95" rx="16" ry="18" fill="#FFFBEB" />

              {/* Bunny Torso Clothing */}
              {hasAcc('tshirt') && (
                <g transform="translate(80, 95)">
                  <ellipse cx="0" cy="0" rx="20" ry="18" fill="#10B981" stroke="#059669" strokeWidth="0.8" />
                  <text x="0" y="3" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">★</text>
                </g>
              )}
              {hasAcc('jacket') && (
                <g transform="translate(80, 95)">
                  <ellipse cx="0" cy="0" rx="21" ry="18" fill="#1E293B" stroke="#475569" strokeWidth="1" />
                  <line x1="0" y1="-18" x2="0" y2="18" stroke="#F59E0B" strokeWidth="1" />
                  <circle cx="-6" cy="0" r="1.5" fill="#F59E0B" />
                </g>
              )}
              {hasAcc('hoodie') && (
                <g transform="translate(80, 95)">
                  <ellipse cx="0" cy="0" rx="21" ry="18" fill="#7C3AED" stroke="#6D28D9" strokeWidth="1" />
                  <rect x="-8" y="2" width="16" height="8" rx="2" fill="#6D28D9" />
                </g>
              )}

              {/* Front Paws */}
              <rect x="72" y="102" width="7" height="26" rx="3.5" fill="#FFFFFF" />
              <rect x="81" y="102" width="7" height="26" rx="3.5" fill="#FFFFFF" />

              {/* Bunny Head & Long Ears */}
              <g transform="translate(18, 0)" className="anim-ear-wiggle">
                {/* Ears */}
                {breed.id === 'holland-lop' ? (
                  <g>
                    <path d="M40 32 C32 44, 30 72, 42 76 C46 66, 46 44, 44 32 Z" fill="#B45309" />
                    <path d="M84 32 C92 44, 94 72, 82 76 C78 66, 78 44, 80 32 Z" fill="#B45309" />
                  </g>
                ) : (
                  <g>
                    <ellipse cx="48" cy="16" rx="6.5" ry="16" fill="#FFFFFF" stroke="#E2E8F0" />
                    <ellipse cx="48" cy="16" rx="3.5" ry="11" fill="#FDA4AF" />
                    <ellipse cx="76" cy="16" rx="6.5" ry="16" fill="#FFFFFF" stroke="#E2E8F0" />
                    <ellipse cx="76" cy="16" rx="3.5" ry="11" fill="#FDA4AF" />
                  </g>
                )}
                {/* Head */}
                <ellipse cx="62" cy="44" rx="24" ry="20" fill={breed.id === 'snow-bunny' ? '#FFFFFF' : '#D97706'} />
                <circle cx="51" cy="41" r="4.5" fill={breed.id === 'snow-bunny' ? '#E11D48' : '#451A03'} />
                <circle cx="49.5" cy="39.5" r="1.5" fill="#FFFFFF" />
                <circle cx="73" cy="41" r="4.5" fill={breed.id === 'snow-bunny' ? '#E11D48' : '#451A03'} />
                <circle cx="71.5" cy="39.5" r="1.5" fill="#FFFFFF" />
                {/* Pink Nose */}
                <polygon points="60,49 64,49 62,52" fill="#FDA4AF" />
                <path d="M62 52 Q59 55 57 53 M62 52 Q65 55 67 53" stroke="#92400E" strokeWidth="1" fill="none" />

                {/* Bunny Accessories — Head & Neck */}
                {hasAcc('bow') && (
                  <g transform="translate(62, 28)">
                    <ellipse cx="0" cy="0" rx="2.5" ry="2.5" fill="#DB2777" />
                    <path d="M0 0 C-8 -6, -8 6, 0 0 Z" fill="#F43F5E" />
                    <path d="M0 0 C8 -6, 8 6, 0 0 Z" fill="#F43F5E" />
                  </g>
                )}
                {hasAcc('hat') && (
                  <g transform="translate(62, 14)">
                    <ellipse cx="0" cy="7" rx="14" ry="3" fill="#0F172A" />
                    <path d="M-8 7 L-7 -6 L7 -6 L8 7 Z" fill="#1E293B" />
                    <path d="M-7.8 4 L-7.5 7 L7.5 7 L7.8 4 Z" fill="#F59E0B" />
                  </g>
                )}
                {hasAcc('crown') && (
                  <g transform="translate(62, 14)">
                    <path d="M-10 8 L-12 -2 L-4 2 L0 -5 L4 2 L12 -2 L10 8 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
                    <circle cx="0" cy="-5" r="1.8" fill="#3B82F6" />
                    <rect x="-8" y="5" width="16" height="2" fill="#FEF08A" rx="1" />
                  </g>
                )}
                {hasAcc('glasses') && (
                  <g transform="translate(62, 41)">
                    <rect x="-16" y="-5" width="13" height="9" rx="2.5" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.2" />
                    <rect x="3" y="-5" width="13" height="9" rx="2.5" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.2" />
                    <line x1="-3" y1="-1" x2="3" y2="-1" stroke="#F59E0B" strokeWidth="1.2" />
                  </g>
                )}
                {hasAcc('sunglasses') && (
                  <g transform="translate(62, 41)">
                    <rect x="-16" y="-5" width="13" height="9" rx="2.5" fill="#111827" stroke="#6366F1" strokeWidth="1.2" />
                    <rect x="3" y="-5" width="13" height="9" rx="2.5" fill="#111827" stroke="#6366F1" strokeWidth="1.2" />
                    <line x1="-3" y1="-1" x2="3" y2="-1" stroke="#6366F1" strokeWidth="1.2" />
                  </g>
                )}
                {hasAcc('scarf') && (
                  <g transform="translate(62, 64)">
                    <path d="M-16 2 Q0 7 16 2 Q0 -3 -16 2 Z" fill="#EF4444" />
                    <path d="M8 2 Q14 8 12 18" stroke="#EF4444" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  </g>
                )}
              </g>
            </g>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* 3. QUADRUPED DOGS & CATS (4 LEGS, ACCURATE ANIMAL BREEDS)    */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {isDogOrCat && (
            <QuadrupedDogCatBody
              breed={breed}
              pose={pose}
              accs={activeAccessories}
            />
          )}
        </svg>
      </div>

      {/* Interactive Pose Controls: [ Walking ] [ Sitting ] */}
      {showControls && (
        <div className="flex items-center gap-2 mt-2 bg-slate-900/80 p-1 rounded-full border border-slate-700/80 shadow-inner">
          <button
            onClick={() => setPose('walking')}
            className={`px-3 py-1 rounded-full text-xs font-black transition flex items-center gap-1 ${
              pose === 'walking'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{isBird ? '🐾 Hop' : '🐾 Walk'}</span>
          </button>
          <button
            onClick={() => setPose('sitting')}
            className={`px-3 py-1 rounded-full text-xs font-black transition flex items-center gap-1 ${
              pose === 'sitting'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{isBird ? '🪶 Perch' : '🛋️ Sit'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Sub-Component: 4-Legged Dog & Cat Full-Body
function QuadrupedDogCatBody({
  breed,
  pose,
  accs,
}: {
  breed: any;
  pose: 'walking' | 'sitting';
  accs: string[];
}) {
  const hasAcc = (id: string) => accs.includes(id);
  const getColors = () => {
    switch (breed.id) {
      case 'shih-tzu':
        return { body: '#F5E6CA', shade: '#DEBA85', chest: '#FFFDF7', paws: '#FFFDF7', tail: '#DEBA85' };
      case 'pitbull':
        return { body: '#64748B', shade: '#475569', chest: '#F8FAFC', paws: '#94A3B8', tail: '#475569' };
      case 'chihuahua':
        return { body: '#E0A96D', shade: '#C68B59', chest: '#FFFBEB', paws: '#FFFBEB', tail: '#C68B59' };
      case 'husky':
        return { body: '#64748B', shade: '#334155', chest: '#FFFFFF', paws: '#FFFFFF', tail: '#334155' };
      case 'golden-retriever':
        return { body: '#F59E0B', shade: '#D97706', chest: '#FEF08A', paws: '#FEF08A', tail: '#D97706' };
      case 'corgi':
        return { body: '#EA580C', shade: '#C2410C', chest: '#FFFFFF', paws: '#FFFFFF', tail: '#EA580C' };
      case 'dalmatian':
        return { body: '#F8FAFC', shade: '#CBD5E1', chest: '#FFFFFF', paws: '#FFFFFF', tail: '#0F172A' };
      case 'siamese':
        return { body: '#FAF7F2', shade: '#E2D7C8', chest: '#FAF7F2', paws: '#25160E', tail: '#25160E' };
      case 'orange-tabby':
        return { body: '#EA580C', shade: '#C2410C', chest: '#FFF7ED', paws: '#FFF7ED', tail: '#EA580C' };
      default:
        return { body: '#E0A96D', shade: '#C68B59', chest: '#FFFBEB', paws: '#FFFBEB', tail: '#C68B59' };
    }
  };

  const colors = getColors();

  if (pose === 'walking') {
    return (
      <g className="anim-walk-body">
        {/* Cape behind walking quadruped */}
        {hasAcc('cape') && (
          <path d="M52 70 C34 85, 28 115, 38 135 C56 135, 96 135, 112 135 C120 115, 116 85, 98 70 Z" fill="#7C3AED" opacity="0.95" />
        )}

        {/* Back Leg 1 & 2 — shoes embedded so they move with legs */}
        <g className="anim-leg-2">
          <rect x="58" y="95" width="10" height="35" rx="5" fill={colors.shade} />
          {hasAcc('shoes') ? (
            <g>
              <ellipse cx="61" cy="130" rx="8" ry="4.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
              <ellipse cx="61" cy="133" rx="8" ry="2" fill="#FFFFFF" />
            </g>
          ) : (
            <ellipse cx="61" cy="130" rx="6" ry="4" fill={colors.paws} />
          )}
        </g>
        <g className="anim-leg-1">
          <rect x="94" y="95" width="10" height="35" rx="5" fill={colors.shade} />
          {hasAcc('shoes') ? (
            <g>
              <ellipse cx="99" cy="130" rx="8" ry="4.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
              <ellipse cx="99" cy="133" rx="8" ry="2" fill="#FFFFFF" />
            </g>
          ) : (
            <ellipse cx="99" cy="130" rx="6" ry="4" fill={colors.paws} />
          )}
        </g>

        {/* Tail (Wagging) */}
        <g className="anim-tail-wag">
          <path d="M110 82 C125 72, 138 60, 142 45 C140 58, 126 78, 114 86 Z" fill={colors.tail} />
          <circle cx="140" cy="45" r="4.5" fill={colors.paws} />
        </g>

        {/* Torso */}
        <ellipse cx="82" cy="88" rx="34" ry="24" fill={colors.body} />
        <path d="M58 84 C62 98, 76 104, 94 100 C88 90, 72 80, 58 84 Z" fill={colors.chest} opacity="0.9" />

        {/* Walking Torso Clothing */}
        {hasAcc('tshirt') && (
          <g transform="translate(82, 88)">
            <ellipse cx="0" cy="0" rx="28" ry="21" fill="#10B981" stroke="#059669" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">★</text>
          </g>
        )}
        {hasAcc('jacket') && (
          <g transform="translate(82, 88)">
            <ellipse cx="0" cy="0" rx="29" ry="21" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
            <line x1="0" y1="-21" x2="0" y2="21" stroke="#F59E0B" strokeWidth="1.2" />
            <circle cx="-8" cy="-4" r="1.8" fill="#F59E0B" />
            <circle cx="-8" cy="8" r="1.8" fill="#F59E0B" />
          </g>
        )}
        {hasAcc('hoodie') && (
          <g transform="translate(82, 88)">
            <ellipse cx="0" cy="0" rx="29" ry="21" fill="#7C3AED" stroke="#6D28D9" strokeWidth="1" />
            <rect x="-10" y="2" width="20" height="9" rx="2" fill="#6D28D9" />
          </g>
        )}

        {/* Front Leg 1 & 2 — shoes embedded so they move with legs */}
        <g className="anim-leg-1">
          <rect x="68" y="95" width="10" height="35" rx="5" fill={colors.paws === '#25160E' ? '#25160E' : colors.body} />
          {hasAcc('shoes') ? (
            <g>
              <ellipse cx="71" cy="130" rx="8" ry="4.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
              <ellipse cx="71" cy="133" rx="8" ry="2" fill="#FFFFFF" />
            </g>
          ) : (
            <ellipse cx="71" cy="130" rx="6" ry="4" fill={colors.paws} />
          )}
        </g>
        <g className="anim-leg-2">
          <rect x="86" y="95" width="10" height="35" rx="5" fill={colors.paws === '#25160E' ? '#25160E' : colors.body} />
          {hasAcc('shoes') ? (
            <g>
              <ellipse cx="91" cy="130" rx="8" ry="4.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
              <ellipse cx="91" cy="133" rx="8" ry="2" fill="#FFFFFF" />
            </g>
          ) : (
            <ellipse cx="91" cy="130" rx="6" ry="4" fill={colors.paws} />
          )}
        </g>

        {/* Head */}
        <g transform="translate(18, -4)" className="anim-ear-wiggle">
          <DogCatHead breedId={breed.id} colors={colors} accs={accs} />
        </g>
      </g>
    );
  }

  // Sitting pose
  return (
    <g className="anim-sit-breathe">
      {/* Cape behind sitting quadruped */}
      {hasAcc('cape') && (
        <path d="M52 75 C34 92, 34 125, 46 135 C64 135, 96 135, 114 135 C126 125, 126 92, 108 75 Z" fill="#7C3AED" opacity="0.95" />
      )}

      {/* Resting Tail */}
      <path d="M100 115 C116 114, 126 105, 128 95 C124 95, 115 106, 98 112 Z" fill={colors.tail} />

      {/* Folded Hind Thighs — shoes replace paw tips */}
      <ellipse cx="58" cy="116" rx="14" ry="12" fill={colors.shade} />
      {hasAcc('shoes') ? (
        <g>
          <ellipse cx="56" cy="128" rx="9" ry="4.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
          <ellipse cx="56" cy="131" rx="9" ry="2" fill="#FFFFFF" />
        </g>
      ) : (
        <ellipse cx="56" cy="128" rx="8" ry="4" fill={colors.paws} />
      )}
      <ellipse cx="102" cy="116" rx="14" ry="12" fill={colors.shade} />
      {hasAcc('shoes') ? (
        <g>
          <ellipse cx="104" cy="128" rx="9" ry="4.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
          <ellipse cx="104" cy="131" rx="9" ry="2" fill="#FFFFFF" />
        </g>
      ) : (
        <ellipse cx="104" cy="128" rx="8" ry="4" fill={colors.paws} />
      )}

      {/* Upright Sitting Torso */}
      <path d="M62 76 C58 98, 64 124, 80 126 C96 124, 102 98, 98 76 C94 65, 66 65, 62 76 Z" fill={colors.body} />
      <ellipse cx="80" cy="94" rx="15" ry="18" fill={colors.chest} opacity="0.9" />

      {/* Sitting Torso Clothing */}
      {hasAcc('tshirt') && (
        <g>
          <path d="M62 76 C58 98, 64 120, 80 122 C96 120, 102 98, 98 76 C94 65, 66 65, 62 76 Z" fill="#10B981" stroke="#059669" strokeWidth="1" />
          <text x="80" y="98" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">★</text>
        </g>
      )}
      {hasAcc('jacket') && (
        <g>
          <path d="M62 76 C58 98, 64 120, 80 122 C96 120, 102 98, 98 76 C94 65, 66 65, 62 76 Z" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
          <line x1="80" y1="70" x2="80" y2="122" stroke="#F59E0B" strokeWidth="1.2" />
          <circle cx="73" cy="90" r="1.8" fill="#F59E0B" />
          <circle cx="73" cy="104" r="1.8" fill="#F59E0B" />
        </g>
      )}
      {hasAcc('hoodie') && (
        <g>
          <path d="M62 76 C58 98, 64 120, 80 122 C96 120, 102 98, 98 76 C94 65, 66 65, 62 76 Z" fill="#7C3AED" stroke="#6D28D9" strokeWidth="1" />
          <rect x="70" y="98" width="20" height="9" rx="2" fill="#6D28D9" />
        </g>
      )}

      {/* Front Paws — shoes replace paw tips */}
      <rect x="71" y="96" width="8" height="32" rx="4" fill={colors.paws === '#25160E' ? '#25160E' : colors.body} />
      {hasAcc('shoes') ? (
        <g>
          <ellipse cx="75" cy="128" rx="7" ry="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
          <ellipse cx="75" cy="131" rx="7" ry="2" fill="#FFFFFF" />
        </g>
      ) : (
        <ellipse cx="75" cy="128" rx="5.5" ry="3.5" fill={colors.paws} />
      )}
      <rect x="81" y="96" width="8" height="32" rx="4" fill={colors.paws === '#25160E' ? '#25160E' : colors.body} />
      {hasAcc('shoes') ? (
        <g>
          <ellipse cx="85" cy="128" rx="7" ry="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
          <ellipse cx="85" cy="131" rx="7" ry="2" fill="#FFFFFF" />
        </g>
      ) : (
        <ellipse cx="85" cy="128" rx="5.5" ry="3.5" fill={colors.paws} />
      )}

      {/* Head */}
      <g transform="translate(18, 0)" className="anim-ear-wiggle">
        <DogCatHead breedId={breed.id} colors={colors} accs={accs} />
      </g>
    </g>
  );
}

function DogCatHead({ breedId, colors, accs }: { breedId: string; colors: any; accs: string[] }) {
  const hasAcc = (id: string) => accs.includes(id);
  return (
    <g>
      {/* SHIH TZU */}
      {breedId === 'shih-tzu' && (
        <g>
          <path d="M38 32 C30 42, 32 64, 44 68 C48 60, 46 40, 42 32 Z" fill="#C49A5A" />
          <path d="M86 32 C94 42, 92 64, 80 68 C76 60, 78 40, 82 32 Z" fill="#C49A5A" />
          <ellipse cx="62" cy="46" rx="26" ry="22" fill="#FFFDF7" />
          <ellipse cx="50" cy="44" rx="7" ry="6" fill="#C49A5A" opacity="0.75" />
          <ellipse cx="74" cy="44" rx="7" ry="6" fill="#C49A5A" opacity="0.75" />
          <circle cx="50" cy="44" r="4.5" fill="#1C1917" />
          <circle cx="48.5" cy="42.5" r="1.5" fill="#FFFFFF" />
          <circle cx="74" cy="44" r="4.5" fill="#1C1917" />
          <circle cx="72.5" cy="42.5" r="1.5" fill="#FFFFFF" />
          <ellipse cx="62" cy="54" rx="10" ry="7" fill="#FFFDF7" />
          <path d="M59 52 Q62 50 65 52 Q62 56 59 52 Z" fill="#1C1917" />
          <path d="M60.5 56 Q62 60 63.5 56 Z" fill="#F43F5E" />
          <circle cx="62" cy="24" r="3" fill="#EC4899" />
          <polygon points="59,24 55,20 57,26" fill="#F43F5E" />
          <polygon points="65,24 69,20 67,26" fill="#F43F5E" />
        </g>
      )}

      {/* PITBULL */}
      {breedId === 'pitbull' && (
        <g>
          <polygon points="40,32 32,16 46,22" fill="#334155" />
          <polygon points="84,32 92,16 78,22" fill="#334155" />
          <path d="M40 38 C36 55, 46 68, 62 69 C78 68, 88 55, 84 38 C80 26, 44 26, 40 38 Z" fill="#64748B" />
          <path d="M60 28 Q62 26 64 28 L63 38 Q62 39 61 38 Z" fill="#F8FAFC" />
          <path d="M46 36 Q51 34 56 37" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="51" cy="41" r="4.2" fill="#451A03" />
          <circle cx="49.8" cy="39.8" r="1.4" fill="#FFFFFF" />
          <path d="M78 36 Q73 34 68 37" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="73" cy="41" r="4.2" fill="#451A03" />
          <circle cx="71.8" cy="39.8" r="1.4" fill="#FFFFFF" />
          <ellipse cx="62" cy="52" rx="14" ry="9" fill="#475569" />
          <path d="M57 49 Q62 47 67 49 Q62 54 57 49 Z" fill="#0F172A" />
          <path d="M48 54 Q62 65 76 54" stroke="#0F172A" strokeWidth="2" fill="#E11D48" />
        </g>
      )}

      {/* CHIHUAHUA */}
      {breedId === 'chihuahua' && (
        <g>
          <path d="M34 38 C26 14, 44 6, 52 22 Z" fill="#E0A96D" />
          <path d="M37 34 C31 18, 43 12, 48 24 Z" fill="#FDA4AF" opacity="0.8" />
          <path d="M90 38 C98 14, 80 6, 72 22 Z" fill="#E0A96D" />
          <path d="M87 34 C93 18, 81 12, 76 24 Z" fill="#FDA4AF" opacity="0.8" />
          <ellipse cx="62" cy="44" rx="22" ry="20" fill="#E0A96D" />
          <ellipse cx="62" cy="54" rx="10" ry="7" fill="#FFFBEB" />
          <circle cx="51" cy="42" r="6" fill="#1C1917" />
          <circle cx="49" cy="40" r="2.2" fill="#FFFFFF" />
          <circle cx="73" cy="42" r="6" fill="#1C1917" />
          <circle cx="71" cy="40" r="2.2" fill="#FFFFFF" />
          <ellipse cx="62" cy="51" rx="2.8" ry="2" fill="#1C1917" />
          <path d="M62 53 L62 55 Q59 57 57 55 M62 55 Q65 57 67 55" stroke="#1C1917" strokeWidth="1" fill="none" />
        </g>
      )}

      {/* SIAMESE */}
      {breedId === 'siamese' && (
        <g>
          <polygon points="40,32 36,8 56,20" fill="#25160E" />
          <polygon points="84,32 88,8 68,20" fill="#25160E" />
          <ellipse cx="62" cy="44" rx="24" ry="20" fill="#FAF7F2" />
          <ellipse cx="62" cy="46" rx="14" ry="12" fill="#3E2723" />
          <ellipse cx="52" cy="40" rx="5" ry="4.5" fill="#0284C7" />
          <circle cx="50.8" cy="38.8" r="1.5" fill="#FFFFFF" />
          <ellipse cx="72" cy="40" rx="5" ry="4.5" fill="#0284C7" />
          <circle cx="70.8" cy="38.8" r="1.5" fill="#FFFFFF" />
          <polygon points="60,49 64,49 62,51.5" fill="#FDA4AF" />
          <line x1="44" y1="48" x2="32" y2="46" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
          <line x1="80" y1="48" x2="92" y2="46" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
        </g>
      )}

      {/* ORANGE TABBY */}
      {breedId === 'orange-tabby' && (
        <g>
          <polygon points="40,32 36,8 56,20" fill="#C2410C" />
          <polygon points="84,32 88,8 68,20" fill="#C2410C" />
          <ellipse cx="62" cy="44" rx="24" ry="20" fill="#EA580C" />
          <path d="M55 26 L58 32 L62 28 L66 32 L69 26" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <ellipse cx="52" cy="40" rx="5" ry="4.5" fill="#10B981" />
          <circle cx="50.8" cy="38.8" r="1.5" fill="#FFFFFF" />
          <ellipse cx="72" cy="40" rx="5" ry="4.5" fill="#10B981" />
          <circle cx="70.8" cy="38.8" r="1.5" fill="#FFFFFF" />
          <ellipse cx="62" cy="52" rx="9" ry="6.5" fill="#FFF7ED" />
          <polygon points="60,49 64,49 62,51.5" fill="#F43F5E" />
        </g>
      )}

      {/* FALLBACK HEAD */}
      {!['shih-tzu', 'pitbull', 'chihuahua', 'siamese', 'orange-tabby'].includes(breedId) && (
        <g>
          <polygon points="42,32 36,12 54,22" fill={colors.shade} />
          <polygon points="82,32 88,12 70,22" fill={colors.shade} />
          <ellipse cx="62" cy="44" rx="24" ry="20" fill={colors.body} />
          <circle cx="52" cy="41" r="4.5" fill="#1C1917" />
          <circle cx="50.8" cy="39.8" r="1.5" fill="#FFFFFF" />
          <circle cx="72" cy="41" r="4.5" fill="#1C1917" />
          <circle cx="70.8" cy="39.8" r="1.5" fill="#FFFFFF" />
          <ellipse cx="62" cy="51" rx="8" ry="6" fill={colors.chest} />
          <polygon points="60,49 64,49 62,52" fill="#1C1917" />
        </g>
      )}

      {/* Head Accessories */}
      {hasAcc('bow') && (
        <g transform="translate(74, 18)">
          <ellipse cx="0" cy="0" rx="2.5" ry="2.5" fill="#DB2777" />
          <path d="M0 0 C-8 -6, -8 6, 0 0 Z" fill="#F43F5E" />
          <path d="M0 0 C8 -6, 8 6, 0 0 Z" fill="#F43F5E" />
        </g>
      )}
      {hasAcc('hat') && (
        <g transform="translate(62, 12)">
          <ellipse cx="0" cy="7" rx="16" ry="3.5" fill="#0F172A" />
          <path d="M-9 7 L-8 -8 L8 -8 L9 7 Z" fill="#1E293B" />
          <path d="M-8.8 4 L-8.5 7 L8.5 7 L8.8 4 Z" fill="#F59E0B" />
        </g>
      )}
      {hasAcc('glasses') && (
        <g transform="translate(62, 40)">
          <rect x="-18" y="-5" width="15" height="10" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.2" />
          <rect x="3" y="-5" width="15" height="10" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.2" />
          <line x1="-3" y1="-1" x2="4" y2="-1" stroke="#F59E0B" strokeWidth="1.5" />
        </g>
      )}
      {hasAcc('sunglasses') && (
        <g transform="translate(62, 40)">
          <rect x="-18" y="-5" width="15" height="10" rx="3" fill="#111827" stroke="#6366F1" strokeWidth="1.2" />
          <rect x="3" y="-5" width="15" height="10" rx="3" fill="#111827" stroke="#6366F1" strokeWidth="1.2" />
          <line x1="-3" y1="-1" x2="4" y2="-1" stroke="#6366F1" strokeWidth="1.5" />
          {/* Lens shine */}
          <line x1="-15" y1="-2" x2="-12" y2="1" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
          <line x1="6" y1="-2" x2="9" y2="1" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
        </g>
      )}
      {hasAcc('crown') && (
        <g transform="translate(62, 10)">
          <path d="M-12 8 L-14 -2 L-5 2 L0 -6 L5 2 L14 -2 L12 8 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
          <circle cx="0" cy="-6" r="2" fill="#3B82F6" />
          <rect x="-10" y="5" width="20" height="2" fill="#FEF08A" rx="1" />
        </g>
      )}
      {hasAcc('scarf') && (
        <g transform="translate(62, 60)">
          <path d="M-18 2 Q0 8 18 2 Q0 -4 -18 2 Z" fill="#EF4444" />
          <path d="M-16 3 Q0 9 16 3 Q0 12 -16 3 Z" fill="#DC2626" opacity="0.6" />
          <path d="M10 4 Q16 10 14 24 Q10 28 8 24 Q10 12 8 6 Z" fill="#EF4444" />
          <path d="M-16 1 Q0 7 16 1" stroke="#FCA5A5" strokeWidth="1" fill="none" />
        </g>
      )}
    </g>
  );
}
