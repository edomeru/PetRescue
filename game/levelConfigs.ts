export interface LevelConfig {
  level: number;
  cols: number;
  rows: number;
  colorsCount: number;
  moves: number;
  petsToRescue: number;
  targetScore: number;
  petType: 'puppy' | 'kitten' | 'bunny' | 'bird' | 'unicorn';
  hasIce?: boolean;
  hasCages?: boolean;
  hasChocolate?: boolean;
}

export interface WorldTheme {
  id: number;
  name: string;
  emoji: string;
  bgGradient: string;
  accentColor: string;
  description: string;
}

export interface WorldPetInfo {
  name: string;
  emoji: string;
  bgColor: number;
}

export const WORLD_PETS: Record<number, WorldPetInfo[]> = {
  1: [ // World 1: Jungle Sanctuary
    { name: 'Jungle Puppy', emoji: '🐶', bgColor: 0xf59e0b },
    { name: 'Jungle Kitten', emoji: '🐱', bgColor: 0xec4899 },
    { name: 'Jungle Bunny', emoji: '🐰', bgColor: 0x10b981 },
    { name: 'Tropical Parrot', emoji: '🦜', bgColor: 0x06b6d4 },
    { name: 'Jungle Monkey', emoji: '🐒', bgColor: 0x8b5cf6 },
  ],
  2: [ // World 2: Candy Kingdom
    { name: 'Gummy Bear', emoji: '🐻', bgColor: 0xec4899 },
    { name: 'Sugar Unicorn', emoji: '🦄', bgColor: 0xa855f7 },
    { name: 'Marshmallow Bunny', emoji: '🐰', bgColor: 0xf472b6 },
    { name: 'Cupcake Kitten', emoji: '🐱', bgColor: 0xfb7185 },
    { name: 'Choco Puppy', emoji: '🐶', bgColor: 0xd97706 },
  ],
  3: [ // World 3: Sunny Coral Beach
    { name: 'Playful Dolphin', emoji: '🐬', bgColor: 0x0284c7 },
    { name: 'Sea Turtle', emoji: '🐢', bgColor: 0x059669 },
    { name: 'Pink Flamingo', emoji: '🦩', bgColor: 0xf43f5e },
    { name: 'Little Crab', emoji: '🦀', bgColor: 0xef4444 },
    { name: 'Baby Seal', emoji: '🦭', bgColor: 0x38bdf8 },
  ],
  4: [ // World 4: Frozen Crystal Tundra
    { name: 'Penguin Hero', emoji: '🐧', bgColor: 0x0284c7 },
    { name: 'Polar Bear', emoji: '🐻', bgColor: 0x38bdf8 },
    { name: 'Arctic Fox', emoji: '🦊', bgColor: 0x818cf8 },
    { name: 'Snowy Owl', emoji: '🦉', bgColor: 0x93c5fd },
    { name: 'Ice Seal', emoji: '🦭', bgColor: 0x06b6d4 },
  ],
  5: [ // World 5: Starlight Cosmic Galaxy
    { name: 'Astro Cat', emoji: '🐱', bgColor: 0xa855f7 },
    { name: 'Cosmic Dog', emoji: '🐶', bgColor: 0x8b5cf6 },
    { name: 'Space Alien', emoji: '👾', bgColor: 0x10b981 },
    { name: 'Robo Pet', emoji: '🤖', bgColor: 0x6366f1 },
    { name: 'Starlight Pegasus', emoji: '🦄', bgColor: 0xf43f5e },
  ],
  6: [ // World 6: Volcanic Amber Peak
    { name: 'Lava Lizard', emoji: '🦎', bgColor: 0xea580c },
    { name: 'Baby Dragon', emoji: '🐉', bgColor: 0xdc2626 },
    { name: 'Phoenix Bird', emoji: '🦅', bgColor: 0xf97316 },
    { name: 'Fire Fox', emoji: '🦊', bgColor: 0xb91c1c },
    { name: 'Magma Turtle', emoji: '🐢', bgColor: 0xc2410c },
  ],
  7: [ // World 7: Enchanted Fairy Forest
    { name: 'Fairy Sprite', emoji: '🧚', bgColor: 0x10b981 },
    { name: 'Enchanted Deer', emoji: '🦌', bgColor: 0x059669 },
    { name: 'Forest Fox', emoji: '🦊', bgColor: 0xd97706 },
    { name: 'Wise Owl', emoji: '🦉', bgColor: 0x65a30d },
    { name: 'Fairy Unicorn', emoji: '🦄', bgColor: 0xec4899 },
  ],
  8: [ // World 8: Golden Desert Oasis
    { name: 'Desert Camel', emoji: '🐫', bgColor: 0xd97706 },
    { name: 'Fennec Fox', emoji: '🦊', bgColor: 0xeab308 },
    { name: 'Desert Eagle', emoji: '🦅', bgColor: 0xb45309 },
    { name: 'Golden Cobra', emoji: '🐍', bgColor: 0xca8a04 },
    { name: 'Sphinx Cat', emoji: '🐱', bgColor: 0xf59e0b },
  ],
  9: [ // World 9: Sky Island Paradise
    { name: 'Sky Eagle', emoji: '🦅', bgColor: 0x0284c7 },
    { name: 'White Dove', emoji: '🕊️', bgColor: 0x38bdf8 },
    { name: 'Sky Pegasus', emoji: '🦄', bgColor: 0x818cf8 },
    { name: 'Cloud Dragon', emoji: '🐉', bgColor: 0xa855f7 },
    { name: 'Rainbow Butterfly', emoji: '🦋', bgColor: 0xf43f5e },
  ],
  10: [ // World 10: Royal Pet Palace
    { name: 'Royal Corgi', emoji: '👑', bgColor: 0xffd700 },
    { name: 'Empress Persian', emoji: '🐱', bgColor: 0xe11d48 },
    { name: 'Royal Peacock', emoji: '🦚', bgColor: 0x7c3aed },
    { name: 'Golden Lion', emoji: '🦁', bgColor: 0xf59e0b },
    { name: 'Diamond Unicorn', emoji: '🦄', bgColor: 0xec4899 },
  ],
};

