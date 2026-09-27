import * as Phaser from 'phaser';
import { soundFX } from '../audio/SoundFX';
import { LevelConfig, LEVEL_CONFIGS, getWorldForLevel, getPetForLevel } from '../levelConfigs';

export type TileType = 'color' | 'pet' | 'ice' | 'cage' | 'chocolate';

export interface TileData {
  id: string;
  type: TileType;
  colorIndex: number; // 0 to 4
  petType?: string;
  gridX: number;
  gridY: number;
  sprite?: Phaser.GameObjects.Container;
  isObstacle?: boolean;
}

const COLOR_PALETTE = [
  0xFF5370, // Pink
  0x6C5CE7, // Purple
  0x45AAF2, // Blue
  0xFFA502, // Yellow
  0x2ED573, // Green
];

export type GameStateChangeCallback = (data: {
  score: number;
  movesLeft: number;
  petsRescued: number;
  petsToRescue: number;
  isGameOver: boolean;
  isVictory: boolean;
}) => void;

export class MainGameScene extends Phaser.Scene {
  private config!: LevelConfig;
  private grid: (TileData | null)[][] = [];
  private tileSize = 80;
  private offsetX = 0;
  private offsetY = 0;
  
  private score = 0;
  private movesLeft = 0;
  private petsRescued = 0;
  private activeBooster: string | null = null;
  private isProcessing = false;

  private onGameStateChange?: GameStateChangeCallback;
  private onBoosterUsed?: (boosterType: string) => void;
  private openDoorX = 0;
  private openDoorY = 0;

  constructor() {
    super({ key: 'MainGameScene' });
  }

  public init(data: { levelConfig: LevelConfig; onGameStateChange?: GameStateChangeCallback; onBoosterUsed?: (boosterType: string) => void }) {
    this.config = data.levelConfig || LEVEL_CONFIGS[1];
    this.onGameStateChange = data.onGameStateChange;
    this.onBoosterUsed = data.onBoosterUsed;
    this.score = 0;
    this.movesLeft = this.config.moves;
    this.petsRescued = 0;
    this.activeBooster = null;
    this.isProcessing = false;
  }

  public preload() {
    this.load.image('bg_world_1', '/images/jungle_bg.jpg');
    this.load.image('bg_world_2', '/images/candy_bg.jpg');
    this.load.image('bg_world_3', '/images/beach_bg.jpg');
    this.load.image('bg_world_4', '/images/snow_bg.jpg');
    this.load.image('bg_world_5', '/images/cosmic_bg.jpg');
    this.load.image('bg_world_6', '/images/volcano_bg.jpg');
    this.load.image('bg_world_7', '/images/fairy_bg.jpg');
    this.load.image('bg_world_8', '/images/desert_bg.jpg');
    this.load.image('bg_world_9', '/images/sky_bg.jpg');
    this.load.image('bg_world_10', '/images/palace_bg.jpg');

    this.load.image('img_piggy', '/images/tiles/tile_piggy.jpg');
    this.load.image('img_kitty', '/images/tiles/tile_kitty.jpg');
    this.load.image('img_doggy', '/images/tiles/tile_doggy.jpg');
    this.load.image('img_chick', '/images/tiles/tile_chick.jpg');
    this.load.image('img_froggy', '/images/tiles/tile_froggy.jpg');
    this.generateProceduralTextures();
  }

  public create() {
    const { width, height } = this.scale;
    const worldTheme = getWorldForLevel(this.config.level);
    const bgKey = `bg_world_${worldTheme.id}`;

    // 1. Render World Background Image & World Tint Overlay
    if (this.textures.exists(bgKey)) {
      const bg = this.add.image(width / 2, height / 2, bgKey);
      const scaleX = width / bg.width;
      const scaleY = height / bg.height;
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale).setScrollFactor(0);
    }

    const worldTintColors: Record<number, number> = {
      1: 0x064e3b, // Jungle Sanctuary
      2: 0x831843, // Candy Kingdom
      3: 0x0891b2, // Coral Beach
      4: 0x1e3a8a, // Frozen Tundra
      5: 0x581c87, // Cosmic Galaxy
      6: 0x7c2d12, // Volcanic Peak
      7: 0x14532d, // Fairy Forest
      8: 0x78350f, // Desert Oasis
      9: 0x0369a1, // Sky Island
      10: 0x4c1d95, // Royal Palace
    };
    const tintColor = worldTintColors[worldTheme.id] || 0x064e3b;

    // Calculate grid layout offset (positioned for board + house at bottom)
    const boardWidth = this.config.cols * this.tileSize;
    const boardHeight = this.config.rows * this.tileSize;
    this.offsetX = Math.floor((width - boardWidth) / 2);
    this.offsetY = 14;

    const worldBoardStyles: Record<number, {
      outerGlow: number;
      frameShadow: number;
      frameMain: number;
      frameBorder: number;
      innerBacking: number;
      cellMain: number;
      cellAlt: number;
      cellBorder: number;
      rescueZoneFill: number;
      rescueZoneBorder: number;
    }> = {
      1: { // 🌿 World 1: Jungle Sanctuary
        outerGlow: 0x10b981,
        frameShadow: 0x064e3b,
        frameMain: 0x8c5319,
        frameBorder: 0xd99b43,
        innerBacking: 0x064e3b,
        cellMain: 0x047857,
        cellAlt: 0x065f46,
        cellBorder: 0x34d399,
        rescueZoneFill: 0x10b981,
        rescueZoneBorder: 0x6ee7b7,
      },
      2: { // 🍬 World 2: Candy Kingdom
        outerGlow: 0xf472b6,
        frameShadow: 0x831843,
        frameMain: 0xbe185d,
        frameBorder: 0xf472b6,
        innerBacking: 0x831843,
        cellMain: 0x9d174d,
        cellAlt: 0xbe185d,
        cellBorder: 0xfbcfe8,
        rescueZoneFill: 0xec4899,
        rescueZoneBorder: 0xf472b6,
      },
      3: { // 🏖️ World 3: Sunny Coral Beach
        outerGlow: 0x38bdf8,
        frameShadow: 0x0c4a6e,
        frameMain: 0x0284c7,
        frameBorder: 0xf59e0b,
        innerBacking: 0x075985,
        cellMain: 0x0369a1,
        cellAlt: 0x0284c7,
        cellBorder: 0x7dd3fc,
        rescueZoneFill: 0x06b6d4,
        rescueZoneBorder: 0x38bdf8,
      },
      4: { // ❄️ World 4: Frozen Crystal Tundra
        outerGlow: 0x38bdf8,
        frameShadow: 0x0c4a6e,
        frameMain: 0x0369a1,
        frameBorder: 0xe0f2fe,
        innerBacking: 0x1e3a8a,
        cellMain: 0x1d4ed8,
        cellAlt: 0x2563eb,
        cellBorder: 0x7dd3fc,
        rescueZoneFill: 0x38bdf8,
        rescueZoneBorder: 0xbae6fd,
      },
      5: { // 🌌 World 5: Starlight Cosmic Galaxy
        outerGlow: 0xa855f7,
        frameShadow: 0x3b0764,
        frameMain: 0x581c87,
        frameBorder: 0xfde047,
        innerBacking: 0x3b0764,
        cellMain: 0x4c1d95,
        cellAlt: 0x581c87,
        cellBorder: 0xc084fc,
        rescueZoneFill: 0x8b5cf6,
        rescueZoneBorder: 0xa855f7,
      },
      6: { // 🌋 World 6: Volcanic Amber Peak
        outerGlow: 0xf97316,
        frameShadow: 0x450a0a,
        frameMain: 0x7c2d12,
        frameBorder: 0xf97316,
        innerBacking: 0x450a0a,
        cellMain: 0x7f1d1d,
        cellAlt: 0x991b1b,
        cellBorder: 0xfb923c,
        rescueZoneFill: 0xea580c,
        rescueZoneBorder: 0xf97316,
      },
      7: { // 🏰 World 7: Enchanted Fairy Forest
        outerGlow: 0x34d399,
        frameShadow: 0x022c22,
        frameMain: 0x065f46,
        frameBorder: 0xa7f3d0,
        innerBacking: 0x022c22,
        cellMain: 0x047857,
        cellAlt: 0x065f46,
        cellBorder: 0x6ee7b7,
        rescueZoneFill: 0x10b981,
        rescueZoneBorder: 0x34d399,
      },
      8: { // 🏜️ World 8: Golden Desert Oasis
        outerGlow: 0xfbbf24,
        frameShadow: 0x451a03,
        frameMain: 0x78350f,
        frameBorder: 0xfbbf24,
        innerBacking: 0x451a03,
        cellMain: 0x78350f,
        cellAlt: 0x92400e,
        cellBorder: 0xfcd34d,
        rescueZoneFill: 0xf59e0b,
        rescueZoneBorder: 0xfbbf24,
      },
      9: { // ☁️ World 9: Sky Island Paradise
        outerGlow: 0x38bdf8,
        frameShadow: 0x0c4a6e,
        frameMain: 0x0284c7,
        frameBorder: 0xbae6fd,
        innerBacking: 0x0c4a6e,
        cellMain: 0x075985,
        cellAlt: 0x0369a1,
        cellBorder: 0x7dd3fc,
        rescueZoneFill: 0x0284c7,
        rescueZoneBorder: 0x38bdf8,
      },
      10: { // 👑 World 10: Royal Pet Palace
        outerGlow: 0xffd700,
        frameShadow: 0x2e1065,
        frameMain: 0x581c87,
        frameBorder: 0xffd700,
        innerBacking: 0x2e1065,
        cellMain: 0x3b0764,
        cellAlt: 0x4c1d95,
        cellBorder: 0xfacc15,
        rescueZoneFill: 0xeab308,
        rescueZoneBorder: 0xfde047,
      },
    };

    const bStyle = worldBoardStyles[worldTheme.id] || worldBoardStyles[1];

    // 2. Draw Custom World-Themed Frame & Grid Board
    const boardBg = this.add.graphics();
    
    // Outer Ambient Glow
    boardBg.fillStyle(bStyle.outerGlow, 0.35);
    boardBg.fillRoundedRect(this.offsetX - 16, this.offsetY - 14, boardWidth + 32, boardHeight + 32, 24);

