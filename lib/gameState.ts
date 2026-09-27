export interface PetData {
  id: string;
  type: 'puppy' | 'kitten' | 'bunny' | 'bird' | 'unicorn';
  name: string;
  breed?: string;
  happiness: number; // 0 - 100
  accessory: string; // for backward compatibility (primary accessory: 'none' | 'hat' | 'bow' | ...)
  accessories?: string[]; // multi-equip stackable accessories, e.g. ['hat', 'glasses', 'scarf', 'tshirt']
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
  boughtPetIds: string[];
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
      breed: 'shih-tzu',
      happiness: 85,
      accessory: 'bow',
      accessories: ['bow'],
      rescuedAtLevel: 1,
    },
  ],
  boughtPetIds: [],
  unlockedAccessories: ['none', 'bow'],
  isVip: false,
  soundEnabled: true,
  bgmEnabled: true,
};

const BREED_ROTATIONS: Record<PetData['type'], string[]> = {
  puppy: ['shih-tzu', 'pitbull', 'chihuahua', 'husky', 'golden-retriever', 'corgi', 'dalmatian', 'pug'],
  kitten: ['siamese', 'orange-tabby', 'calico', 'persian', 'black-cat', 'scottish-fold'],
  bunny: ['holland-lop', 'snow-bunny', 'dutch-rabbit', 'angora'],
  bird: ['blue-macaw', 'cockatiel', 'toucan', 'cardinal'],
  unicorn: ['rainbow-alicorn', 'starlight-pegasus'],
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

    // Ensure boughtPetIds is initialized
    loaded.boughtPetIds = loaded.boughtPetIds || [];

    // Ensure unlockedAccessories is initialized and 'bow' is free by default
    if (!loaded.unlockedAccessories || !Array.isArray(loaded.unlockedAccessories)) {
      loaded.unlockedAccessories = ['none', 'bow'];
    } else {
      if (!loaded.unlockedAccessories.includes('none')) loaded.unlockedAccessories.unshift('none');
      if (!loaded.unlockedAccessories.includes('bow')) loaded.unlockedAccessories.push('bow');
    }

    // Ensure all pets have unique breeds assigned
    if (loaded.rescuedPets && loaded.rescuedPets.length > 0) {
      const typeCounts: Record<string, number> = { puppy: 0, kitten: 0, bunny: 0, bird: 0, unicorn: 0 };
      loaded.rescuedPets.forEach((p) => {
        const idx = typeCounts[p.type] || 0;
        typeCounts[p.type] = idx + 1;

        if (!p.breed) {
          // Specific mappings matching user requirements (e.g. 1st dog -> shih tzu, 2nd -> pitbull, 3rd -> chihuahua)
          const lowerName = (p.name || '').toLowerCase();
          if (p.type === 'puppy') {
            if (lowerName === 'buddy') p.breed = 'shih-tzu';
            else if (lowerName === 'barnaby') p.breed = 'pitbull';
            else if (lowerName === 'milo') p.breed = 'chihuahua';
            else if (lowerName === 'coco') p.breed = 'husky';
            else if (lowerName === 'daisy') p.breed = 'golden-retriever';
            else {
              const rotation = BREED_ROTATIONS['puppy'];
              p.breed = rotation[idx % rotation.length];
            }
          } else if (p.type === 'kitten') {
            if (lowerName === 'luna') p.breed = 'siamese';
            else if (lowerName === 'oliver') p.breed = 'orange-tabby';
            else if (lowerName === 'cleo') p.breed = 'calico';
            else if (lowerName === 'simba') p.breed = 'persian';
            else {
              const rotation = BREED_ROTATIONS['kitten'];
              p.breed = rotation[idx % rotation.length];
            }
          } else if (p.type === 'bunny') {
            if (lowerName === 'hoppy') p.breed = 'holland-lop';
            else if (lowerName === 'clover') p.breed = 'snow-bunny';
            else {
              const rotation = BREED_ROTATIONS['bunny'];
              p.breed = rotation[idx % rotation.length];
            }
          } else if (p.type === 'bird') {
            if (lowerName === 'rio') p.breed = 'blue-macaw';
            else if (lowerName === 'pip') p.breed = 'cockatiel';
            else {
              const rotation = BREED_ROTATIONS['bird'];
              p.breed = rotation[idx % rotation.length];
            }
          } else {
            const rotation = BREED_ROTATIONS[p.type] || BREED_ROTATIONS['puppy'];
            p.breed = rotation[idx % rotation.length];
          }
        }
      });
    }

    // Ensure all pets have accessories array initialized
    if (loaded.rescuedPets && loaded.rescuedPets.length > 0) {
      loaded.rescuedPets.forEach((p) => {
        if (!Array.isArray(p.accessories)) {
          p.accessories = p.accessory && p.accessory !== 'none' ? [p.accessory] : [];
        }
        p.accessory = p.accessories.length > 0 ? p.accessories[0] : 'none';
      });
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
      puppy: ['Barnaby', 'Coco', 'Daisy', 'Milo', 'Teddy', 'Buster', 'Archie', 'Rocky'],
      kitten: ['Luna', 'Oliver', 'Cleo', 'Simba', 'Mochi', 'Bella', 'Jasper', 'Chloe'],
      bunny: ['Hoppy', 'Clover', 'Pip', 'Hazel', 'Bunbun', 'Sunny'],
      bird: ['Pip', 'Sky', 'Sunny', 'Rio', 'Mango', 'Chirpy'],
      unicorn: ['Sparkle', 'Starlight', 'Magic', 'Celeste', 'Nova'],
    };
    const names = petNames[rescuedPetType] || ['Cutie'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    // Select a unique breed not already used if possible
    const existingBreeds = state.rescuedPets.filter((p) => p.type === rescuedPetType).map((p) => p.breed);
    const rotation = BREED_ROTATIONS[rescuedPetType] || BREED_ROTATIONS['puppy'];
    const chosenBreed = rotation.find((b) => !existingBreeds.includes(b)) || rotation[existingBreeds.length % rotation.length];

    const newPet: PetData = {
      id: `${rescuedPetType}_${Date.now()}`,
      type: rescuedPetType,
      name: randomName,
      breed: chosenBreed,
      happiness: 90,
      accessory: 'none',
      accessories: [],
      rescuedAtLevel: level,
    };
    state.rescuedPets.push(newPet);
  }

  saveGameState(state);
  return state;
}

