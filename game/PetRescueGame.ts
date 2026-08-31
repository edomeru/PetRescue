import * as Phaser from 'phaser';
import { MainGameScene } from './scenes/MainGameScene';
import { LevelConfig } from './levelConfigs';

export function createPetRescueGame(
  containerId: string,
  levelConfig: LevelConfig,
  onGameStateChange?: (data: {
    score: number;
    movesLeft: number;
    petsRescued: number;
    petsToRescue: number;
    isGameOver: boolean;
    isVictory: boolean;
  }) => void,
  onBoosterUsed?: (boosterType: string) => void
): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: containerId,
    width: 540,
    height: 720,
    backgroundColor: '#0F172A',
    transparent: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [],
  };

  const game = new Phaser.Game(config);

  game.events.once('ready', () => {
    game.scene.add('MainGameScene', MainGameScene, true, { levelConfig, onGameStateChange, onBoosterUsed });
  });

  return game;
}
