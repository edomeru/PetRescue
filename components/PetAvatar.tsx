import React from 'react';
import { PetData } from '../lib/gameState';

export interface BreedInfo {
  id: string;
  name: string;
  species: PetData['type'];
  description: string;
}

export const BREED_REGISTRY: Record<string, BreedInfo> = {
  // Dogs
  'shih-tzu': { id: 'shih-tzu', name: 'Shih Tzu', species: 'puppy', description: 'Fluffy & royal lap dog with cute topknot fur' },
  'pitbull': { id: 'pitbull', name: 'Pitbull', species: 'puppy', description: 'Sleek, muscular & super loving velvet hippo' },
  'chihuahua': { id: 'chihuahua', name: 'Chihuahua', species: 'puppy', description: 'Tiny body with huge perky ears & big bold heart' },
  'husky': { id: 'husky', name: 'Husky', species: 'puppy', description: 'Noble snow dog with striking icy blue eyes' },
  'golden-retriever': { id: 'golden-retriever', name: 'Golden Retriever', species: 'puppy', description: 'Sweet, loyal friend with a warm golden smile' },
  'corgi': { id: 'corgi', name: 'Corgi', species: 'puppy', description: 'Fox-like perky ears with joyful bouncing energy' },
  'dalmatian': { id: 'dalmatian', name: 'Dalmatian', species: 'puppy', description: 'Spotted adventure pup with stylish black markings' },
  'pug': { id: 'pug', name: 'Pug', species: 'puppy', description: 'Charming wrinkled face with soulful round eyes' },

  // Cats
  'siamese': { id: 'siamese', name: 'Siamese', species: 'kitten', description: 'Cream coat with dark mask & sapphire eyes' },
  'orange-tabby': { id: 'orange-tabby', name: 'Orange Tabby', species: 'kitten', description: 'Playful ginger striped kitty with emerald eyes' },
  'calico': { id: 'calico', name: 'Calico', species: 'kitten', description: 'Lucky tri-color patchwork of orange, black & white' },
  'persian': { id: 'persian', name: 'White Persian', species: 'kitten', description: 'Fluffy cloud coat with sweet doll-like face' },
  'black-cat': { id: 'black-cat', name: 'Midnight Cat', species: 'kitten', description: 'Sleek shadow feline with glowing yellow eyes' },
  'scottish-fold': { id: 'scottish-fold', name: 'Scottish Fold', species: 'kitten', description: 'Teddy-bear grey kitty with cute folded ears' },

  // Bunnies
  'holland-lop': { id: 'holland-lop', name: 'Holland Lop', species: 'bunny', description: 'Droopy floppy ears with sweet caramel fur' },
  'snow-bunny': { id: 'snow-bunny', name: 'Snow Bunny', species: 'bunny', description: 'Pure snowy white coat with soft pink ears' },
  'dutch-rabbit': { id: 'dutch-rabbit', name: 'Dutch Rabbit', species: 'bunny', description: 'Classic tuxedo masked pattern bunny' },
  'angora': { id: 'angora', name: 'Golden Angora', species: 'bunny', description: 'Ultra-fluffy cloud bunny with perky tufts' },

  // Birds
  'blue-macaw': { id: 'blue-macaw', name: 'Blue Macaw', species: 'bird', description: 'Vibrant cobalt blue & sunny golden feathers' },
  'cockatiel': { id: 'cockatiel', name: 'Cockatiel', species: 'bird', description: 'Yellow crest with cute blushing orange cheeks' },
  'toucan': { id: 'toucan', name: 'Rainbow Toucan', species: 'bird', description: 'Tropical black bird with magnificent rainbow bill' },
  'cardinal': { id: 'cardinal', name: 'Ruby Cardinal', species: 'bird', description: 'Brilliant scarlet plumage with handsome black mask' },

  // Unicorns
  'rainbow-alicorn': { id: 'rainbow-alicorn', name: 'Rainbow Alicorn', species: 'unicorn', description: 'Iridescent white with rainbow mane & golden horn' },
  'starlight-pegasus': { id: 'starlight-pegasus', name: 'Starlight Pegasus', species: 'unicorn', description: 'Midnight violet pony dusted with glowing stars' },
};

/**
 * Determine a unique breed for a pet deterministically based on ID, name, or index
 */