export const WORLD_THEMES: Record<number, WorldTheme> = {
  1: { id: 1, name: "Jungle Sanctuary", emoji: "🌿", bgGradient: "from-emerald-900 via-teal-900 to-slate-900", accentColor: "#10b981", description: "Tropical palms, ancient ruins & exotic flowers" },
  2: { id: 2, name: "Candy Kingdom", emoji: "🍬", bgGradient: "from-pink-900 via-purple-900 to-slate-900", accentColor: "#ec4899", description: "Glossy lollipops, cotton candy clouds & chocolate streams" },
  3: { id: 3, name: "Sunny Coral Beach", emoji: "🏖️", bgGradient: "from-sky-900 via-cyan-900 to-blue-950", accentColor: "#06b6d4", description: "Golden sands, turquoise waves & tropical starfish" },
  4: { id: 4, name: "Frozen Crystal Tundra", emoji: "❄️", bgGradient: "from-blue-950 via-indigo-900 to-slate-950", accentColor: "#38bdf8", description: "Snowy pines, glowing aurora borealis & ice glaciers" },
  5: { id: 5, name: "Starlight Cosmic Galaxy", emoji: "🌌", bgGradient: "from-purple-950 via-indigo-950 to-slate-950", accentColor: "#a855f7", description: "Twinkling nebulae, glowing planets & cosmic dust" },
  6: { id: 6, name: "Volcanic Amber Peak", emoji: "🌋", bgGradient: "from-orange-950 via-rose-950 to-slate-950", accentColor: "#f97316", description: "Glowing lava streams, obsidian rocks & sunset skies" },
  7: { id: 7, name: "Enchanted Fairy Forest", emoji: "🏰", bgGradient: "from-emerald-950 via-green-950 to-slate-950", accentColor: "#22c55e", description: "Bioluminescent mushrooms, magical trees & fairy dust" },
  8: { id: 8, name: "Golden Desert Oasis", emoji: "🏜️", bgGradient: "from-amber-950 via-yellow-950 to-slate-950", accentColor: "#eab308", description: "Sand dunes, ancient pyramids & palm oasis springs" },
  9: { id: 9, name: "Sky Island Paradise", emoji: "☁️", bgGradient: "from-sky-950 via-blue-900 to-slate-900", accentColor: "#38bdf8", description: "Floating islands, rainbow bridges & fluffy clouds" },
  10: { id: 10, name: "Royal Pet Palace", emoji: "👑", bgGradient: "from-amber-900 via-rose-950 to-purple-950", accentColor: "#ffd700", description: "Golden arches, velvet banners & diamond crowns" },
};

export function getWorldForLevel(level: number): WorldTheme {
  const worldId = Math.min(10, Math.max(1, Math.ceil(level / 10)));
  return WORLD_THEMES[worldId] || WORLD_THEMES[1];
}

export function getPetForLevel(levelNumber: number): WorldPetInfo {
  const worldId = Math.min(10, Math.max(1, Math.ceil(levelNumber / 10)));
  const pets = WORLD_PETS[worldId] || WORLD_PETS[1];
  const petIndex = (levelNumber - 1) % pets.length;
  return pets[petIndex];
}

function generate100Levels(): Record<number, LevelConfig> {
  const configs: Record<number, LevelConfig> = {};
  const petTypes: LevelConfig['petType'][] = ['puppy', 'kitten', 'bunny', 'bird', 'unicorn'];

  for (let i = 1; i <= 100; i++) {
    const petType = petTypes[(i - 1) % petTypes.length];
    const moves = Math.max(10, 22 - Math.floor(i / 8));
    const petsToRescue = Math.min(8, 2 + Math.floor((i - 1) / 12));
    const targetScore = i * 500 + 500;
    const colorsCount = i < 5 ? 3 : i < 20 ? 4 : 5;
    const hasIce = i >= 2;
    const hasCages = i >= 4;
    const hasChocolate = i >= 3;

    configs[i] = {
      level: i,
      cols: 6,
      rows: 7,
      colorsCount,
      moves,
      petsToRescue,
      targetScore,
      petType,
      hasIce,
      hasCages,
      hasChocolate,
    };
  }
  return configs;
}

export const LEVEL_CONFIGS: Record<number, LevelConfig> = generate100Levels();