export function interactWithPet(
  petId: string,
  action: 'pet' | 'feed' | 'accessory' | 'wear_all' | 'unequip_all',
  accessory?: string
): GameState {
  const state = loadGameState();
  const pet = state.rescuedPets.find((p) => p.id === petId);
  if (!pet) return state;

  if (!Array.isArray(pet.accessories)) {
    pet.accessories = pet.accessory && pet.accessory !== 'none' ? [pet.accessory] : [];
  }

  if (action === 'pet') {
    pet.happiness = Math.min(100, pet.happiness + 10);
  } else if (action === 'feed') {
    if (state.coins >= 10) {
      state.coins -= 10;
      pet.happiness = Math.min(100, pet.happiness + 25);
    }
  } else if (action === 'accessory' && accessory) {
    if (accessory === 'none') {
      pet.accessories = [];
      pet.accessory = 'none';
    } else if (state.unlockedAccessories.includes(accessory)) {
      if (pet.accessories.includes(accessory)) {
        // Toggle off
        pet.accessories = pet.accessories.filter((a) => a !== accessory);
      } else {
        // Toggle on (stack)
        pet.accessories.push(accessory);
      }
      pet.accessory = pet.accessories[0] || 'none';
    }
  } else if (action === 'wear_all') {
    // Equip all unlocked accessories (excluding 'none')
    pet.accessories = state.unlockedAccessories.filter((a) => a !== 'none');
    pet.accessory = pet.accessories[0] || 'none';
  } else if (action === 'unequip_all') {
    pet.accessories = [];
    pet.accessory = 'none';
  }

  saveGameState(state);
  return state;
}

export function buyPet(petId: string): GameState {
  const state = loadGameState();
  if (!state.boughtPetIds) state.boughtPetIds = [];
  if (!state.boughtPetIds.includes(petId)) {
    state.boughtPetIds.push(petId);
  }
  const pet = state.rescuedPets.find((p) => p.id === petId);
  if (pet) {
    pet.happiness = 100;
  }
  saveGameState(state);
  return state;
}

export function isPetBought(state: GameState, petId: string): boolean {
  return Boolean(state.boughtPetIds && state.boughtPetIds.includes(petId));
}
