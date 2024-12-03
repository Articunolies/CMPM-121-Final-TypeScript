/// <reference path="../lib/phaser.d.ts" />
import { Play } from './scenes/Play.ts';

const config: Phaser.Types.Core.GameConfig = {
    parent: 'phaser-game',
    type: Phaser.AUTO,
	width: 1920/8,
	height: 1080/8,
	zoom: 4,
    scene: [Play],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const _game = new Phaser.Game(config);