    // 3D Outer Frame
    boardBg.fillStyle(bStyle.frameShadow, 1); // Dark bevel shadow
    boardBg.fillRoundedRect(this.offsetX - 14, this.offsetY - 14, boardWidth + 28, boardHeight + 28, 22);

    boardBg.fillStyle(bStyle.frameMain, 1); // Main theme frame body
    boardBg.fillRoundedRect(this.offsetX - 12, this.offsetY - 12, boardWidth + 24, boardHeight + 24, 20);

    boardBg.lineStyle(3, bStyle.frameBorder, 0.9); // Border highlight
    boardBg.strokeRoundedRect(this.offsetX - 12, this.offsetY - 12, boardWidth + 24, boardHeight + 24, 20);

    // Glass Grid Inner Backing
    boardBg.fillStyle(bStyle.innerBacking, 0.85);
    boardBg.fillRoundedRect(this.offsetX - 4, this.offsetY - 4, boardWidth + 8, boardHeight + 8, 14);

    // Alternating Grid Cells Complimenting World Theme
    const gridCellBg = this.add.graphics();
    for (let r = 0; r < this.config.rows; r++) {
      for (let c = 0; c < this.config.cols; c++) {
        const cellX = this.offsetX + c * this.tileSize;
        const cellY = this.offsetY + r * this.tileSize;
        
        const isAlt = (r + c) % 2 === 0;
        gridCellBg.fillStyle(isAlt ? bStyle.cellMain : bStyle.cellAlt, 0.9);
        gridCellBg.fillRoundedRect(cellX + 2, cellY + 2, this.tileSize - 4, this.tileSize - 4, 10);
        gridCellBg.lineStyle(1.5, bStyle.cellBorder, 0.4);
        gridCellBg.strokeRoundedRect(cellX + 2, cellY + 2, this.tileSize - 4, this.tileSize - 4, 10);
      }
    }

    // 3. Draw Themed Rescue Zone Indicator at bottom of board
    const rescueZone = this.add.graphics();
    rescueZone.fillStyle(bStyle.rescueZoneFill, 0.35);
    rescueZone.fillRoundedRect(this.offsetX - 4, this.offsetY + boardHeight - this.tileSize - 4, boardWidth + 8, this.tileSize + 8, 14);
    rescueZone.lineStyle(3, bStyle.rescueZoneBorder, 0.9);
    rescueZone.strokeRoundedRect(this.offsetX - 4, this.offsetY + boardHeight - this.tileSize - 4, boardWidth + 8, this.tileSize + 8, 14);

    // 4. Draw 🏡 3D Pet Sanctuary Cottage House with Open Glowing Door (Below Rescue Zone!)
    this.drawPetSanctuaryHouse(width, height, boardWidth, boardHeight);

    // 5. Floating Jungle Fireflies / Magic Sparkles Animation
    for (let i = 0; i < 18; i++) {
      const px = Phaser.Math.Between(20, width - 20);
      const py = Phaser.Math.Between(20, height - 20);
      const size = Phaser.Math.Between(2, 5);
      const particle = this.add.circle(px, py, size, 0xfde047, Phaser.Math.FloatBetween(0.4, 0.9));

      this.tweens.add({
        targets: particle,
        y: py - Phaser.Math.Between(20, 60),
        x: px + Phaser.Math.Between(-30, 30),
        alpha: { from: 0.2, to: 0.9 },
        duration: Phaser.Math.Between(2500, 4500),
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }

    this.createMaskedPetTextures();
    const restored = this.restoreSavedGrid();
    if (!restored) {
      this.setupGrid();
    }
    this.notifyState();
    
    // Activate game audio & background music
    soundFX.setGameActive(true);
  }

  private createMaskedPetTextures() {
    const petTypes = [
      { name: 'doggy', key: 'img_doggy' },
      { name: 'kitty', key: 'img_kitty' },
      { name: 'piggy', key: 'img_piggy' },
      { name: 'chick', key: 'img_chick' },
      { name: 'froggy', key: 'img_froggy' }
    ];

    petTypes.forEach((item) => {
      const texKey = `masked_${item.name}`;
      if (this.textures.exists(texKey)) return;

      const canvas = this.textures.createCanvas(texKey, 56, 56);
      if (!canvas) return;

      const ctx = canvas.context;
      if (!ctx) return;

      const srcImg = this.textures.get(item.key).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      if (srcImg) {
        ctx.beginPath();
        ctx.arc(28, 28, 27, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(srcImg, 0, 0, 56, 56);

        // Key out near-white background pixels so animal face is 100% STANDALONE!
        const imgData = ctx.getImageData(0, 0, 56, 56);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Transparent
          }
        }
        ctx.putImageData(imgData, 0, 0);
        canvas.refresh();
      }
    });
  }

  public setActiveBooster(booster: string | null) {
    this.activeBooster = booster;
  }

