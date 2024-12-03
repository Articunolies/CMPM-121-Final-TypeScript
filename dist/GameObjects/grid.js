"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grid = void 0;
var tile_ts_1 = require("./tile.ts"); // Adjust the import path as necessary
var Grid = /** @class */ (function () {
    function Grid(scene, x, y, width, height, tileOffsetX, tileOffsetY) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.tileOffsetX = tileOffsetX;
        this.tileOffsetY = tileOffsetY;
        // Set numTiles
        this.numTiles = width * height;
        // Create state
        // holds the data for this grid's Tiles (and Plants) in array of structs (AoS) format
        this.state = new ArrayBuffer(this.numTiles * tile_ts_1.Tile.SIZE); // a byte array
        // Create tiles
        // a 2D array of Tiles
        this.tiles = [];
        for (var tileY = 0; tileY < height; tileY++) {
            this.tiles[tileY] = [];
            var _loop_1 = function (tileX) {
                // Convert 2D array index to 1D
                var i = tileY * width + tileX;
                // Create tile
                var tile = new tile_ts_1.Tile(scene, x + tileX * (tileOffsetX + tile_ts_1.Tile.WIDTH), y + tileY * (tileOffsetY + tile_ts_1.Tile.WIDTH), this_1.tiles, { x: tileX, y: tileY }, new DataView(this_1.state, i * tile_ts_1.Tile.SIZE, tile_ts_1.Tile.SIZE));
                // Create overlap between tile and player
                scene.physics.add.overlap(tile, scene.player.tileHitbox, // Cast to specific type to avoid TypeScript errors
                function () { return scene.player.tileStandingOn = tile; } // Cast to specific type to avoid TypeScript errors
                );
                // Add tile to grid
                this_1.tiles[tileY][tileX] = tile;
            };
            var this_1 = this;
            for (var tileX = 0; tileX < width; tileX++) {
                _loop_1(tileX);
            }
        }
    }
    return Grid;
}());
exports.Grid = Grid;
