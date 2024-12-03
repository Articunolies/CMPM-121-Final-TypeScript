"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
var plant_ts_1 = require("./plant.ts");
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(scene, x, y) {
        var _this = _super.call(this, scene, x, y, "player") || this;
        _this.tileWasLastStandingOn = null;
        scene.add.existing(_this);
        scene.physics.add.existing(_this);
        _this.setCollideWorldBounds(true);
        _this.setDepth(Player.DEPTH);
        // Set tile hitbox
        _this.tileHitbox = scene.add.zone(0, 0, 1, 1);
        scene.physics.add.existing(_this.tileHitbox);
        // Set input
        _this.setInput();
        return _this;
    }
    Player.prototype.update = function () {
        this.handleMovement();
        this.updateTileHitboxPosition();
    };
    Player.prototype.setInput = function () {
        var _this = this;
        // Movement
        this.moveUpKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.moveDownKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.moveLeftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.moveRightKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        // Planting & Reaping
        this.plantGrassKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.plantGrassKey.on("down", function () { return _this.plant(plant_ts_1.Plant.SPECIES.GRASS); });
        this.plantMushroomKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.plantMushroomKey.on("down", function () { return _this.plant(plant_ts_1.Plant.SPECIES.MUSHROOM); });
        this.reapPlantKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.reapPlantKey.on("down", function () { return _this.reap(); });
    };
    Player.prototype.plant = function (species) {
        var tile = this.tileStandingOn;
        if (tile && !tile.plant.exists) {
            tile.plant.become(species, 1);
            this.scene.eventBus.emit("grid changed");
        }
    };
    Player.prototype.reap = function () {
        var tile = this.tileStandingOn;
        if (tile && tile.plant.exists) {
            this.scene.winningPlants.delete(tile.plant);
            tile.plant.remove();
            this.scene.eventBus.emit("grid changed");
        }
    };
    Object.defineProperty(Player.prototype, "tileStandingOn", {
        get: function () {
            if (!this.tileWasLastStandingOn) {
                return null;
            }
            if (!this.stillStandingOnTileWasLastStandingOn()) {
                return null;
            }
            return this.tileWasLastStandingOn;
        },
        set: function (tile) {
            this.tileWasLastStandingOn = tile;
        },
        enumerable: false,
        configurable: true
    });
    Player.prototype.stillStandingOnTileWasLastStandingOn = function () {
        return Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), this.tileWasLastStandingOn.getBounds());
    };
    Player.prototype.handleMovement = function () {
        var numMoveDirections = 0;
        var body = this.body;
        if (this.moveUpKey.isDown) {
            body.setVelocityY(-Player.VELOCITY);
            numMoveDirections++;
        }
        else if (this.moveDownKey.isDown) {
            body.setVelocityY(Player.VELOCITY);
            numMoveDirections++;
        }
        else {
            body.setVelocityY(0);
        }
        if (this.moveLeftKey.isDown) {
            body.setVelocityX(-Player.VELOCITY);
            numMoveDirections++;
        }
        else if (this.moveRightKey.isDown) {
            body.setVelocityX(Player.VELOCITY);
            numMoveDirections++;
        }
        else {
            body.setVelocityX(0);
        }
        if (numMoveDirections > 1) {
            body.velocity.x /= Math.SQRT2;
            body.velocity.y /= Math.SQRT2;
        }
    };
    Player.prototype.updateTileHitboxPosition = function () {
        var body = this.body;
        this.tileHitbox.setPosition(body.x + body.width / 2, body.y + body.height);
    };
    Player.DEPTH = 2;
    Player.VELOCITY = 50;
    return Player;
}(Phaser.Physics.Arcade.Sprite));
exports.Player = Player;