  private generateProceduralTextures() {
    const worldTheme = getWorldForLevel(this.config.level);

    // Dynamic World Palettes for All 5 Game Blocks & Items
    const worldPalettes: Record<number, {
      appleShadow: number; appleMain: number; appleHighlight: number;
      boneShadow: number; boneMain: number; boneHighlight: number;
      pawShadow: number; pawMain: number; pawCushion: number;
      creamShadow: number; creamMain: number; creamHighlight: number;
      lollyColors: number[];
    }> = {
      1: { // 🌿 World 1: Jungle Sanctuary
        appleShadow: 0x881337, appleMain: 0xdc2626, appleHighlight: 0xef4444,
        boneShadow: 0x78350f, boneMain: 0xd97706, boneHighlight: 0xfcd34d,
        pawShadow: 0x064e3b, pawMain: 0x047857, pawCushion: 0x34d399,
        creamShadow: 0x047857, creamMain: 0x10b981, creamHighlight: 0x6ee7b7,
        lollyColors: [0x10b981, 0xf59e0b, 0xef4444, 0x06b6d4, 0x34d399]
      },
      2: { // 🍬 World 2: Candy Kingdom
        appleShadow: 0x831843, appleMain: 0xec4899, appleHighlight: 0xf472b6,
        boneShadow: 0x94a3b8, boneMain: 0xffffff, boneHighlight: 0xfbcfe8,
        pawShadow: 0x9d174d, pawMain: 0xf472b6, pawCushion: 0xfde047,
        creamShadow: 0xbe185d, creamMain: 0xec4899, creamHighlight: 0xfbcfe8,
        lollyColors: [0xec4899, 0xf472b6, 0xfde047, 0xa855f7, 0x38bdf8]
      },
      3: { // 🏖️ World 3: Sunny Coral Beach
        appleShadow: 0x0c4a6e, appleMain: 0x0284c7, appleHighlight: 0x38bdf8,
        boneShadow: 0x0284c7, boneMain: 0xe0f2fe, boneHighlight: 0xf59e0b,
        pawShadow: 0x0f766e, pawMain: 0x06b6d4, pawCushion: 0x6ee7b7,
        creamShadow: 0x0284c7, creamMain: 0x06b6d4, creamHighlight: 0x7dd3fc,
        lollyColors: [0x06b6d4, 0x38bdf8, 0xf59e0b, 0xec4899, 0x10b981]
      },
      4: { // ❄️ World 4: Frozen Crystal Tundra
        appleShadow: 0x1e3a8a, appleMain: 0x2563eb, appleHighlight: 0x60a5fa,
        boneShadow: 0x0284c7, boneMain: 0xf0f9ff, boneHighlight: 0x7dd3fc,
        pawShadow: 0x1e40af, pawMain: 0x38bdf8, pawCushion: 0xbae6fd,
        creamShadow: 0x2563eb, creamMain: 0x60a5fa, creamHighlight: 0xe0f2fe,
        lollyColors: [0x38bdf8, 0x60a5fa, 0xe0f2fe, 0xa855f7, 0xffffff]
      },
      5: { // 🌌 World 5: Starlight Cosmic Galaxy
        appleShadow: 0x3b0764, appleMain: 0x581c87, appleHighlight: 0xa855f7,
        boneShadow: 0x4c1d95, boneMain: 0xf3e8ff, boneHighlight: 0xfde047,
        pawShadow: 0x581c87, pawMain: 0xa855f7, pawCushion: 0xfde047,
        creamShadow: 0x6b21a8, creamMain: 0x8b5cf6, creamHighlight: 0xc084fc,
        lollyColors: [0xa855f7, 0x8b5cf6, 0xfde047, 0x38bdf8, 0xec4899]
      },
      6: { // 🌋 World 6: Volcanic Amber Peak
        appleShadow: 0x7f1d1d, appleMain: 0xdc2626, appleHighlight: 0xf97316,
        boneShadow: 0x450a0a, boneMain: 0xf97316, boneHighlight: 0xfde047,
        pawShadow: 0x7c2d12, pawMain: 0xea580c, pawCushion: 0xfde047,
        creamShadow: 0xc2410c, creamMain: 0xf97316, creamHighlight: 0xfdba74,
        lollyColors: [0xef4444, 0xf97316, 0xfde047, 0xb91c1c, 0xf59e0b]
      },
      7: { // 🏰 World 7: Enchanted Fairy Forest
        appleShadow: 0x065f46, appleMain: 0x059669, appleHighlight: 0x34d399,
        boneShadow: 0x064e3b, boneMain: 0x10b981, boneHighlight: 0xa7f3d0,
        pawShadow: 0x047857, pawMain: 0x10b981, pawCushion: 0xfde047,
        creamShadow: 0x15803d, creamMain: 0x22c55e, creamHighlight: 0x86efac,
        lollyColors: [0x10b981, 0x22c55e, 0xf472b6, 0xfde047, 0x38bdf8]
      },
      8: { // 🏜️ World 8: Golden Desert Oasis
        appleShadow: 0x78350f, appleMain: 0x92400e, appleHighlight: 0xfbbf24,
        boneShadow: 0x451a03, boneMain: 0xf59e0b, boneHighlight: 0xfde047,
        pawShadow: 0x78350f, pawMain: 0xf59e0b, pawCushion: 0xfde047,
        creamShadow: 0xb45309, creamMain: 0xf59e0b, creamHighlight: 0xfde047,
        lollyColors: [0xf59e0b, 0xfbbf24, 0xd97706, 0xef4444, 0x38bdf8]
      },
      9: { // ☁️ World 9: Sky Island Paradise
        appleShadow: 0x075985, appleMain: 0x0284c7, appleHighlight: 0x38bdf8,
        boneShadow: 0x0284c7, boneMain: 0xffffff, boneHighlight: 0xbae6fd,
        pawShadow: 0x0369a1, pawMain: 0x38bdf8, pawCushion: 0xffffff,
        creamShadow: 0x0369a1, creamMain: 0x38bdf8, creamHighlight: 0xbae6fd,
        lollyColors: [0x38bdf8, 0x0284c7, 0xffffff, 0xf472b6, 0xfde047]
      },
      10: { // 👑 World 10: Royal Pet Palace
        appleShadow: 0x831843, appleMain: 0xbe185d, appleHighlight: 0xffd700,
        boneShadow: 0x581c87, boneMain: 0xffd700, boneHighlight: 0xfde047,
        pawShadow: 0x3b0764, pawMain: 0x7c3aed, pawCushion: 0xffd700,
        creamShadow: 0xb91c1c, creamMain: 0xea580c, creamHighlight: 0xffd700,
        lollyColors: [0xffd700, 0x7c3aed, 0xbe185d, 0xef4444, 0x38bdf8]
      },
    };

    const pal = worldPalettes[worldTheme.id] || worldPalettes[1];

    // Remove existing block textures so textures re-generate dynamically per World Level
    for (let i = 0; i <= 4; i++) {
      if (this.textures.exists(`block_${i}`)) {
        this.textures.remove(`block_${i}`);
      }
    }

    const S = this.tileSize; // 80
    const cx = S / 2; // 40
    const cy = S / 2; // 40

    // 1. World-Themed 3D Crisp Apple Item
    const g0 = this.make.graphics({ x: 0, y: 0 });
    g0.fillStyle(0x0f172a, 0.4);
    g0.fillEllipse(cx, cy + 22, 56, 18);

    g0.fillStyle(0x78350f, 1);
    g0.fillRoundedRect(cx - 2.5, cy - 30, 5, 12, 2);

    g0.fillStyle(0x16a34a, 1);
    g0.fillEllipse(cx + 8, cy - 24, 12, 6);
    g0.lineStyle(1.5, 0x15803d, 1);
    g0.strokeEllipse(cx + 8, cy - 24, 12, 6);

    g0.fillStyle(pal.appleShadow, 1);
    g0.fillCircle(cx - 12, cy + 2, 19);
    g0.fillCircle(cx + 12, cy + 2, 19);
    g0.fillCircle(cx, cy + 8, 18);

    g0.fillStyle(pal.appleMain, 1);
    g0.fillCircle(cx - 12, cy, 18.5);
    g0.fillCircle(cx + 12, cy, 18.5);
    g0.fillCircle(cx, cy + 6, 17.5);

    g0.fillStyle(pal.appleShadow, 1);
    g0.fillEllipse(cx, cy - 14, 10, 5);

    g0.fillStyle(pal.appleHighlight, 1);
    g0.fillCircle(cx - 10, cy - 6, 12);

    g0.fillStyle(0xffffff, 0.75);
    g0.fillEllipse(cx - 12, cy - 10, 10, 5);

    g0.generateTexture('block_0', S, S);
    g0.destroy();

    // 2. Pure White 3D Dog Bone Item (Always Pure White Across All Worlds!)
    const g1 = this.make.graphics({ x: 0, y: 0 });
    g1.fillStyle(0x0f172a, 0.4);
    g1.fillEllipse(cx, cy + 18, 62, 20);
    
    // Bone Bevel Shadow
    g1.fillStyle(0xb2bec3, 1);
    g1.fillRoundedRect(cx - 26, cy - 8, 52, 18, 9);
    g1.fillCircle(cx - 24, cy - 8, 12);
    g1.fillCircle(cx - 24, cy + 10, 12);
    g1.fillCircle(cx + 24, cy - 8, 12);
    g1.fillCircle(cx + 24, cy + 10, 12);

    // Bone Main White Body
    g1.fillStyle(0xffffff, 1);
    g1.fillRoundedRect(cx - 26, cy - 10, 52, 18, 9);
    g1.fillCircle(cx - 24, cy - 10, 11.5);
    g1.fillCircle(cx - 24, cy + 8, 11.5);
    g1.fillCircle(cx + 24, cy - 10, 11.5);
    g1.fillCircle(cx + 24, cy + 8, 11.5);

    // Bone Glossy Shine
    g1.fillStyle(0xe2e8f0, 0.8);
    g1.fillRoundedRect(cx - 20, cy - 8, 40, 5, 2.5);
    g1.generateTexture('block_1', S, S);
    g1.destroy();

    // 3. World-Themed 3D Paw Print Item
    const g2 = this.make.graphics({ x: 0, y: 0 });
    g2.fillStyle(0x0f172a, 0.4);
    g2.fillEllipse(cx, cy + 20, 56, 18);

    g2.fillStyle(pal.pawShadow, 1);
    g2.fillEllipse(cx, cy + 6, 36, 28);
    g2.fillCircle(cx - 16, cy - 12, 9.5);
    g2.fillCircle(cx - 5, cy - 20, 10);
    g2.fillCircle(cx + 6, cy - 20, 10);
    g2.fillCircle(cx + 16, cy - 12, 9.5);

    g2.fillStyle(pal.pawMain, 1);
    g2.fillEllipse(cx, cy + 4, 34, 26);
    g2.fillCircle(cx - 16, cy - 14, 9);
    g2.fillCircle(cx - 5, cy - 22, 9.5);
    g2.fillCircle(cx + 6, cy - 22, 9.5);
    g2.fillCircle(cx + 16, cy - 14, 9);

    g2.fillStyle(pal.pawCushion, 1);
    g2.fillEllipse(cx, cy + 5, 20, 14);
    g2.fillCircle(cx - 16, cy - 14, 5);
    g2.fillCircle(cx - 5, cy - 22, 5.5);
    g2.fillCircle(cx + 6, cy - 22, 5.5);
    g2.fillCircle(cx + 16, cy - 14, 5);

    g2.fillStyle(0xffffff, 0.6);
    g2.fillEllipse(cx - 6, cy - 3, 14, 6);
    g2.generateTexture('block_2', S, S);
    g2.destroy();

    // 4. World-Themed Soft Serve Ice Cream Cone Item
    const g3 = this.make.graphics({ x: 0, y: 0 });
    g3.fillStyle(0x0f172a, 0.4);
    g3.fillEllipse(cx, cy + 24, 52, 16);

    g3.fillStyle(0x78350f, 1);
    g3.fillTriangle(cx, cy + 26, cx - 18, cy - 2, cx + 18, cy - 2);
    g3.fillStyle(0xd97706, 1);
    g3.fillTriangle(cx, cy + 24, cx - 17, cy - 4, cx + 17, cy - 4);
    g3.fillStyle(0xf59e0b, 1);
    g3.fillTriangle(cx, cy + 22, cx - 16, cy - 5, cx + 16, cy - 5);

    g3.lineStyle(1.5, 0x92400e, 0.8);
    g3.lineBetween(cx - 10, cy, cx + 5, cy + 16);
    g3.lineBetween(cx - 4, cy - 4, cx + 10, cy + 11);
    g3.lineBetween(cx + 10, cy, cx - 5, cy + 16);
    g3.lineBetween(cx + 4, cy - 4, cx - 10, cy + 11);

    g3.fillStyle(pal.creamShadow, 1);
    g3.fillEllipse(cx, cy - 4, 38, 20);
    g3.fillStyle(pal.creamMain, 1);
    g3.fillEllipse(cx, cy - 6, 36, 18);

    g3.fillStyle(pal.creamShadow, 0.6);
    g3.fillEllipse(cx, cy - 12, 32, 16);
    g3.fillStyle(pal.creamMain, 1);
    g3.fillEllipse(cx, cy - 14, 30, 15);

    g3.fillStyle(pal.creamMain, 1);
    g3.fillEllipse(cx - 1, cy - 20, 24, 13);
    g3.fillStyle(pal.creamHighlight, 1);
    g3.fillEllipse(cx - 1, cy - 22, 22, 12);

    g3.fillStyle(pal.creamHighlight, 1);
    g3.fillTriangle(cx - 2, cy - 22, cx + 6, cy - 22, cx, cy - 32);
    g3.fillCircle(cx, cy - 30, 4);

    g3.lineStyle(2, pal.creamHighlight, 0.95);
    g3.beginPath();
    g3.arc(cx - 4, cy - 7, 14, Math.PI * 0.8, Math.PI * 1.8, false);
    g3.strokePath();

    g3.beginPath();
    g3.arc(cx - 3, cy - 15, 11, Math.PI * 0.8, Math.PI * 1.8, false);
    g3.strokePath();

    g3.fillStyle(0xffffff, 0.8);
    g3.fillEllipse(cx - 8, cy - 16, 10, 5);

    g3.generateTexture('block_3', S, S);
    g3.destroy();

    // 5. World-Themed Rainbow Swirl Whirly Pop Lollipop Item
    const g4 = this.make.graphics({ x: 0, y: 0 });
    g4.fillStyle(0x0f172a, 0.4);
    g4.fillEllipse(cx, cy + 24, 56, 16);

    g4.fillStyle(0xcbd5e1, 1);
    g4.fillRoundedRect(cx - 3, cy + 8, 6, 26, 3);
    g4.fillStyle(0xffffff, 1);
    g4.fillRoundedRect(cx - 2, cy + 8, 4, 25, 2);

    g4.fillStyle(0x4c1d95, 1);
    g4.fillCircle(cx, cy - 4, 28);

    const lollipR = 27;
    const numArcs = pal.lollyColors.length * 2;
    for (let i = 0; i < numArcs; i++) {
      const startAngle = (i * Math.PI * 2) / numArcs;
      const endAngle = ((i + 1.2) * Math.PI * 2) / numArcs;
      const color = pal.lollyColors[i % pal.lollyColors.length];

      g4.fillStyle(color, 1);
      g4.beginPath();
      g4.moveTo(cx, cy - 5);
      g4.arc(cx, cy - 5, lollipR, startAngle, endAngle, false);
      g4.closePath();
      g4.fillPath();
    }

    g4.lineStyle(2.5, 0xffffff, 0.7);
    g4.beginPath();
    g4.arc(cx, cy - 5, 22, 0, Math.PI * 1.5, false);
    g4.strokePath();

    g4.lineStyle(2.5, 0xffffff, 0.85);
    g4.beginPath();
    g4.arc(cx, cy - 5, 14, Math.PI * 0.5, Math.PI * 2, false);
    g4.strokePath();

    g4.fillStyle(pal.lollyColors[0], 1);
    g4.fillCircle(cx, cy - 5, 7);
    g4.fillStyle(pal.lollyColors[1] || 0xfde047, 1);
    g4.fillCircle(cx, cy - 5, 4.5);
    g4.fillStyle(0xffffff, 0.9);
    g4.fillCircle(cx - 1, cy - 6, 2.5);

    g4.lineStyle(2, 0xffffff, 0.6);
    g4.strokeCircle(cx, cy - 5, lollipR - 1);

    g4.fillStyle(0xffffff, 0.75);
    g4.fillEllipse(cx - 10, cy - 15, 14, 7);

    g4.generateTexture('block_4', S, S);
    g4.destroy();

    // 2. Official Candy Crush Style 3D Sprinkled Strawberry Donut Bomb
    const chocG = this.make.graphics({ x: 0, y: 0 });
    // Floor Shadow
    chocG.fillStyle(0x0f172a, 0.45);
    chocG.fillEllipse(cx, cy + 22, 64, 20);

    // Golden Baked Donut Dough Ring Shadow & Body
    chocG.fillStyle(0x78350f, 1);
    chocG.fillCircle(cx, cy + 3, 31);
    chocG.fillStyle(0xd97706, 1);
    chocG.fillCircle(cx, cy + 1, 31);
    chocG.fillStyle(0xf59e0b, 1);
    chocG.fillCircle(cx, cy, 30);

    // Glossy Strawberry Pink Icing Layer (Wavy Frosting Base)
    chocG.fillStyle(0x831843, 1); // Dark magenta shadow
    chocG.fillCircle(cx, cy + 1, 27);
    chocG.fillStyle(0xbe185d, 1); // Main deep pink icing
    chocG.fillCircle(cx, cy, 27);
    chocG.fillStyle(0xec4899, 1); // Bright vibrant frosting
    chocG.fillCircle(cx - 1, cy - 1, 25);

    // Icing Drips & Curves
    chocG.fillStyle(0xf472b6, 1);
    chocG.fillCircle(cx - 16, cy - 10, 10);
    chocG.fillCircle(cx + 14, cy - 12, 9);
    chocG.fillCircle(cx - 18, cy + 8, 8);
    chocG.fillCircle(cx + 16, cy + 10, 8);
    chocG.fillCircle(cx, cy - 18, 9);

    // Donut Center Hole (Cutout)
    chocG.fillStyle(0x78350f, 1);
    chocG.fillCircle(cx, cy + 1, 10);
    chocG.fillStyle(0x0f172a, 0.9); // Dark inner hole depth
    chocG.fillCircle(cx, cy, 9.5);

    // 3D Rainbow Pill Sprinkles (Cyan, Green, Yellow, Red, White, Purple Jimmies at various angles!)
    const jimmies = [
      { x: -14, y: -14, angle: 0.4, color: 0x06b6d4 },
      { x: 2, y: -18, angle: -0.3, color: 0xffffff },
      { x: 16, y: -12, angle: 0.8, color: 0x22c55e },
      { x: -18, y: -2, angle: -0.6, color: 0xfde047 },
      { x: 18, y: -2, angle: 0.2, color: 0xef4444 },
      { x: -16, y: 12, angle: 0.7, color: 0xa855f7 },
      { x: 0, y: 18, angle: -0.4, color: 0x06b6d4 },
      { x: 16, y: 12, angle: 0.5, color: 0xffffff },
      { x: -8, y: -10, angle: -0.8, color: 0xef4444 },
      { x: 10, y: -6, angle: 0.3, color: 0xfde047 },
      { x: -10, y: 8, angle: 0.2, color: 0x22c55e },
      { x: 8, y: 10, angle: -0.6, color: 0xa855f7 },
    ];

    jimmies.forEach((j) => {
      chocG.fillStyle(j.color, 1);
      const px = cx + j.x;
      const py = cy + j.y;
      const dx = Math.cos(j.angle) * 4;
      const dy = Math.sin(j.angle) * 4;

      chocG.lineStyle(3, j.color, 1);
      chocG.lineBetween(px - dx, py - dy, px + dx, py + dy);
      chocG.lineStyle(1.2, 0xffffff, 0.7);
      chocG.lineBetween(px - dx, py - dy - 0.5, px + dx, py + dy - 0.5);
    });

    // Glossy Highlight Arc
    chocG.fillStyle(0xffffff, 0.75);
    chocG.fillEllipse(cx - 12, cy - 14, 12, 6);

    chocG.generateTexture('block_chocolate', S, S);
    chocG.destroy();

    // 2. Generate 3D Heavy Jungle Boulder Rock & Wire Cage Obstacle Textures
    const rockG = this.make.graphics({ x: 0, y: 0 });
    // Outer Base Shadow
    rockG.fillStyle(0x0f172a, 0.85);
    rockG.fillRoundedRect(2, 4, S - 4, S - 4, 16);

    // Main 3D Slate Rock Body
    rockG.fillStyle(0x475569, 1);
    rockG.fillRoundedRect(2, 2, S - 4, S - 4, 14);

    // Top-Left Light Highlight Facet
    rockG.fillStyle(0x94a3b8, 0.85);
    rockG.fillRoundedRect(5, 5, S - 14, S / 2 - 2, 10);

    // Bottom-Right Dark Shadow Facet
    rockG.fillStyle(0x1e293b, 0.85);
    rockG.fillRoundedRect(12, S / 2, S - 18, S / 2 - 5, 10);

    // Stone Fissures / Rock Cracks
    rockG.lineStyle(3, 0x0f172a, 0.95);
    rockG.lineBetween(16, 18, 36, 40);
    rockG.lineBetween(36, 40, 60, 30);
    rockG.lineBetween(26, 48, 48, 60);

    // Crack Highlight Lines
    rockG.lineStyle(2, 0xcbd5e1, 0.7);
    rockG.lineBetween(17, 17, 37, 39);

    // Jungle Moss Accents (Green touches on rock corners)
    rockG.fillStyle(0x16a34a, 0.9);
    rockG.fillCircle(14, 14, 7);
    rockG.fillCircle(S - 16, S - 16, 6);

    rockG.generateTexture('obstacle_ice', S, S);
    rockG.destroy();

    const cageG = this.make.graphics({ x: 0, y: 0 });
    cageG.lineStyle(4.5, 0xffd700, 0.95);
    cageG.strokeRoundedRect(4, 4, S - 8, S - 8, 16);
    cageG.lineStyle(3, 0xdfe6e9, 0.9);
    cageG.lineBetween(22, 8, 22, S - 8);
    cageG.lineBetween(S / 2, 6, S / 2, S - 6);
    cageG.lineBetween(S - 22, 8, S - 22, S - 8);
    cageG.lineBetween(8, S / 2, S - 8, S / 2);
    cageG.generateTexture('obstacle_cage', S, S);
    cageG.destroy();
  }

