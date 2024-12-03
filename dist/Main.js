"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../lib/phaser.d.ts" />
var Play_ts_1 = require("./scenes/Play.ts");
var config = {
    parent: 'gameView',
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Play_ts_1.Play]
};
var _game = new Phaser.Game(config);
