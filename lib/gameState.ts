export interface PetData {
  id: string;
  type: 'puppy' | 'kitten' | 'bunny' | 'bird' | 'unicorn';
  name: string;
  happiness: number; // 0 - 100
  accessory: string; // 'none' | 'hat' | 'bow' | 'glasses' | 'crown'
  rescuedAtLevel: number;
}

export interface GameState {
  coins: number;
  lives: number;
  maxLives: number;
  currentLevel: number;
  highestLevelUnlocked: number;
  levelStars: Record<number, number>; // level -> 1-3 stars
  levelScores: Record<number, number>; // level -> high score
  boosters: {
    hammers: number;
    rockets: number;
    colorBombs: number;
    shuffles: number;
  };
  rescuedPets: PetData[];
  unlockedAccessories: string[];
  isVip: boolean;
  soundEnabled: boolean;
  bgmEnabled: boolean;
}

const STORAGE_KEY = 'pet_rescue_game_state_v1';

export const INITIAL_STATE: GameState = {
  coins: 250,
  lives: 5,
  maxLives: 5,
  currentLevel: 1,
  highestLevelUnlocked: 1,
  levelStars: { 1: 0 },
  levelScores: { 1: 0 },
  boosters: {
    hammers: 2,
    rockets: 2,
    colorBombs: 1,
    shuffles: 3,
  },
  rescuedPets: [
    {
      id: 'default_puppy',
      type: 'puppy',
      name: 'Buddy',
      happiness: 85,
      accessory: 'bow',
      rescuedAtLevel: 1,
    },
  ],
  unlockedAccessories: ['none', 'bow'],
  isVip: false,
  soundEnabled: true,
  bgmEnabled: true,
};

export function loadGameState(): GameState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed: GameState = JSON.parse(raw);
    const loaded = { ...INITIAL_STATE, ...parsed };

    // Migration fix: If level 10 was completed, ensure level 11 is unlocked
    if (loaded.levelStars && (loaded.levelStars[10] > 0 || (loaded.levelScores && loaded.levelScores[10] > 0))) {
      if (loaded.highestLevelUnlocked <= 10) {
        loaded.highestLevelUnlocked = 11;
      }
    }
    return loaded;
  } catch (e) {
    console.error('Failed to load game state:', e);
    return INITIAL_STATE;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

export function addCoins(amount: number): GameState {
  const state = loadGameState();
  state.coins = Math.max(0, state.coins + amount);
  saveGameState(state);
  return state;
}

export function addBoosters(type: keyof GameState['boosters'], count: number): GameState {
  const state = loadGameState();
  state.boosters[type] = (state.boosters[type] || 0) + count;
  saveGameState(state);
  return state;
}

export function setCurrentLevel(level: number): GameState {
  const state = loadGameState();
  state.currentLevel = level;
  saveGameState(state);
  return state;
}

export function completeLevel(level: number, score: number, stars: number, rescuedPetType?: PetData['type']): GameState {
  const state = loadGameState();
  
  // Update star rating
  const currentStars = state.levelStars[level] || 0;
  if (stars > currentStars) {
    state.levelStars[level] = stars;
  }

  // Update high score
  const currentHighScore = state.levelScores[level] || 0;
  if (score > currentHighScore) {
    state.levelScores[level] = score;
  }

  // Unlock next level up to Level 100
  if (level >= state.highestLevelUnlocked && level < 100) {
    state.highestLevelUnlocked = level + 1;
    state.levelStars[level + 1] = state.levelStars[level + 1] || 0;
  }
  state.currentLevel = Math.min(100, level + 1);

  // Award bonus coins for completing level
  state.coins += 50 + stars * 25;

  // Add rescued pet if applicable
  if (rescuedPetType) {
    const petNames: Record<PetData['type'], string[]> = {
      puppy: ['Barnaby', 'Coco', 'Daisy', 'Milo'],
      kitten: ['Luna', 'Oliver', 'Cleo', 'Simba'],
      bunny: ['Hoppy', 'Clover', 'Pip', 'Hazel'],
      bird: ['Pip', 'Sky', 'Sunny', 'Rio'],
      unicorn: ['Sparkle', 'Starlight', 'Magic', 'Celeste'],
    };
    const names = petNames[rescuedPetType] || ['Cutie'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const newPet: PetData = {
      id: `${rescuedPetType}_${Date.now()}`,
      type: rescuedPetType,
      name: randomName,
      happiness: 90,
      accessory: 'none',
      rescuedAtLevel: level,
    };
    // Avoid duplicate names if possible
    state.rescuedPets.push(newPet);
  }

  saveGameState(state);
  return state;
}

export function interactWithPet(petId: string, action: 'pet' | 'feed' | 'accessory', accessory?: string): GameState {
  const state = loadGameState();
  const pet = state.rescuedPets.find((p) => p.id === petId);
  if (!pet) return state;

  if (action === 'pet') {
    pet.happiness = Math.min(100, pet.happiness + 10);
  } else if (action === 'feed') {
    if (state.coins >= 10) {
      state.coins -= 10;
      pet.happiness = Math.min(100, pet.happiness + 25);
    }
  } else if (action === 'accessory' && accessory) {
    if (state.unlockedAccessories.includes(accessory)) {
      pet.accessory = accessory;
    }
  }

  saveGameState(state);
  return state;
}
