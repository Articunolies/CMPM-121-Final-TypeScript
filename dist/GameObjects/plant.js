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
exports.Plant = void 0;
var tile_ts_1 = require("./tile.ts"); // Adjust the import path as necessary
var Plant = /** @class */ (function (_super) {
    __extends(Plant, _super);
    function Plant(scene, x, y, tile, dataView) {
        var _this = _super.call(this, scene, x, y, '') || this; // Provide a default texture key
        scene.add.existing(_this);
        _this.setDepth(Plant.DEPTH);
        _this.tile = tile;
        _this.dataView = dataView;
        _this.id = 0;
        _this.level = 0;
        return _this;
    }
    Plant.prototype.updateTexture = function () {
        if (this.species) {
            this.setTexture("".concat(this.species.name).concat(this.level));
        }
    };
    Plant.prototype.reload = function () {
        if (this.exists) {
            this.updateTexture();
        }
        this.setVisible(this.exists);
    };
    Object.defineProperty(Plant.prototype, "id", {
        get: function () {
            return this.dataView.getUint8(Plant.OFFSET_ID);
        },
        set: function (id) {
            this.dataView.setUint8(Plant.OFFSET_ID, id);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Plant.prototype, "exists", {
        get: function () {
            return this.id != 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Plant.prototype, "species", {
        get: function () {
            if (this.id == Plant.SPECIES.GRASS.id) {
                return Plant.SPECIES.GRASS;
            }
            else if (this.id == Plant.SPECIES.MUSHROOM.id) {
                return Plant.SPECIES.MUSHROOM;
            }
            return null;
        },
        enumerable: false,
        configurable: true
    });
    Plant.prototype.become = function (species, level) {
        this.id = species.id;
        this.level = level;
        this.updateTexture();
        this.setVisible(true);
    };
    Plant.prototype.remove = function () {
        this.id = 0;
        this.level = 0;
        this.setVisible(false);
    };
    Object.defineProperty(Plant.prototype, "level", {
        get: function () {
            return this.dataView.getUint8(Plant.OFFSET_LEVEL);
        },
        set: function (level) {
            this.dataView.setUint8(Plant.OFFSET_LEVEL, level);
        },
        enumerable: false,
        configurable: true
    });
    Plant.prototype.tryToGrow = function () {
        // Ensure plant exists and is below max level
        if (!this.id || this.level >= Plant.MAX_LEVEL) {
            return;
        }
        // Ensure spatial conditions are met
        if (this.species == Plant.SPECIES.GRASS) {
            // don't go out of array bounds
            if (this.tile.gridIndex.x > 0) {
                if (this.tile.getNeighbor(tile_ts_1.Tile.DIRECTIONS.LEFT).plant.species == Plant.SPECIES.MUSHROOM) {
                    return;
                }
            }
        }
        else if (this.species == Plant.SPECIES.MUSHROOM) {
            // don't go out of array bounds
            if (this.tile.gridIndex.y > 0) {
                if (this.tile.getNeighbor(tile_ts_1.Tile.DIRECTIONS.UP).plant.species == Plant.SPECIES.GRASS) {
                    return;
                }
            }
        }
        // Ensure sun and moisture conditions are met
        if (this.species && (this.tile.sunLevel < this.species.level2Conditions.sunLevel ||
            this.tile.moisture < this.species.level2Conditions.moisture)) {
            return;
        }
        // Grow
        this.level++;
        this.updateTexture();
        // Decrease tile moisture
        if (this.species) {
            this.tile.moisture -= this.species.level2Conditions.moisture;
        }
    };
    Plant.DEPTH = 1;
    Plant.SPECIES = {
        GRASS: {
            name: "grass",
            id: 1,
            level2Conditions: {
                sunLevel: 3,
                moisture: 5
            }
        },
        MUSHROOM: {
            name: "mushroom",
            id: 2,
            level2Conditions: {
                sunLevel: 1,
                moisture: 15
            }
        },
    };
    Plant.MAX_LEVEL = 2;
    Plant.SIZE = 2; // in bytes
    /*
        Bytes	Type	Attribute
        -------------------------
        0		Uint8	id
        1		Uint8	level
    */
    Plant.OFFSET_ID = 0;
    Plant.OFFSET_LEVEL = 1;
    return Plant;
}(Phaser.GameObjects.Sprite));
exports.Plant = Plant;