  private setupGrid() {
    this.grid = [];
    const numPets = this.config.petsToRescue;
    const petPositions = new Set<string>();

    // Randomly select pet spawn columns at the top rows
    while (petPositions.size < numPets) {
      const c = Phaser.Math.Between(0, this.config.cols - 1);
      const r = Phaser.Math.Between(0, Math.floor(this.config.rows / 2));
      petPositions.add(`${r},${c}`);
    }

    for (let r = 0; r < this.config.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.config.cols; c++) {
        const isPet = petPositions.has(`${r},${c}`);
        const isIce = !isPet && this.config.hasIce && Math.random() < 0.08;
        const isCage = !isPet && !isIce && this.config.hasCages && Math.random() < 0.08;

        let tileType: TileType = 'color';
        if (isPet) tileType = 'pet';
        else if (isIce) tileType = 'ice';
        else if (isCage) tileType = 'cage';

        const colorIndex = Phaser.Math.Between(0, (this.config.colorsCount || 4) - 1);

        const tileData: TileData = {
          id: `tile_${r}_${c}_${Date.now()}_${Math.random()}`,
          type: tileType,
          colorIndex,
          petType: isPet ? this.config.petType : undefined,
          gridX: c,
          gridY: r,
          isObstacle: isIce || isCage,
        };

        this.grid[r][c] = tileData;
        this.renderTile(tileData);
      }
    }