export function getPetBreed(pet: PetData, index: number = 0): BreedInfo {
  if (pet.breed && BREED_REGISTRY[pet.breed]) {
    return BREED_REGISTRY[pet.breed];
  }

  // Fallbacks: Map common pets in order matching user prompt:
  // e.g. Dogs: 1st dog -> shih-tzu, 2nd dog -> pitbull, 3rd dog -> chihuahua
  const breedsBySpecies: Record<PetData['type'], string[]> = {
    puppy: ['shih-tzu', 'pitbull', 'chihuahua', 'husky', 'golden-retriever', 'corgi', 'dalmatian', 'pug'],
    kitten: ['siamese', 'orange-tabby', 'calico', 'persian', 'black-cat', 'scottish-fold'],
    bunny: ['holland-lop', 'snow-bunny', 'dutch-rabbit', 'angora'],
    bird: ['blue-macaw', 'cockatiel', 'toucan', 'cardinal'],
    unicorn: ['rainbow-alicorn', 'starlight-pegasus'],
  };

  const pool = breedsBySpecies[pet.type] || breedsBySpecies['puppy'];

  // Match known names specifically
  const lowerName = pet.name.toLowerCase();
  if (pet.type === 'puppy') {
    if (lowerName === 'buddy') return BREED_REGISTRY['shih-tzu'];
    if (lowerName === 'barnaby') return BREED_REGISTRY['pitbull'];
    if (lowerName === 'milo') return BREED_REGISTRY['chihuahua'];
    if (lowerName === 'coco') return BREED_REGISTRY['husky'];
    if (lowerName === 'daisy') return BREED_REGISTRY['golden-retriever'];
  } else if (pet.type === 'kitten') {
    if (lowerName === 'luna') return BREED_REGISTRY['siamese'];
    if (lowerName === 'oliver') return BREED_REGISTRY['orange-tabby'];
    if (lowerName === 'cleo') return BREED_REGISTRY['calico'];
    if (lowerName === 'simba') return BREED_REGISTRY['persian'];
  } else if (pet.type === 'bunny') {
    if (lowerName === 'hoppy') return BREED_REGISTRY['holland-lop'];
    if (lowerName === 'clover') return BREED_REGISTRY['snow-bunny'];
  } else if (pet.type === 'bird') {
    if (lowerName === 'rio') return BREED_REGISTRY['blue-macaw'];
    if (lowerName === 'pip') return BREED_REGISTRY['cockatiel'];
  }

  // Hash id to pick a consistent breed
  let hash = 0;
  const str = pet.id || pet.name || String(index);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const chosenKey = pool[Math.abs(hash) % pool.length];
  return BREED_REGISTRY[chosenKey] || BREED_REGISTRY['shih-tzu'];
}

