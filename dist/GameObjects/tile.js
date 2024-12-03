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
exports.Tile = void 0;
var plant_ts_1 = require("./plant.ts");
var Tile = /** @class */ (function (_super) {
    __extends(Tile, _super);
    function Tile(scene, x, y, grid, gridIndex, dataView) {
        var _this = _super.call(this, scene, x, y, "dirt") || this;
        scene.add.existing(_this);
        scene.physics.add.existing(_this);
        _this.setDepth(Tile.DEPTH);
        _this.grid = grid;
        _this.gridIndex = gridIndex;
        _this.dataView = dataView;
        _this.sunLevel = 0;
        _this.moisture = 0;
        var plantDataView = new DataView(dataView.buffer, dataView.byteOffset + plant_ts_1.Plant.SIZE, plant_ts_1.Plant.SIZE);
        _this.plant = new plant_ts_1.Plant(scene, x, y - _this.height / 2, _this, plantDataView);
        return _this;
    }
    Object.defineProperty(Tile.prototype, "sunLevel", {
        get: function () {
            return this.dataView.getUint8(Tile.OFFSET_SUN_LEVEL);
        },
        set: function (level) {
            this.dataView.setUint8(Tile.OFFSET_SUN_LEVEL, level);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tile.prototype, "moisture", {
        get: function () {
            return this.dataView.getUint8(Tile.OFFSET_MOISTURE);
        },
        set: function (amount) {
            this.dataView.setUint8(Tile.OFFSET_MOISTURE, amount);
        },
        enumerable: false,
        configurable: true
    });
    Tile.prototype.getNeighbor = function (direction) {
        return this.grid[this.gridIndex.y + direction.y][this.gridIndex.x + direction.x];
    };
    Tile.DEPTH = 0;
    Tile.WIDTH = 18; // in pixels
    Tile.DIRECTIONS = {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 }
    };
    Tile.SIZE = 4;
    /*
        Bytes	Type	Attribute
        -------------------------
        0		Uint8	sunLevel
        1		Uint8	moisture
        2-3		Plant	plant
    */
    Tile.OFFSET_SUN_LEVEL = 0;
    Tile.OFFSET_MOISTURE = 1;
    return Tile;
}(Phaser.Physics.Arcade.Sprite));
exports.Tile = Tile;