    // Spawn Special 3D Chocolate Lightning Bomb Blocks if level hasChocolate
    if (this.config.hasChocolate) {
      const chocCount = Math.min(2, Math.floor(this.config.level / 5) + 1);
      for (let i = 0; i < chocCount; i++) {
        const chocCol = Phaser.Math.Between(1, this.config.cols - 2);
        const chocRow = Phaser.Math.Between(1, Math.floor((this.config.rows * 2) / 3));
        const targetTile = this.grid[chocRow][chocCol];

        if (targetTile && targetTile.type === 'color') {
          targetTile.type = 'chocolate';
          if (targetTile.sprite) targetTile.sprite.destroy();
          this.renderTile(targetTile);
        }
      }
    }
  }

  private renderTile(tile: TileData) {
    const x = this.offsetX + tile.gridX * this.tileSize + this.tileSize / 2;
    const y = this.offsetY + tile.gridY * this.tileSize + this.tileSize / 2;

    const container = this.add.container(x, y);

    if (tile.type === 'color') {
      // 1. Standalone 3D Full-Tile Item (Red Heart, White Bone, Pink Paw, Gold Star, Purple Bow)
      const colorIdx = tile.colorIndex % 5;
      const itemSprite = this.add.sprite(0, 0, `block_${colorIdx}`);
      container.add(itemSprite);
    } else if (tile.type === 'pet') {
      // 2. Goal Target Pets to Rescue are STANDALONE 3D ANIMAL FACES!
      const petInfo = getPetForLevel(this.config.level);

      // Floor Shadow on grid surface
      const shadow = this.add.ellipse(0, 18, 52, 20, 0x0f172a, 0.55);
      container.add(shadow);

      // Render Standalone 3D Animal Face Group
      const petGroup = this.add.container(0, -4);

      // Animal Face / Head Avatar (HUGE, STANDALONE & CRYSTAL CLEAR!)
      const petText = this.add.text(0, 0, petInfo.emoji, {
        fontSize: '52px',
      }).setOrigin(0.5);
      petGroup.add(petText);

      // Floating Heart Badge on Top Right
      const heartBadge = this.add.text(20, -22, '💖', {
        fontSize: '18px',
      }).setOrigin(0.5);
      petGroup.add(heartBadge);

      container.add(petGroup);

      // Gentle Floating Bounce Animation
      this.tweens.add({
        targets: petGroup,
        y: { from: -4, to: -8 },
        scaleX: { from: 1, to: 1.06 },
        scaleY: { from: 1, to: 1.06 },
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else if (tile.type === 'chocolate') {
      // Special 3D Chocolate Lightning Bomb Block
      const chocSprite = this.add.sprite(0, 0, 'block_chocolate');
      container.add(chocSprite);

      const chocEmoji = this.add.text(0, -1, '⚡', {
        fontSize: '26px',
        color: '#fde047',
        stroke: '#0f172a',
        strokeThickness: 3,
      }).setOrigin(0.5);
      container.add(chocEmoji);

      this.tweens.add({
        targets: container,
        scaleX: { from: 1, to: 1.08 },
        scaleY: { from: 1, to: 1.08 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      // Ice / Cage obstacle
      const spriteKey = tile.type === 'ice' ? 'obstacle_ice' : 'obstacle_cage';
      const sprite = this.add.sprite(0, 0, spriteKey);
      container.add(sprite);

      if (tile.type === 'cage') {
        const bgBlock = this.add.sprite(0, 0, `block_${tile.colorIndex % 5}`);
        container.sendToBack(bgBlock);
      }
    }

    container.setSize(this.tileSize, this.tileSize);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => this.handleTileClick(tile));

    tile.sprite = container;
  }

  private handleTileClick(tile: TileData) {
    if (this.isProcessing || this.movesLeft <= 0) return;

    // Booster handling
    if (this.activeBooster) {
      this.executeBooster(tile);
      return;
    }

    // Special Chocolate Lightning Bomb Block Click!
    if (tile.type === 'chocolate') {
      this.explodeChocolateLightningBomb(tile);
      return;
    }

    if (tile.type === 'pet' || tile.type === 'ice') return;

    // Find cluster of matching color blocks
    const cluster = this.findCluster(tile.gridX, tile.gridY, tile.colorIndex);
    if (cluster.length < 2) return;

    this.isProcessing = true;
    this.movesLeft--;

    // Sound FX with crashing impact & pop tones
    soundFX.playCandyCrushPop(cluster.length);
    if (cluster.length >= 5) soundFX.playCombo(cluster.length);

    // Tactile Screen Shake
    this.cameras.main.shake(120, 0.004 + Math.min(cluster.length, 8) * 0.001);

    // Update coins (1 coin per popped tile)
    const coins = cluster.length;
    this.score += coins;

    // Calculate cluster center for score text & praise banner
    let sumX = 0;
    let sumY = 0;

    // Pop cluster tiles with Candy Crush Squish-Pop & Particle Explosion VFX
    cluster.forEach((t) => {
      const tileX = this.offsetX + t.gridX * this.tileSize + this.tileSize / 2;
      const tileY = this.offsetY + t.gridY * this.tileSize + this.tileSize / 2;
      sumX += tileX;
      sumY += tileY;

      if (t.sprite) {
        // Step 1: Elastic Squish-Pop Expansion
        this.tweens.add({
          targets: t.sprite,
          scaleX: 1.35,
          scaleY: 1.35,
          duration: 100,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Step 2: Spawn Candy Crush Particles & Flying Cash/Coins VFX
            this.spawnCandyCrushPopVFX(tileX, tileY, t.colorIndex);
            if (t.sprite) t.sprite.destroy();
          }
        });
      }
      this.grid[t.gridY][t.gridX] = null;
    });

    const avgX = sumX / cluster.length;
    const avgY = sumY / cluster.length;

    // Floating Coins Popup (+X 🪙)
    this.spawnFloatingScoreText(avgX, avgY, `+${coins} 🪙`);

    // Praise Banner (SWEET!, DELICIOUS!, TASTY!) if cluster >= 4
    if (cluster.length >= 4) {
      const praises = ['SWEET! 🍬', 'TASTY! 🍭', 'DELICIOUS! 🐾', 'DIVINE! ✨', 'AMAZING! 🌟'];
      const praiseMsg = praises[Math.min(cluster.length - 4, praises.length - 1)];
      this.spawnPraiseBanner(avgX, avgY - 25, praiseMsg);
      soundFX.speakAnnouncer(praiseMsg);
    }

    // Check adjacent ice/cage obstacles
    this.breakAdjacentObstacles(cluster);

    // Apply gravity & check pet rescues
    this.time.delayedCall(220, () => {
      this.applyGravity();
    });
  }

  private spawnCandyCrushPopVFX(x: number, y: number, colorIndex: number) {
    // Play Cash Register Cha-Ching Sound
    soundFX.playChaChing();

    // 1. Expanding Golden Cash Shockwave Ring
    const ring = this.add.graphics();
    ring.setPosition(x, y);
    ring.lineStyle(4, 0xffd700, 1);
    ring.strokeCircle(0, 0, 12);
    ring.fillStyle(0x86efac, 0.7); // Light money green glow
    ring.fillCircle(0, 0, 9);

    this.tweens.add({
      targets: ring,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 240,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });

    // 2. Convert Exploded Tile into Flying Cash & Gold Coins (💵 💰 🪙 💸 💵)
    const moneyIcons = ['💵', '💰', '🪙', '💸', '💵', '💲'];
    const particleCount = 14;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.25, 0.25);
      const speed = Phaser.Math.Between(90, 220);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // Flying Money Cash Bill / Coin item
      const cashText = moneyIcons[i % moneyIcons.length];
      const p = this.add.text(x, y, cashText, {
        fontSize: Phaser.Math.Between(16, 22) + 'px'
      }).setOrigin(0.5).setDepth(50);

      this.tweens.add({
        targets: p,
        x: x + vx * 0.4,
        y: y + vy * 0.4 - Phaser.Math.Between(20, 55), // float upward towards top score bar!
        scaleX: { from: 1.4, to: 0.7 },
        scaleY: { from: 1.4, to: 0.7 },
        rotation: Phaser.Math.FloatBetween(-3, 3),
        alpha: { from: 1, to: 0 },
        duration: Phaser.Math.Between(450, 700),
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }

    // 3. Floating Coin Amount (+1 🪙)
    const floatCash = this.add.text(x, y - 10, '+1 🪙', {
      fontSize: '16px',
      color: '#FBBF24',
      fontStyle: '900',
      stroke: '#78350F',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(55);

    this.tweens.add({
      targets: floatCash,
      y: y - 45,
      scaleX: { from: 0.7, to: 1.2 },
      scaleY: { from: 0.7, to: 1.2 },
      alpha: { from: 1, to: 0 },
      duration: 650,
      ease: 'Back.easeOut',
      onComplete: () => floatCash.destroy()
    });
  }

  private spawnFloatingScoreText(x: number, y: number, text: string) {
    const txt = this.add.text(x, y, text, {
      fontSize: '20px',
      color: '#FFD700',
      fontStyle: '900',
      stroke: '#0F172A',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: txt,
      y: y - 40,
      scaleX: { from: 0.6, to: 1.25 },
      scaleY: { from: 0.6, to: 1.25 },
      alpha: { from: 1, to: 0 },
      duration: 700,
      ease: 'Back.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  private spawnPraiseBanner(x: number, y: number, text: string) {
    const container = this.add.container(x, y).setDepth(40);

    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0xd63031, 0.95);
    bannerBg.fillRoundedRect(-70, -18, 140, 36, 12);
    bannerBg.lineStyle(3, 0xffd700, 1);
    bannerBg.strokeRoundedRect(-70, -18, 140, 36, 12);
    container.add(bannerBg);

    const praiseTxt = this.add.text(0, 0, text, {
      fontSize: '15px',
      color: '#FFFFFF',
      fontStyle: '900',
      stroke: '#0F172A',
      strokeThickness: 4
    }).setOrigin(0.5);
    container.add(praiseTxt);

    this.tweens.add({
      targets: container,
      y: y - 55,
      scaleX: { from: 0.4, to: 1.2 },
      scaleY: { from: 0.4, to: 1.2 },
      duration: 850,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: container,
          alpha: 0,
          duration: 300,
          onComplete: () => container.destroy()
        });
      }
    });
  }

  private executeBooster(tile: TileData) {
    if (!this.activeBooster) return;

    // ── Pet tiles are NEVER destroyed by boosters ──
    // Boosters should only hit color / ice / cage / chocolate tiles.
    // If the player clicks a pet tile, cancel the action silently,
    // keep the booster active, and show a warning toast.
    if (tile.type === 'pet') {
      this.isProcessing = false;
      this.activeBooster = this.activeBooster; // keep it active so the player can retry

      // Show a quick "Can't hit pets!" warning near the clicked tile
      const warnX = this.offsetX + tile.gridX * this.tileSize + this.tileSize / 2;
      const warnY = this.offsetY + tile.gridY * this.tileSize - 10;
      const warnText = this.add.text(warnX, warnY, "Can't hit pets! 🐾", {
        fontSize: '13px',
        color: '#fde047',
        fontStyle: 'bold',
        stroke: '#0f172a',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(80);
      this.tweens.add({
        targets: warnText,
        y: warnY - 30,
        alpha: { from: 1, to: 0 },
        duration: 1400,
        ease: 'Quad.easeOut',
        onComplete: () => warnText.destroy(),
      });
      return;
    }

    this.isProcessing = true;
    soundFX.playBooster();

    const bType = this.activeBooster;
    this.activeBooster = null;

    if (this.onBoosterUsed) {
      this.onBoosterUsed(bType);
    }

    if (bType === 'hammer') {
      // Destroy single tile (1 coin) with VFX — pet tiles are already blocked above
      const tx = this.offsetX + tile.gridX * this.tileSize + this.tileSize / 2;
      const ty = this.offsetY + tile.gridY * this.tileSize + this.tileSize / 2;

      if (tile.sprite) {
        this.spawnCandyCrushPopVFX(tx, ty, tile.colorIndex || 0);
        tile.sprite.destroy();
      }
      this.grid[tile.gridY][tile.gridX] = null;
      this.score += 1;

      this.breakAdjacentObstacles([tile]);
      this.notifyState();

      this.time.delayedCall(220, () => {
        this.applyGravity();
      });
    } else if (bType === 'rocket') {
      // Clear entire row & column (1 coin per cleared tile) with VFX
      let clearedCount = 0;
      const clearedTiles: TileData[] = [];

      for (let c = 0; c < this.config.cols; c++) {
        const t = this.grid[tile.gridY][c];
        if (t && t.type !== 'pet') {
          clearedTiles.push(t);
          const tx = this.offsetX + c * this.tileSize + this.tileSize / 2;
          const ty = this.offsetY + tile.gridY * this.tileSize + this.tileSize / 2;
          this.spawnCandyCrushPopVFX(tx, ty, t.colorIndex || 0);
          if (t.sprite) t.sprite.destroy();
          this.grid[tile.gridY][c] = null;
          clearedCount++;
        }
      }
      for (let r = 0; r < this.config.rows; r++) {
        const t = this.grid[r][tile.gridX];
        if (t && t.type !== 'pet') {
          clearedTiles.push(t);
          const tx = this.offsetX + tile.gridX * this.tileSize + this.tileSize / 2;
          const ty = this.offsetY + r * this.tileSize + this.tileSize / 2;
          this.spawnCandyCrushPopVFX(tx, ty, t.colorIndex || 0);
          if (t.sprite) t.sprite.destroy();
          this.grid[r][tile.gridX] = null;
          clearedCount++;
        }
      }
      this.score += clearedCount;
      this.breakAdjacentObstacles(clearedTiles);
      this.notifyState();

      this.time.delayedCall(250, () => {
        this.applyGravity();
      });
    } else if (bType === 'colorBomb') {
      // Clear all blocks of the selected color (1 coin per cleared tile) with VFX
      let clearedCount = 0;
      const targetColor = tile.colorIndex;
      const clearedTiles: TileData[] = [];

      for (let r = 0; r < this.config.rows; r++) {
        for (let c = 0; c < this.config.cols; c++) {
          const t = this.grid[r][c];
          if (t && t.type === 'color' && t.colorIndex === targetColor) {
            clearedTiles.push(t);
            const tx = this.offsetX + c * this.tileSize + this.tileSize / 2;
            const ty = this.offsetY + r * this.tileSize + this.tileSize / 2;
            this.spawnCandyCrushPopVFX(tx, ty, t.colorIndex || 0);
            if (t.sprite) t.sprite.destroy();
            this.grid[r][c] = null;
            clearedCount++;
          }
        }
      }
      this.score += clearedCount;
      this.breakAdjacentObstacles(clearedTiles);
      this.notifyState();

      this.time.delayedCall(250, () => {
        this.applyGravity();
      });
    } else if (bType === 'nuclear' || bType === 'shuffle') {
      // 🐼💥 NUCLEAR EXPLOSION PANDA: Transforms clicked tile into a Giant 3D Panda that crushes surrounding area!
      const pandaX = this.offsetX + tile.gridX * this.tileSize + this.tileSize / 2;
      const pandaY = this.offsetY + tile.gridY * this.tileSize + this.tileSize / 2;

      // Play Sound Effects & Announcer Voice Callout
      soundFX.playRescueChime();
      soundFX.playCandyCrushPop(6);
      soundFX.speakAnnouncer('Boom!');

      // Spawn Praise Banner
      this.spawnPraiseBanner(pandaX, pandaY - 45, 'BOOM! 🐼💥');

      // Create Giant 3D Cheering Panda Character Container
      const pandaContainer = this.add.container(pandaX, pandaY).setDepth(60);

      const pandaBody = this.add.graphics();

      // Drop Shadow
      pandaBody.fillStyle(0x0f172a, 0.45);
      pandaBody.fillEllipse(0, 10, 60, 24);

      // Black Waving Paws
      pandaBody.fillStyle(0x0f172a, 1);
      pandaBody.fillCircle(-28, 6, 12);
      pandaBody.fillCircle(28, 6, 12);

      // Black Ears
      pandaBody.fillCircle(-22, -22, 13);
      pandaBody.fillCircle(22, -22, 13);
      pandaBody.fillStyle(0x334155, 1);
      pandaBody.fillCircle(-22, -22, 7);
      pandaBody.fillCircle(22, -22, 7);

      // Main White Head
      pandaBody.fillStyle(0xe2e8f0, 1);
      pandaBody.fillCircle(0, 2, 31);
      pandaBody.fillStyle(0xffffff, 1);
      pandaBody.fillCircle(0, 0, 30);

      // Black Eye Patches
      pandaBody.fillStyle(0x0f172a, 1);
      pandaBody.fillEllipse(-12, -5, 10, 13);
      pandaBody.fillEllipse(12, -5, 10, 13);

      // Sparkling 3D Eyes
      pandaBody.fillStyle(0xffffff, 1);
      pandaBody.fillCircle(-11, -5, 5);
      pandaBody.fillCircle(11, -5, 5);
      pandaBody.fillStyle(0x0f172a, 1);
      pandaBody.fillCircle(-10, -5, 3);
      pandaBody.fillCircle(10, -5, 3);
      pandaBody.fillStyle(0xffffff, 1);
      pandaBody.fillCircle(-12, -7, 1.5);
      pandaBody.fillCircle(10, -7, 1.5);

      // Rosy Pink Blush Cheeks
      pandaBody.fillStyle(0xfb7185, 0.65);
      pandaBody.fillEllipse(-20, 5, 7, 4.5);
      pandaBody.fillEllipse(20, 5, 7, 4.5);

      // Black Nose & Cheering Smile
      pandaBody.fillStyle(0x0f172a, 1);
      pandaBody.fillEllipse(0, 3, 5, 3.5);
      pandaBody.fillStyle(0xdc2626, 1);
      pandaBody.fillCircle(0, 11, 6.5);
      pandaBody.fillStyle(0xf43f5e, 1);
      pandaBody.fillCircle(0, 13, 4);

      // Golden Crown on Head
      pandaBody.fillStyle(0xffd700, 1);
      pandaBody.fillTriangle(-12, -28, -6, -42, 0, -28);
      pandaBody.fillTriangle(-4, -28, 0, -44, 4, -28);
      pandaBody.fillTriangle(0, -28, 6, -42, 12, -28);

      pandaContainer.add(pandaBody);

      // Tactile Camera Impact Shake
      this.cameras.main.shake(350, 0.014);

      // Nuclear Expansion & Stomp Animation
      pandaContainer.setScale(0.2);
      this.tweens.add({
        targets: pandaContainer,
        scaleX: 2.2,
        scaleY: 2.2,
        duration: 350,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Expanding Nuclear Shockwave Ring
          const blast = this.add.graphics().setDepth(55);
          blast.setPosition(pandaX, pandaY);
          blast.lineStyle(6, 0x10b981, 1);
          blast.strokeCircle(0, 0, 15);
          blast.fillStyle(0xfde047, 0.65);
          blast.fillCircle(0, 0, 12);

          this.tweens.add({
            targets: blast,
            scaleX: 6.5,
            scaleY: 6.5,
            alpha: 0,
            duration: 350,
            ease: 'Quad.easeOut',
            onComplete: () => blast.destroy()
          });

          // Crush surrounding 5x5 tiles area
          const radius = 2;
          for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
              const r = tile.gridY + dr;
              const c = tile.gridX + dc;

              if (r >= 0 && r < this.config.rows && c >= 0 && c < this.config.cols) {
                const targetTile = this.grid[r][c];
                if (targetTile && targetTile.type !== 'pet') {
                  const tx = this.offsetX + c * this.tileSize + this.tileSize / 2;
                  const ty = this.offsetY + r * this.tileSize + this.tileSize / 2;

                  this.spawnCandyCrushPopVFX(tx, ty, targetTile.colorIndex || 0);

                  if (targetTile.sprite) targetTile.sprite.destroy();
                  this.grid[r][c] = null;
                  this.score += 1;
                }
              }
            }
          }

          // Break adjacent ice & cages
          this.breakAdjacentObstacles([tile]);

          // Fade out Panda & Apply Gravity
          this.time.delayedCall(250, () => {
            this.tweens.add({
              targets: pandaContainer,
              scaleX: 0,
              scaleY: 0,
              alpha: 0,
              duration: 220,
              ease: 'Back.easeIn',
              onComplete: () => {
                pandaContainer.destroy();
                this.applyGravity();
              }
            });
          });
        }
      });
      return;
    }
  }

  private explodeChocolateLightningBomb(tile: TileData) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const tx = this.offsetX + tile.gridX * this.tileSize + this.tileSize / 2;
    const ty = this.offsetY + tile.gridY * this.tileSize + this.tileSize / 2;

    // 1. Play Thunder Lightning SFX & Voice Callout
    soundFX.playRescueChime();
    soundFX.playExplosion();

    // 2. Camera Thunder Impact Shake & Flash
    this.cameras.main.shake(400, 0.02);
    this.cameras.main.flash(300, 255, 255, 255);

    // 3. Screen-Crossing Thunder Lightning Bolts (Column & Row)
    const boardW = this.config.cols * this.tileSize;
    const boardH = this.config.rows * this.tileSize;
    const boardMinX = this.offsetX;
    const boardMaxX = this.offsetX + boardW;
    const boardMinY = this.offsetY;
    const boardMaxY = this.offsetY + boardH;

    // Electric Vertical Lightning Beam (Column)
    const vertBeam = this.add.graphics().setDepth(60);
    vertBeam.fillStyle(0x38bdf8, 0.75);
    vertBeam.fillRect(tx - 12, boardMinY, 24, boardH);
    vertBeam.fillStyle(0xffffff, 0.95);
    vertBeam.fillRect(tx - 4, boardMinY, 8, boardH);

    // Electric Horizontal Lightning Beam (Row)
    const horizBeam = this.add.graphics().setDepth(60);
    horizBeam.fillStyle(0x38bdf8, 0.75);
    horizBeam.fillRect(boardMinX, ty - 12, boardW, 24);
    horizBeam.fillStyle(0xffffff, 0.95);
    horizBeam.fillRect(boardMinX, ty - 4, boardW, 8);

    // Zig-Zag Lightning Bolt Lines
    const lightningG = this.add.graphics().setDepth(65);
    lightningG.lineStyle(4, 0xfde047, 1);

    // Vertical Bolt
    lightningG.beginPath();
    lightningG.moveTo(tx, boardMinY);
    for (let py = boardMinY; py <= boardMaxY; py += 30) {
      lightningG.lineTo(tx + Phaser.Math.Between(-16, 16), py);
    }
    lightningG.strokePath();

    // Horizontal Bolt
    lightningG.beginPath();
    lightningG.moveTo(boardMinX, ty);
    for (let px = boardMinX; px <= boardMaxX; px += 30) {
      lightningG.lineTo(px, ty + Phaser.Math.Between(-16, 16));
    }
    lightningG.strokePath();

    // Fade & Destroy Lightning Beams
    this.tweens.add({
      targets: [vertBeam, horizBeam, lightningG],
      alpha: 0,
      duration: 450,
      ease: 'Quad.easeOut',
      onComplete: () => {
        vertBeam.destroy();
        horizBeam.destroy();
        lightningG.destroy();
      }
    });

    // 4. Flying Donut Shatter & Sparkle Particles (20 particles)
    const particleEmojis = ['🍩', '⚡', '✨', '💥', '🪙', '🍩', '🌟'];
    for (let i = 0; i < 20; i++) {
      const pText = this.add.text(tx, ty, particleEmojis[i % particleEmojis.length], {
        fontSize: Phaser.Math.Between(18, 28) + 'px',
      }).setOrigin(0.5).setDepth(70);

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(80, 220);

      this.tweens.add({
        targets: pText,
        x: tx + Math.cos(angle) * speed,
        y: ty + Math.sin(angle) * speed,
        scale: { from: 1.4, to: 0.2 },
        alpha: { from: 1, to: 0 },
        duration: Phaser.Math.Between(500, 900),
        ease: 'Quad.easeOut',
        onComplete: () => pText.destroy()
      });
    }

    // 5. Praise Banner: "DONUT BLAST! 🍩⚡"
    this.spawnPraiseBanner(tx, ty - 30, 'DONUT BLAST! 🍩⚡');

    // Destroy the Chocolate Block itself
    if (tile.sprite) tile.sprite.destroy();
    this.grid[tile.gridY][tile.gridX] = null;
    this.score += 5;

    // 6. Electrify & Clear all tiles in the SAME Column and Row
    let totalCleared = 0;
    const tilesToClear: TileData[] = [];

    // Column tiles
    for (let r = 0; r < this.config.rows; r++) {
      const t = this.grid[r][tile.gridX];
      if (t && t.type !== 'pet') {
        tilesToClear.push(t);
      }
    }
    // Row tiles
    for (let c = 0; c < this.config.cols; c++) {
      const t = this.grid[tile.gridY][c];
      if (t && t.type !== 'pet' && !tilesToClear.includes(t)) {
        tilesToClear.push(t);
      }
    }

    tilesToClear.forEach((t) => {
      const cellX = this.offsetX + t.gridX * this.tileSize + this.tileSize / 2;
      const cellY = this.offsetY + t.gridY * this.tileSize + this.tileSize / 2;

      this.spawnCandyCrushPopVFX(cellX, cellY, t.colorIndex || 0);

      if (t.sprite) t.sprite.destroy();
      this.grid[t.gridY][t.gridX] = null;
      totalCleared++;
    });

    this.score += totalCleared;
    this.spawnFloatingScoreText(tx, ty, `+${totalCleared + 5} 🪙`);

    // Break adjacent ice & cages
    this.breakAdjacentObstacles(tilesToClear);

    // 7. Apply Gravity & Fill
    this.time.delayedCall(450, () => {
      this.applyGravity();
    });
  }

  private findCluster(startX: number, startY: number, colorIdx: number): TileData[] {
    const cluster: TileData[] = [];
    const visited = new Set<string>();
    const queue: [number, number][] = [[startX, startY]];

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const tile = this.grid[y]?.[x];
      if (tile && tile.type === 'color' && tile.colorIndex === colorIdx) {
        cluster.push(tile);
        // Add 4-directional neighbors
        if (x > 0) queue.push([x - 1, y]);
        if (x < this.config.cols - 1) queue.push([x + 1, y]);
        if (y > 0) queue.push([x, y - 1]);
        if (y < this.config.rows - 1) queue.push([x, y + 1]);
      }
    }
    return cluster;
  }

  private breakAdjacentObstacles(cluster: TileData[]) {
    cluster.forEach((t) => {
      const neighbors = [
        [t.gridX - 1, t.gridY],
        [t.gridX + 1, t.gridY],
        [t.gridX, t.gridY - 1],
        [t.gridX, t.gridY + 1],
      ];
      neighbors.forEach(([nx, ny]) => {
        const neighbor = this.grid[ny]?.[nx];
        if (neighbor && (neighbor.type === 'ice' || neighbor.type === 'cage')) {
          // Convert obstacle to normal color block
          neighbor.type = 'color';
          if (neighbor.sprite) neighbor.sprite.destroy();
          this.renderTile(neighbor);
        }
      });
    });
  }

  private applyGravity() {
    let movedAny = false;

    // Drop tiles down column by column
    for (let c = 0; c < this.config.cols; c++) {
      let emptyRows = 0;
      for (let r = this.config.rows - 1; r >= 0; r--) {
        if (this.grid[r][c] === null) {
          emptyRows++;
        } else if (emptyRows > 0) {
          const tile = this.grid[r][c]!;
          this.grid[r][c] = null;
          tile.gridY = r + emptyRows;
          this.grid[tile.gridY][c] = tile;

          // Animate drop
          const targetY = this.offsetY + tile.gridY * this.tileSize + this.tileSize / 2;
          if (tile.sprite) {
            this.tweens.add({
              targets: tile.sprite,
              y: targetY,
              duration: 220,
              ease: 'Bounce.easeOut',
            });
          }
          movedAny = true;
        }
      }

      // Spawn new tiles at top for empty spaces
      for (let i = 0; i < emptyRows; i++) {
        const newY = i;
        const colorIndex = Math.floor(Math.random() * this.config.colorsCount);
        const newTile: TileData = {
          id: `tile_${c}_${newY}_${Date.now()}_${Math.random()}`,
          type: 'color',
          colorIndex,
          gridX: c,
          gridY: newY,
        };
        this.grid[newY][c] = newTile;
        this.renderTile(newTile);

        if (newTile.sprite) {
          newTile.sprite.y = this.offsetY - (emptyRows - i) * this.tileSize;
          const targetY = this.offsetY + newY * this.tileSize + this.tileSize / 2;
          this.tweens.add({
            targets: newTile.sprite,
            y: targetY,
            duration: 250,
            ease: 'Cubic.easeOut',
          });
        }
      }
    }

    // Check for Pet Rescues at the bottom row
    this.time.delayedCall(300, () => {
      this.checkPetRescues();
    });
  }

  private drawPetSanctuaryHouse(width: number, height: number, boardWidth: number, boardHeight: number) {
    const houseW = boardWidth + 12;
    const houseH = 120;
    const houseX = (width - houseW) / 2;
    const houseY = this.offsetY + boardHeight + 2;

    const g = this.add.graphics();

    // 1. Lush Green Grass & Flower Bed Base
    g.fillStyle(0x15803d, 0.9);
    g.fillRoundedRect(houseX - 12, houseY + houseH - 24, houseW + 24, 28, 14);
    g.fillStyle(0x22c55e, 1);
    g.fillRoundedRect(houseX - 10, houseY + houseH - 26, houseW + 20, 20, 10);

    // Flower Accents on left and right
    const flowerColors = [0xff7675, 0xfd79a8, 0xffeaa7, 0x74b9ff];
    [houseX - 4, houseX + 16, houseX + houseW - 16, houseX + houseW + 4].forEach((fx, i) => {
      g.fillStyle(flowerColors[i % flowerColors.length], 1);
      g.fillCircle(fx, houseY + houseH - 20, 5);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(fx, houseY + houseH - 20, 2);
    });

    // 2. Main Cottage Wooden Log Body
    g.fillStyle(0x451a03, 1); // Dark bevel shadow
    g.fillRoundedRect(houseX, houseY + 28, houseW, houseH - 28, { tl: 10, tr: 10, bl: 16, br: 16 });

    g.fillStyle(0x78350f, 1); // Main wood body
    g.fillRoundedRect(houseX + 2, houseY + 30, houseW - 4, houseH - 32, { tl: 8, tr: 8, bl: 14, br: 14 });

    // Wood log horizontal grain lines
    g.lineStyle(1.5, 0x92400e, 0.7);
    g.lineBetween(houseX + 6, houseY + 48, houseX + houseW - 6, houseY + 48);
    g.lineBetween(houseX + 6, houseY + 68, houseX + houseW - 6, houseY + 68);
    g.lineBetween(houseX + 6, houseY + 88, houseX + houseW - 6, houseY + 88);

    // 3. 3D Terracotta Roof & Gable
    g.fillStyle(0x7f1d1d, 1); // Roof shadow
    g.fillTriangle(houseX - 8, houseY + 36, width / 2, houseY - 4, houseX + houseW + 8, houseY + 36);

    g.fillStyle(0xd63031, 1); // Main roof red
    g.fillTriangle(houseX - 6, houseY + 32, width / 2, houseY - 6, houseX + houseW + 6, houseY + 32);

    g.lineStyle(3, 0xfdcb6e, 0.9); // Golden roof border
    g.strokeTriangle(houseX - 6, houseY + 32, width / 2, houseY - 6, houseX + houseW + 6, houseY + 32);

    // Wooden Signboard on Roof Gable: "PET SANCTUARY 🐾"
    const signBox = this.add.graphics();
    signBox.fillStyle(0x512e0f, 1);
    signBox.fillRoundedRect(width / 2 - 75, houseY + 8, 150, 22, 6);
    signBox.lineStyle(2, 0xd99b43, 1);
    signBox.strokeRoundedRect(width / 2 - 75, houseY + 8, 150, 22, 6);

    const signText = this.add.text(width / 2, houseY + 19, '🏡 PET SANCTUARY 🐾', {
      fontSize: '11px',
      color: '#FFD700',
      fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
    });
    signText.setOrigin(0.5);

    // 4. Cozy Glowing Windows (Left & Right of Door)
    const doorCw = 52;
    const doorCh = 62;
    const doorCx = width / 2;
    const doorCy = houseY + 40;

    [doorCx - 100, doorCx + 100].forEach((wx) => {
      g.fillStyle(0x451a03, 1);
      g.fillCircle(wx, houseY + 60, 15);
      g.fillStyle(0xfde047, 1); // Warm light glow
      g.fillCircle(wx, houseY + 60, 12);
      g.lineStyle(2, 0x78350f, 1);
      g.lineBetween(wx - 12, houseY + 60, wx + 12, houseY + 60);
      g.lineBetween(wx, houseY + 48, wx, houseY + 72);
      g.strokeCircle(wx, houseY + 60, 14);
    });

    // 5. The Glowing Open Door (Centerpiece)
    g.fillStyle(0x271004, 1);
    g.fillRoundedRect(doorCx - doorCw / 2 - 4, doorCy - 4, doorCw + 8, doorCh + 6, { tl: 22, tr: 22, bl: 4, br: 4 });

    // DEEP WARM GOLDEN INTERIOR LIGHT (OPEN DOOR)
    g.fillStyle(0xffd700, 1);
    g.fillRoundedRect(doorCx - doorCw / 2, doorCy, doorCw, doorCh, { tl: 20, tr: 20, bl: 0, br: 0 });

    // Inner bright yellow glow core
    g.fillStyle(0xfff59d, 1);
    g.fillEllipse(doorCx, doorCy + 30, doorCw - 12, doorCh - 16);

    // Open Door Panels folded open on left and right
    g.fillStyle(0x5e370e, 1);
    g.fillRoundedRect(doorCx - doorCw / 2 - 12, doorCy + 4, 12, doorCh - 4, { tl: 6, tr: 2, bl: 6, br: 2 });
    g.fillRoundedRect(doorCx + doorCw / 2, doorCy + 4, 12, doorCh - 4, { tl: 2, tr: 6, bl: 2, br: 6 });
    g.lineStyle(1.5, 0xd99b43, 0.9);
    g.strokeRoundedRect(doorCx - doorCw / 2 - 12, doorCy + 4, 12, doorCh - 4, { tl: 6, tr: 2, bl: 6, br: 2 });
    g.strokeRoundedRect(doorCx + doorCw / 2, doorCy + 4, 12, doorCh - 4, { tl: 2, tr: 6, bl: 2, br: 6 });

    // Velvet Pink Welcome Mat with Paw Print
    g.fillStyle(0xe84393, 1);
    g.fillRoundedRect(doorCx - 24, doorCy + doorCh - 4, 48, 12, 4);
    g.lineStyle(1.5, 0xffffff, 0.8);
    g.strokeRoundedRect(doorCx - 24, doorCy + doorCh - 4, 48, 12, 4);

    const matText = this.add.text(doorCx, doorCy + doorCh + 2, '🐾 WELCOME 🐾', {
      fontSize: '8px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    });
    matText.setOrigin(0.5);

    // 6. Continuous Open Door Light Sparkles Animation
    for (let i = 0; i < 6; i++) {
      const spX = doorCx + Phaser.Math.Between(-16, 16);
      const spY = doorCy + Phaser.Math.Between(10, 45);
      const sp = this.add.circle(spX, spY, Phaser.Math.Between(1, 3), 0xffffff, 0.9);

      this.tweens.add({
        targets: sp,
        y: spY - 25,
        alpha: { from: 0.9, to: 0 },
        duration: Phaser.Math.Between(1200, 2200),
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500)
      });
    }

    // Save Door Target Coordinates for Pet Rescue Anim
    this.openDoorX = doorCx;
    this.openDoorY = doorCy + 25;
  }

  private checkPetRescues() {
    const bottomRow = this.config.rows - 1;
    let rescuedCount = 0;

    for (let c = 0; c < this.config.cols; c++) {
      const tile = this.grid[bottomRow][c];
      if (tile && tile.type === 'pet') {
        rescuedCount++;
        this.petsRescued++;
        this.score += 500;

        soundFX.playRescueChime();

        const doorTargetX = this.openDoorX || (this.scale.width / 2);
        const doorTargetY = this.openDoorY || (this.offsetY + this.config.rows * this.tileSize + 40);

        // 🐾 ANIMATE PET JOYFUL JUMP & DIVE INTO THE OPEN HOUSE DOOR!
        if (tile.sprite) {
          this.children.bringToTop(tile.sprite);

          // Phase 1: Excited Jump Up
          this.tweens.add({
            targets: tile.sprite,
            y: tile.sprite.y - 18,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 140,
            ease: 'Quad.easeOut',
            onComplete: () => {
              // Phase 2: Joyful Arc Dive into Open Door!
              this.tweens.add({
                targets: tile.sprite,
                x: doorTargetX,
                y: doorTargetY,
                scaleX: 0.35,
                scaleY: 0.35,
                alpha: 0,
                duration: 380,
                ease: 'Quad.easeIn',
                onComplete: () => {
                  tile.sprite?.destroy();
                  
                  // Door Celebration Burst (Hearts, Stars, Floating Text)
                  this.triggerDoorRescueEffects(doorTargetX, doorTargetY);
                },
              });
            },
          });
        }
        this.grid[bottomRow][c] = null;
      }
    }

    if (rescuedCount > 0) {
      this.time.delayedCall(550, () => this.applyGravity());
    } else {
      this.isProcessing = false;
      this.checkGameEnd();
    }
  }

  private triggerDoorRescueEffects(doorX: number, doorY: number) {
    // 1. Floating RESCUED! text banner
    const rescuedText = this.add.text(doorX, doorY - 20, 'RESCUED! 🐾', {
      fontSize: '18px',
      color: '#FFD700',
      fontStyle: '900',
      stroke: '#064E3B',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 6, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: rescuedText,
      y: doorY - 70,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => rescuedText.destroy()
    });

    // 2. Heart & Star Particles bursting from Open Door
    const emojis = ['❤️', '⭐', '🐾', '💖', '✨'];
    for (let i = 0; i < 9; i++) {
      const pText = this.add.text(
        doorX + Phaser.Math.Between(-15, 15),
        doorY + Phaser.Math.Between(-10, 10),
        emojis[i % emojis.length],
        { fontSize: '18px' }
      ).setOrigin(0.5);

      const angle = Phaser.Math.FloatBetween(-Math.PI * 0.8, -Math.PI * 0.2);
      const dist = Phaser.Math.Between(40, 80);

      this.tweens.add({
        targets: pText,
        x: doorX + Math.cos(angle) * dist,
        y: doorY + Math.sin(angle) * dist,
        scale: { from: 0.5, to: 1.3 },
        alpha: { from: 1, to: 0 },
        duration: Phaser.Math.Between(600, 900),
        ease: 'Quad.easeOut',
        onComplete: () => pText.destroy()
      });
    }
  }

  private checkGameEnd() {
    const isVictory = this.petsRescued >= this.config.petsToRescue;
    const isGameOver = !isVictory && this.movesLeft <= 0;

    if (isVictory || isGameOver) {
      soundFX.setGameActive(false);
    }

    if (isVictory) soundFX.playVictory();
    else if (isGameOver) soundFX.playGameOver();

    this.notifyState(isGameOver, isVictory);
  }

  private notifyState(isGameOver = false, isVictory = false) {
    if (isGameOver || isVictory) {
      this.clearSavedBoardState();
    } else if (this.movesLeft > 0) {
      this.saveBoardState();
    }

    if (this.onGameStateChange) {
      this.onGameStateChange({
        score: this.score,
        movesLeft: this.movesLeft,
        petsRescued: this.petsRescued,
        petsToRescue: this.config.petsToRescue,
        isGameOver,
        isVictory,
      });
    }
  }

  public saveBoardState() {
    if (typeof window === 'undefined') return;
    if (this.movesLeft <= 0) {
      this.clearSavedBoardState();
      return;
    }
    try {
      const serialized = {
        level: this.config.level,
        score: this.score,
        movesLeft: this.movesLeft,
        petsRescued: this.petsRescued,
        grid: this.grid.map((row) =>
          row.map((t) =>
            t
              ? {
                  id: t.id,
                  type: t.type,
                  colorIndex: t.colorIndex,
                  petType: t.petType,
                  gridX: t.gridX,
                  gridY: t.gridY,
                  isObstacle: t.isObstacle,
                }
              : null
          )
        ),
        timestamp: Date.now(),
      };
      localStorage.setItem(`pet_rescue_saved_board_${this.config.level}`, JSON.stringify(serialized));
    } catch (e) {
      console.warn('Failed to save in-progress board:', e);
    }
  }

  public clearSavedBoardState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`pet_rescue_saved_board_${this.config.level}`);
    } catch (e) {}
  }

  private restoreSavedGrid(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(`pet_rescue_saved_board_${this.config.level}`);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || data.level !== this.config.level || !data.grid || data.movesLeft <= 0) {
        return false;
      }
      // If older than 24 hours, discard
      if (Date.now() - (data.timestamp || 0) > 24 * 60 * 60 * 1000) {
        this.clearSavedBoardState();
        return false;
      }

      this.score = data.score || 0;
      this.movesLeft = data.movesLeft;
      this.petsRescued = data.petsRescued || 0;

      this.grid = [];
      for (let r = 0; r < data.grid.length; r++) {
        this.grid[r] = [];
        for (let c = 0; c < data.grid[r].length; c++) {
          const t = data.grid[r][c];
          if (t) {
            const tileData: TileData = {
              id: t.id || `tile_${r}_${c}_${Date.now()}`,
              type: t.type,
              colorIndex: t.colorIndex,
              petType: t.petType,
              gridX: c,
              gridY: r,
              isObstacle: t.isObstacle,
            };
            this.grid[r][c] = tileData;
            this.renderTile(tileData);
          } else {
            this.grid[r][c] = null;
          }
        }
      }
      return true;
    } catch (e) {
      console.warn('Failed to restore board:', e);
      return false;
    }
  }
}