interface PetAvatarProps {
  pet: PetData;
  size?: number;
  showAccessory?: boolean;
  className?: string;
  index?: number;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({
  pet,
  size = 80,
  showAccessory = true,
  className = '',
  index = 0,
}) => {
  const breed = getPetBreed(pet, index);
  const activeAccessories: string[] = (pet as any).accessories && Array.isArray((pet as any).accessories) && (pet as any).accessories.length > 0
    ? (pet as any).accessories
    : (pet.accessory && pet.accessory !== 'none' ? [pet.accessory] : []);
  const hasAcc = (id: string) => activeAccessories.includes(id);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="shihTzuFur" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="60%" stopColor="#F5E6CA" />
            <stop offset="100%" stopColor="#DEBA85" />
          </radialGradient>
          <radialGradient id="shihTzuEar" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#C49A5A" />
            <stop offset="100%" stopColor="#8C6228" />
          </radialGradient>

          <radialGradient id="pitbullFur" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="65%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#334155" />
          </radialGradient>

          <radialGradient id="chihuahuaFur" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#FDE0A9" />
            <stop offset="60%" stopColor="#E0A96D" />
            <stop offset="100%" stopColor="#B4783E" />
          </radialGradient>
          <radialGradient id="chihuahuaEarInner" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="100%" stopColor="#F43F5E" />
          </radialGradient>

          <radialGradient id="huskyFur" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="60%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#334155" />
          </radialGradient>

          <radialGradient id="goldenFur" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>

          <radialGradient id="siameseFur" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#FAF7F2" />
            <stop offset="70%" stopColor="#E2D7C8" />
            <stop offset="100%" stopColor="#B8A490" />
          </radialGradient>
          <radialGradient id="siameseMask" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#4A3525" />
            <stop offset="100%" stopColor="#25160E" />
          </radialGradient>

          <radialGradient id="orangeTabbyFur" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="60%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </radialGradient>

          <radialGradient id="calicoFur" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </radialGradient>

          <radialGradient id="macawBlue" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="60%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </radialGradient>
          <radialGradient id="macawYellow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>

          <radialGradient id="cockatielGrey" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="70%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#334155" />
          </radialGradient>

          <radialGradient id="lopFur" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="60%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </radialGradient>

          <radialGradient id="snowBunnyFur" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="75%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </radialGradient>

          <radialGradient id="alicornMane" cx="0%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#38BDF8" />
          </radialGradient>
        </defs>

        {/* ──────── BREED SPECIFIC RENDERING ──────── */}

        {/* 1. SHIH TZU (Fluffy white/caramel fur, topknot tuft, side tufts) */}
        {breed.id === 'shih-tzu' && (
          <g>
            {/* Fluffy Drooping Ears */}
            <path d="M16 35 C10 45, 10 70, 24 75 C30 65, 26 42, 22 35 Z" fill="url(#shihTzuEar)" />
            <path d="M84 35 C90 45, 90 70, 76 75 C70 65, 74 42, 78 35 Z" fill="url(#shihTzuEar)" />
            {/* White ear fringe highlights */}
            <path d="M19 45 C15 55, 16 68, 24 72 C27 65, 25 50, 22 45 Z" fill="#FFFDF7" opacity="0.6" />
            <path d="M81 45 C85 55, 84 68, 76 72 C73 65, 75 50, 78 45 Z" fill="#FFFDF7" opacity="0.6" />

            {/* Fluffy Main Head */}
            <ellipse cx="50" cy="54" rx="34" ry="30" fill="url(#shihTzuFur)" />
            {/* Fluffy Cheeks Tufts */}
            <path d="M18 55 C12 58, 12 70, 22 72 C16 74, 18 82, 30 78 C25 82, 36 84, 45 81" fill="#FFFDF7" />
            <path d="M82 55 C88 58, 88 70, 78 72 C84 74, 82 82, 70 78 C75 82, 64 84, 55 81" fill="#FFFDF7" />

            {/* Eye patches (caramel spots) */}
            <ellipse cx="36" cy="50" rx="9" ry="8" fill="#C49A5A" opacity="0.75" />
            <ellipse cx="64" cy="50" rx="9" ry="8" fill="#C49A5A" opacity="0.75" />

            {/* Eyes */}
            <circle cx="36" cy="51" r="5" fill="#1C1917" />
            <circle cx="34.5" cy="49.5" r="1.8" fill="#FFFFFF" />
            <circle cx="64" cy="51" r="5" fill="#1C1917" />
            <circle cx="62.5" cy="49.5" r="1.8" fill="#FFFFFF" />

            {/* White snout with black button nose */}
            <ellipse cx="50" cy="64" rx="14" ry="10" fill="#FFFDF7" />
            <path d="M46 60 Q50 58 54 60 Q50 65 46 60 Z" fill="#1C1917" />
            <path d="M50 63.5 L50 66 Q46 68 44 66.5 M50 66 Q54 68 56 66.5" stroke="#1C1917" strokeWidth="1.2" fill="none" />
            {/* Cute pink tongue blep */}
            <path d="M48 66 Q50 71 52 66 Z" fill="#F43F5E" />

            {/* Topknot fur tied up with cute ribbon */}
            <path d="M46 25 C43 15, 57 15, 54 25 C58 20, 62 26, 56 29 C50 30, 44 29, 46 25 Z" fill="url(#shihTzuFur)" />
            {/* Ribbon */}
            <circle cx="50" cy="27" r="3.5" fill="#EC4899" />
            <polygon points="46,27 41,23 43,29" fill="#F43F5E" />
            <polygon points="54,27 59,23 57,29" fill="#F43F5E" />
          </g>
        )}

        {/* 2. PITBULL (Muscular broad head, slate-blue coat, wide happy grin, folded ears) */}
        {breed.id === 'pitbull' && (
          <g>
            {/* Folded triangular ears on top sides */}
            <polygon points="20,38 12,20 30,26" fill="#334155" />
            <polygon points="22,34 16,24 28,28" fill="#FDA4AF" opacity="0.6" />
            <polygon points="80,38 88,20 70,26" fill="#334155" />
            <polygon points="78,34 84,24 72,28" fill="#FDA4AF" opacity="0.6" />

            {/* Broad muscular head with defined cheeks */}
            <path d="M22 45 C18 65, 30 82, 50 84 C70 82, 82 65, 78 45 C75 30, 25 30, 22 45 Z" fill="url(#pitbullFur)" />

            {/* Distinct white chest / throat blaze extending up */}
            <path d="M44 83 C47 70, 45 62, 50 62 C55 62, 53 70, 56 83 C52 84, 48 84, 44 83 Z" fill="#F8FAFC" />
            <path d="M48 35 Q50 33 52 35 L51 46 Q50 47 49 46 Z" fill="#F8FAFC" opacity="0.8" />

            {/* Eyes — warm loyal & expressive with slight brow ridge */}
            <path d="M30 43 Q36 41 42 45" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="36" cy="48" r="5" fill="#451A03" />
            <circle cx="34.5" cy="46.5" r="1.8" fill="#FFFFFF" />

            <path d="M70 43 Q64 41 58 45" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="64" cy="48" r="5" fill="#451A03" />
            <circle cx="62.5" cy="46.5" r="1.8" fill="#FFFFFF" />

            {/* Broad pitbull snout and wide famous pibble smile! */}
            <ellipse cx="50" cy="62" rx="16" ry="11" fill="#475569" />
            <path d="M44 58 Q50 56 56 58 Q50 64 44 58 Z" fill="#0F172A" />
            {/* Big happy open mouth grin */}
            <path d="M34 65 Q50 78 66 65" stroke="#0F172A" strokeWidth="2.2" fill="#E11D48" />
            <path d="M44 69 Q50 75 56 69" fill="#FB7185" />
          </g>
        )}

        {/* 3. CHIHUAHUA (Giant perky bat ears, caramel coat, big glossy eyes, dainty snout) */}
        {breed.id === 'chihuahua' && (
          <g>
            {/* HUGE iconic upright pointed bat ears */}
            <path d="M12 45 C4 18, 25 10, 36 28 C28 32, 20 40, 12 45 Z" fill="url(#chihuahuaFur)" />
            <path d="M16 40 C10 22, 24 16, 32 30 C26 34, 21 38, 16 40 Z" fill="url(#chihuahuaEarInner)" opacity="0.75" />

            <path d="M88 45 C96 18, 75 10, 64 28 C72 32, 80 40, 88 45 Z" fill="url(#chihuahuaFur)" />
            <path d="M84 40 C90 22, 76 16, 68 30 C74 34, 79 38, 84 40 Z" fill="url(#chihuahuaEarInner)" opacity="0.75" />

            {/* Apple-domed head shape */}
            <ellipse cx="50" cy="54" rx="28" ry="26" fill="url(#chihuahuaFur)" />
            {/* White face blaze and cheeks */}
            <path d="M48 38 Q50 35 52 38 L51 55 Q50 56 49 55 Z" fill="#FFFBEB" opacity="0.8" />
            <ellipse cx="50" cy="66" rx="14" ry="10" fill="#FFFBEB" />

            {/* Giant shiny soulful expressive dark eyes */}
            <circle cx="36" cy="50" r="7.5" fill="#1C1917" />
            <circle cx="34" cy="47.5" r="2.8" fill="#FFFFFF" />
            <circle cx="38" cy="52" r="1.2" fill="#FFFFFF" />

            <circle cx="64" cy="50" r="7.5" fill="#1C1917" />
            <circle cx="62" cy="47.5" r="2.8" fill="#FFFFFF" />
            <circle cx="66" cy="52" r="1.2" fill="#FFFFFF" />

            {/* Dainty little black nose and mouth */}
            <ellipse cx="50" cy="62" rx="3.5" ry="2.5" fill="#1C1917" />
            <path d="M50 64.5 L50 67 Q47 69 45 67.5 M50 67 Q53 69 55 67.5" stroke="#1C1917" strokeWidth="1.2" fill="none" />
          </g>
        )}

        {/* 4. HUSKY (Noble wolf-like mask, icy blue eyes, erect ears) */}
        {breed.id === 'husky' && (
          <g>
            {/* Pointed erect triangular ears */}
            <polygon points="26,38 18,12 38,24" fill="#1E293B" />
            <polygon points="27,34 22,18 35,26" fill="#FDA4AF" opacity="0.6" />
            <polygon points="74,38 82,12 62,24" fill="#1E293B" />
            <polygon points="73,34 78,18 65,26" fill="#FDA4AF" opacity="0.6" />

            {/* Head */}
            <ellipse cx="50" cy="54" rx="32" ry="28" fill="url(#huskyFur)" />
            {/* White face mask & muzzle */}
            <path d="M26 50 C26 72, 38 82, 50 82 C62 82, 74 72, 74 50 C68 45, 60 52, 50 44 C40 52, 32 45, 26 50 Z" fill="#FFFFFF" />

            {/* Striking ICY BLUE eyes */}
            <circle cx="37" cy="50" r="5" fill="#0284C7" />
            <circle cx="37" cy="50" r="3" fill="#38BDF8" />
            <circle cx="37" cy="50" r="1.5" fill="#0F172A" />
            <circle cx="35.5" cy="48.5" r="1.2" fill="#FFFFFF" />

            <circle cx="63" cy="50" r="5" fill="#0284C7" />
            <circle cx="63" cy="50" r="3" fill="#38BDF8" />
            <circle cx="63" cy="50" r="1.5" fill="#0F172A" />
            <circle cx="61.5" cy="48.5" r="1.2" fill="#FFFFFF" />

            {/* Black husky nose */}
            <polygon points="46,61 54,61 50,67" fill="#0F172A" />
            <path d="M50 67 Q47 70 44 68 M50 67 Q53 70 56 68" stroke="#0F172A" strokeWidth="1.5" fill="none" />
          </g>
        )}

        {/* 5. GOLDEN RETRIEVER (Rich golden honey fur, floppy soft ears, happy tongue) */}
        {breed.id === 'golden-retriever' && (
          <g>
            {/* Drooping soft golden ears */}
            <path d="M18 36 C10 48, 12 72, 24 74 C30 65, 28 44, 24 36 Z" fill="url(#goldenFur)" />
            <path d="M82 36 C90 48, 88 72, 76 74 C70 65, 72 44, 76 36 Z" fill="url(#goldenFur)" />

            {/* Head */}
            <ellipse cx="50" cy="52" rx="32" ry="28" fill="url(#goldenFur)" />

            {/* Kind brown eyes */}
            <circle cx="37" cy="47" r="5" fill="#451A03" />
            <circle cx="35.5" cy="45.5" r="1.8" fill="#FFFFFF" />
            <circle cx="63" cy="47" r="5" fill="#451A03" />
            <circle cx="61.5" cy="45.5" r="1.8" fill="#FFFFFF" />

            {/* Cream muzzle & happy panting mouth */}
            <ellipse cx="50" cy="62" rx="15" ry="11" fill="#FEF08A" />
            <path d="M45 57 Q50 55 55 57 Q50 62 45 57 Z" fill="#1C1917" />
            <path d="M44 63 Q50 74 56 63" stroke="#1C1917" strokeWidth="1.8" fill="#F43F5E" />
            <path d="M47 67 Q50 75 53 67" fill="#FB7185" />
          </g>
        )}

        {/* 6. CORGI (Fox-like perky ears, orange-white coat, laughing face) */}
        {breed.id === 'corgi' && (
          <g>
            {/* Huge upright fox ears with white ear fluff */}
            <polygon points="18,44 14,14 38,28" fill="#EA580C" />
            <polygon points="20,40 18,20 34,30" fill="#FED7AA" />
            <polygon points="82,44 86,14 62,28" fill="#EA580C" />
            <polygon points="80,40 82,20 66,30" fill="#FED7AA" />

            <ellipse cx="50" cy="54" rx="30" ry="26" fill="#EA580C" />
            {/* White face blaze and cheeks */}
            <path d="M48 35 Q50 32 52 35 L52 50 Q58 52 66 60 C66 74, 34 74, 34 60 Q42 52 48 50 Z" fill="#FFFFFF" />

            <circle cx="36" cy="49" r="4.5" fill="#1C1917" />
            <circle cx="34.5" cy="47.5" r="1.6" fill="#FFFFFF" />
            <circle cx="64" cy="49" r="4.5" fill="#1C1917" />
            <circle cx="62.5" cy="47.5" r="1.6" fill="#FFFFFF" />

            <ellipse cx="50" cy="61" rx="4" ry="2.8" fill="#1C1917" />
            <path d="M44 64 Q50 72 56 64" stroke="#1C1917" strokeWidth="1.6" fill="#F43F5E" />
          </g>
        )}

        {/* 7. DALMATIAN (White coat with black spots, spotted ears) */}
        {breed.id === 'dalmatian' && (
          <g>
            {/* Black-spotted drooping ears */}
            <path d="M18 36 C10 48, 12 72, 24 74 C30 65, 28 44, 24 36 Z" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="18" cy="55" r="3.5" fill="#0F172A" />
            <circle cx="21" cy="65" r="2.5" fill="#0F172A" />
            <path d="M82 36 C90 48, 88 72, 76 74 C70 65, 72 44, 76 36 Z" fill="#0F172A" />

            {/* Head */}
            <ellipse cx="50" cy="52" rx="32" ry="28" fill="#F8FAFC" />
            {/* Distinct Dalmatian spots */}
            <circle cx="32" cy="38" r="3" fill="#0F172A" />
            <circle cx="68" cy="36" r="3.5" fill="#0F172A" />
            <circle cx="48" cy="32" r="2" fill="#0F172A" />
            <ellipse cx="64" cy="48" rx="8" ry="7" fill="#0F172A" opacity="0.8" /> {/* Eye patch */}

            {/* Eyes */}
            <circle cx="36" cy="48" r="4.5" fill="#1C1917" />
            <circle cx="34.5" cy="46.5" r="1.6" fill="#FFFFFF" />
            <circle cx="64" cy="48" r="4.5" fill="#FFFFFF" />
            <circle cx="64" cy="48" r="3.2" fill="#1C1917" />
            <circle cx="63" cy="47" r="1.2" fill="#FFFFFF" />

            <ellipse cx="50" cy="62" rx="4.5" ry="3" fill="#0F172A" />
            <path d="M46 65 Q50 69 54 65" stroke="#0F172A" strokeWidth="1.6" fill="none" />
          </g>
        )}

        {/* 8. PUG (Wrinkled fawn brow, dark mask, huge round eyes) */}
        {breed.id === 'pug' && (
          <g>
            {/* Folded black button ears */}
            <polygon points="20,40 14,24 32,28" fill="#1C1917" />
            <polygon points="80,40 86,24 68,28" fill="#1C1917" />

            <ellipse cx="50" cy="54" rx="32" ry="27" fill="#E2C799" />
            {/* Forehead wrinkles */}
            <path d="M42 34 Q50 31 58 34" stroke="#785A3C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M40 38 Q50 35 60 38" stroke="#785A3C" strokeWidth="1.8" strokeLinecap="round" fill="none" />

            {/* Black pug muzzle mask */}
            <ellipse cx="50" cy="63" rx="16" ry="12" fill="#1C1917" />

            {/* Huge expressive pug eyes */}
            <circle cx="34" cy="48" r="7" fill="#0F172A" />
            <circle cx="32" cy="45.5" r="2.5" fill="#FFFFFF" />
            <circle cx="66" cy="48" r="7" fill="#0F172A" />
            <circle cx="64" cy="45.5" r="2.5" fill="#FFFFFF" />

            <ellipse cx="50" cy="61" rx="4.5" ry="3" fill="#292524" />
            <path d="M46 65 Q50 68 54 65" stroke="#44403C" strokeWidth="1.5" fill="#F43F5E" />
          </g>
        )}

        {/* ──────── CATS ──────── */}

        {/* SIAMESE CAT (Cream coat, espresso chocolate mask & ears, sapphire eyes) */}
        {breed.id === 'siamese' && (
          <g>
            {/* Dark pointed ears */}
            <polygon points="20,42 16,14 40,28" fill="#25160E" />
            <polygon points="22,38 20,20 36,30" fill="#FDA4AF" opacity="0.4" />
            <polygon points="80,42 84,14 60,28" fill="#25160E" />
            <polygon points="78,38 80,20 64,30" fill="#FDA4AF" opacity="0.4" />

            {/* Cream body / head */}
            <ellipse cx="50" cy="53" rx="30" ry="26" fill="url(#siameseFur)" />

            {/* Espresso face mask */}
            <ellipse cx="50" cy="55" rx="18" ry="15" fill="url(#siameseMask)" />

            {/* Striking SAPPHIRE BLUE eyes */}
            <ellipse cx="37" cy="48" rx="6" ry="5" fill="#0284C7" />
            <ellipse cx="37" cy="48" rx="3.5" ry="4.5" fill="#0C4A6E" />
            <circle cx="35.5" cy="46.5" r="1.5" fill="#FFFFFF" />

            <ellipse cx="63" cy="48" rx="6" ry="5" fill="#0284C7" />
            <ellipse cx="63" cy="48" rx="3.5" ry="4.5" fill="#0C4A6E" />
            <circle cx="61.5" cy="46.5" r="1.5" fill="#FFFFFF" />

            {/* Snout & Whiskers */}
            <polygon points="48,58 52,58 50,61" fill="#FDA4AF" />
            <path d="M50 61 Q47 64 44 62 M50 61 Q53 64 56 62" stroke="#FDA4AF" strokeWidth="1.2" fill="none" />
            {/* Whiskers */}
            <line x1="28" y1="58" x2="14" y2="55" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
            <line x1="28" y1="62" x2="12" y2="63" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
            <line x1="72" y1="58" x2="86" y2="55" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
            <line x1="72" y1="62" x2="88" y2="63" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
          </g>
        )}

        {/* ORANGE TABBY (Ginger striped fur, emerald eyes, white chin) */}
        {breed.id === 'orange-tabby' && (
          <g>
            <polygon points="20,42 16,14 40,28" fill="#C2410C" />
            <polygon points="22,38 20,20 36,30" fill="#FED7AA" />
            <polygon points="80,42 84,14 60,28" fill="#C2410C" />
            <polygon points="78,38 80,20 64,30" fill="#FED7AA" />

            <ellipse cx="50" cy="53" rx="30" ry="26" fill="url(#orangeTabbyFur)" />

            {/* Tabby forehead 'M' mark & cheek stripes */}
            <path d="M42 32 L46 39 L50 34 L54 39 L58 32" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M22 50 L30 52 M22 55 L32 56" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M78 50 L70 52 M78 55 L68 56" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" />

            {/* Glowing Emerald Green eyes */}
            <ellipse cx="37" cy="48" rx="6" ry="5.5" fill="#10B981" />
            <ellipse cx="37" cy="48" rx="2.5" ry="5" fill="#064E3B" />
            <circle cx="35.5" cy="46" r="1.5" fill="#FFFFFF" />

            <ellipse cx="63" cy="48" rx="6" ry="5.5" fill="#10B981" />
            <ellipse cx="63" cy="48" rx="2.5" ry="5" fill="#064E3B" />
            <circle cx="61.5" cy="46" r="1.5" fill="#FFFFFF" />

            {/* White muzzle & pink nose */}
            <ellipse cx="50" cy="63" rx="11" ry="8" fill="#FFF7ED" />
            <polygon points="48,59 52,59 50,62" fill="#F43F5E" />
            <path d="M50 62 Q47 65 44 63.5 M50 62 Q53 65 56 63.5" stroke="#7C2D12" strokeWidth="1.2" fill="none" />
          </g>
        )}

        {/* CALICO CAT (Patchwork ginger, black, white) */}
        {breed.id === 'calico' && (
          <g>
            <polygon points="20,42 16,14 40,28" fill="#1C1917" />
            <polygon points="80,42 84,14 60,28" fill="#EA580C" />

            <ellipse cx="50" cy="53" rx="30" ry="26" fill="url(#calicoFur)" />
            {/* Ginger patch on left cheek & black patch on right brow */}
            <path d="M20 45 C20 65, 34 68, 38 52 C32 40, 22 40, 20 45 Z" fill="#EA580C" />
            <path d="M60 35 C75 35, 78 50, 72 58 C65 55, 58 45, 60 35 Z" fill="#1C1917" />

            {/* Amber gold eyes */}
            <ellipse cx="37" cy="48" rx="5.5" ry="5" fill="#F59E0B" />
            <ellipse cx="37" cy="48" rx="2.2" ry="4.5" fill="#1C1917" />
            <circle cx="35.5" cy="46" r="1.5" fill="#FFFFFF" />

            <ellipse cx="63" cy="48" rx="5.5" ry="5" fill="#F59E0B" />
            <ellipse cx="63" cy="48" rx="2.2" ry="4.5" fill="#1C1917" />
            <circle cx="61.5" cy="46" r="1.5" fill="#FFFFFF" />

            <polygon points="48,59 52,59 50,62" fill="#FB7185" />
          </g>
        )}

        {/* ──────── BUNNIES ──────── */}

        {/* HOLLAND LOP (Drooping ears, caramel coat) */}
        {breed.id === 'holland-lop' && (
          <g>
            {/* Long droopy ears hanging alongside cheeks */}
            <path d="M18 35 C10 45, 8 78, 22 84 C28 72, 26 45, 22 35 Z" fill="url(#lopFur)" />
            <path d="M82 35 C90 45, 92 78, 78 84 C72 72, 74 45, 78 35 Z" fill="url(#lopFur)" />

            <ellipse cx="50" cy="54" rx="28" ry="26" fill="url(#lopFur)" />
            <circle cx="38" cy="49" r="4.5" fill="#451A03" />
            <circle cx="36.5" cy="47.5" r="1.5" fill="#FFFFFF" />
            <circle cx="62" cy="49" r="4.5" fill="#451A03" />
            <circle cx="60.5" cy="47.5" r="1.5" fill="#FFFFFF" />

            {/* Twitching pink bunny nose */}
            <polygon points="48,60 52,60 50,63" fill="#FDA4AF" />
            <path d="M50 63 Q47 66 45 64 M50 63 Q53 66 55 64" stroke="#92400E" strokeWidth="1.2" fill="none" />
          </g>
        )}

        {/* SNOW BUNNY (Tall upright pink ears, snowy white fur, ruby eyes) */}
        {breed.id === 'snow-bunny' && (
          <g>
            {/* Tall upright bunny ears */}
            <ellipse cx="36" cy="22" rx="8" ry="18" fill="url(#snowBunnyFur)" />
            <ellipse cx="36" cy="22" rx="4.5" ry="13" fill="#FDA4AF" />
            <ellipse cx="64" cy="22" rx="8" ry="18" fill="url(#snowBunnyFur)" />
            <ellipse cx="64" cy="22" rx="4.5" ry="13" fill="#FDA4AF" />

            <ellipse cx="50" cy="54" rx="28" ry="26" fill="url(#snowBunnyFur)" />
            <circle cx="38" cy="49" r="4.5" fill="#E11D48" />
            <circle cx="36.5" cy="47.5" r="1.5" fill="#FFFFFF" />
            <circle cx="62" cy="49" r="4.5" fill="#E11D48" />
            <circle cx="60.5" cy="47.5" r="1.5" fill="#FFFFFF" />

            <polygon points="48,59 52,59 50,62" fill="#F43F5E" />
          </g>
        )}

        {/* ──────── BIRDS ──────── */}

        {/* BLUE MACAW (Cobalt blue & yellow feathers, curved black beak) */}
        {breed.id === 'blue-macaw' && (
          <g>
            {/* Cobalt head & sunny belly */}
            <circle cx="50" cy="50" r="30" fill="url(#macawBlue)" />
            <path d="M26 50 C26 72, 40 78, 50 78 C60 78, 74 72, 74 50 Z" fill="url(#macawYellow)" />
            {/* White facial skin patch */}
            <ellipse cx="42" cy="46" rx="9" ry="8" fill="#FFFFFF" />

            <circle cx="42" cy="46" r="4" fill="#1C1917" />
            <circle cx="40.5" cy="44.5" r="1.3" fill="#FFFFFF" />

            {/* Large curved black beak */}
            <path d="M48 45 Q64 47 62 60 Q50 63 46 54 Z" fill="#0F172A" />
            <path d="M48 54 Q56 55 54 62 Q50 62 48 56 Z" fill="#334155" />
          </g>
        )}

        {/* COCKATIEL (Yellow crest, orange cheek blush, soft grey feathers) */}
        {breed.id === 'cockatiel' && (
          <g>
            {/* Yellow crest feathers */}
            <path d="M50 28 Q44 6 56 12 Q52 22 54 28" fill="#FDE047" />
            <path d="M46 30 Q38 12 48 18 Q46 25 48 30" fill="#FACC15" />

            <circle cx="50" cy="54" r="28" fill="url(#cockatielGrey)" />
            <circle cx="50" cy="48" r="20" fill="#FEF08A" />

            {/* Iconic orange blush cheek patches! */}
            <circle cx="34" cy="52" r="6" fill="#F97316" />
            <circle cx="66" cy="52" r="6" fill="#F97316" />

            <circle cx="42" cy="46" r="3.5" fill="#1C1917" />
            <circle cx="41" cy="45" r="1" fill="#FFFFFF" />
            <circle cx="58" cy="46" r="3.5" fill="#1C1917" />
            <circle cx="57" cy="45" r="1" fill="#FFFFFF" />

            <polygon points="47,48 53,48 50,56" fill="#94A3B8" />
          </g>
        )}

        {/* ──────── UNICORN ──────── */}
        {breed.species === 'unicorn' && (
          <g>
            <ellipse cx="50" cy="55" rx="28" ry="26" fill="#FAF5FF" />
            {/* Flowing rainbow mane */}
            <path d="M24 38 Q18 20 30 26 Q24 40 28 50" fill="url(#alicornMane)" />
            <path d="M28 48 Q20 58 32 68 Q28 58 32 50" fill="#EC4899" />

            {/* Glowing Golden Spiral Horn */}
            <polygon points="46,30 54,30 50,4" fill="#F59E0B" />
            <path d="M47 24 L52 22 M48 16 L51 14 M49 9 L51 8" stroke="#FEF08A" strokeWidth="1.5" />

            {/* Anime Sparkle Eyes */}
            <ellipse cx="40" cy="52" rx="5" ry="6" fill="#7C3AED" />
            <circle cx="38.5" cy="50" r="2" fill="#FFFFFF" />
            <circle cx="41" cy="54" r="1" fill="#FFFFFF" />

            <ellipse cx="62" cy="52" rx="5" ry="6" fill="#7C3AED" />
            <circle cx="60.5" cy="50" r="2" fill="#FFFFFF" />
            <circle cx="63" cy="54" r="1" fill="#FFFFFF" />

            <circle cx="48" cy="62" r="1.5" fill="#E9D5FF" />
            <circle cx="54" cy="62" r="1.5" fill="#E9D5FF" />
          </g>
        )}

        {/* ──────── ACCESSORY OVERLAYS ──────── */}
        {showAccessory && activeAccessories.length > 0 && (
          <g className="animate-bounce-short">
            {/* 1. BOW: Cute pink ribbon bow */}
            {hasAcc('bow') && (
              <g transform="translate(62, 22)">
                <ellipse cx="0" cy="0" rx="3" ry="3" fill="#DB2777" />
                <path d="M0 0 C-10 -8, -10 8, 0 0 Z" fill="#F43F5E" />
                <path d="M0 0 C10 -8, 10 8, 0 0 Z" fill="#F43F5E" />
                <circle cx="0" cy="0" r="2.5" fill="#FECDD3" />
              </g>
            )}

            {/* 2. HAT: Dapper top hat */}
            {hasAcc('hat') && (
              <g transform="translate(50, 16)">
                {/* Hat brim */}
                <ellipse cx="0" cy="8" rx="20" ry="4" fill="#0F172A" />
                {/* Hat cylinder */}
                <path d="M-12 8 L-10 -12 L10 -12 L12 8 Z" fill="#1E293B" />
                {/* Golden ribbon */}
                <path d="M-11.5 5 L-11.2 8 L11.2 8 L11.5 5 Z" fill="#F59E0B" />
              </g>
            )}

            {/* 3. GLASSES: Cool dark sunglasses */}
            {hasAcc('glasses') && (
              <g transform="translate(50, 48)">
                <rect x="-24" y="-7" width="20" height="14" rx="4" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                <rect x="4" y="-7" width="20" height="14" rx="4" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                <line x1="-4" y1="-1" x2="4" y2="-1" stroke="#F59E0B" strokeWidth="2" />
                {/* Glare reflections */}
                <line x1="-20" y1="-4" x2="-8" y2="4" stroke="#94A3B8" strokeWidth="1.5" opacity="0.6" />
                <line x1="8" y1="-4" x2="20" y2="4" stroke="#94A3B8" strokeWidth="1.5" opacity="0.6" />
              </g>
            )}

            {/* 3b. SUNGLASSES: Cool shades */}
            {hasAcc('sunglasses') && (
              <g transform="translate(50, 48)">
                <rect x="-24" y="-7" width="20" height="14" rx="4" fill="#111827" stroke="#6366F1" strokeWidth="1.5" />
                <rect x="4" y="-7" width="20" height="14" rx="4" fill="#111827" stroke="#6366F1" strokeWidth="1.5" />
                <line x1="-4" y1="-1" x2="4" y2="-1" stroke="#6366F1" strokeWidth="2" />
                <line x1="-20" y1="-4" x2="-10" y2="2" stroke="white" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
                <line x1="8" y1="-4" x2="18" y2="2" stroke="white" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
              </g>
            )}

            {/* 4. CROWN: Royal glittering gold crown */}
            {hasAcc('crown') && (
              <g transform="translate(50, 14)">
                <path d="M-16 10 L-18 -4 L-7 3 L0 -8 L7 3 L18 -4 L16 10 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                {/* Jewels */}
                <circle cx="-16" cy="-4" r="2" fill="#EF4444" />
                <circle cx="0" cy="-8" r="2.5" fill="#3B82F6" />
                <circle cx="16" cy="-4" r="2" fill="#10B981" />
                <rect x="-14" y="6" width="28" height="3" fill="#FEF08A" rx="1.5" />
              </g>
            )}

            {/* 5. SCARF: Cozy knitted scarf */}
            {hasAcc('scarf') && (
              <g transform="translate(50, 78)">
                <path d="M-22 0 Q0 8 22 0 Q0 -5 -22 0 Z" fill="#EF4444" />
                <path d="M12 0 Q18 8 16 22" stroke="#EF4444" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M-18 0 Q0 6 18 0" stroke="#FCA5A5" strokeWidth="1.2" fill="none" />
              </g>
            )}

            {/* 6. CAPE: Superhero collar & clasp */}
            {hasAcc('cape') && (
              <g transform="translate(50, 80)">
                <path d="M-28 -4 Q0 12 28 -4 L24 16 Q0 22 -24 16 Z" fill="#7C3AED" />
                <circle cx="0" cy="4" r="3.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
              </g>
            )}

            {/* 7a. T-SHIRT */}
            {hasAcc('tshirt') && (
              <g transform="translate(50, 84)">
                <path
                  d="M-24 -4 Q0 10 24 -4 L20 14 Q0 18 -20 14 Z"
                  fill="#10B981"
                  stroke="#059669"
                  strokeWidth="1"
                />
                <text x="0" y="8" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">★</text>
              </g>
            )}

            {/* 7b. JACKET */}
            {hasAcc('jacket') && (
              <g transform="translate(50, 84)">
                <path
                  d="M-24 -4 Q0 10 24 -4 L20 14 Q0 18 -20 14 Z"
                  fill="#1E293B"
                  stroke="#475569"
                  strokeWidth="1"
                />
                <line x1="0" y1="-2" x2="0" y2="14" stroke="#F59E0B" strokeWidth="1" />
              </g>
            )}

            {/* 7c. HOODIE */}
            {hasAcc('hoodie') && (
              <g transform="translate(50, 84)">
                <path
                  d="M-24 -4 Q0 10 24 -4 L20 14 Q0 18 -20 14 Z"
                  fill="#7C3AED"
                  stroke="#6D28D9"
                  strokeWidth="1"
                />
                <path d="M-6 -2 Q0 2 6 -2" stroke="#DDD6FE" strokeWidth="1" fill="none" />
              </g>
            )}

            {/* 8. SNEAKERS: Sporty badge */}
            {hasAcc('shoes') && (
              <g transform="translate(74, 76)">
                <ellipse cx="0" cy="0" rx="9" ry="5.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="1" />
                <ellipse cx="0" cy="3" rx="9" ry="2.5" fill="#FFFFFF" />
                <line x1="-5" y1="-1" x2="5" y2="-1" stroke="white" strokeWidth="1.2" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
