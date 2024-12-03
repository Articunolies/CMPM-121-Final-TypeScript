import { Tile } from './tile.ts'; // Adjust the import path as necessary

export class Grid {
    numTiles: number;
    state: ArrayBuffer;
    tiles: Tile[][];

    constructor(
        private scene: Phaser.Scene,
        private x: number,
        private y: number,
        private width: number,
        private height: number,
        private tileOffsetX: number,
        private tileOffsetY: number
    ) {
        // Set numTiles
        this.numTiles = width * height;

        // Create state
        // holds the data for this grid's Tiles (and Plants) in array of structs (AoS) format
        this.state = new ArrayBuffer(this.numTiles * Tile.SIZE); // a byte array

        // Create tiles
        // a 2D array of Tiles
        this.tiles = [];
        for (let tileY = 0; tileY < height; tileY++) {
            this.tiles[tileY] = [];
            for (let tileX = 0; tileX < width; tileX++) {
                // Convert 2D array index to 1D
                const i = tileY * width + tileX;

                // Create tile
                const tile = new Tile(
                    scene,
                    x + tileX * (tileOffsetX + Tile.WIDTH),
                    y + tileY * (tileOffsetY + Tile.WIDTH),
                    this.tiles,
                    { x: tileX, y: tileY },
                    new DataView(this.state, i * Tile.SIZE, Tile.SIZE)
                );

                // Create overlap between tile and player
                scene.physics.add.overlap(
                    tile,
                    ((scene as unknown) as { player: { tileHitbox: Phaser.GameObjects.GameObject, tileStandingOn: Tile } }).player.tileHitbox, // Cast to specific type to avoid TypeScript errors
                    () => ((scene as unknown) as { player: { tileStandingOn: Tile } }).player.tileStandingOn = tile // Cast to specific type to avoid TypeScript errors
                );

                // Add tile to grid
                this.tiles[tileY][tileX] = tile;
            }
        }
    }
}