import { Plant } from './plant.ts'; 

export class Tile extends Phaser.Physics.Arcade.Sprite {
    static DEPTH = 0;
    static WIDTH = 18; // in pixels

    static SIZE = 4;
    /*
        Bytes	Type	Attribute
        -------------------------
        0		Uint8	sunLevel
        1		Uint8	moisture
        2-3		Plant	plant
    */
    static OFFSET_SUN_LEVEL = 0;
    static OFFSET_MOISTURE = 1;

    grid: Tile[][];
    gridIndex: { x: number; y: number };
    dataView: DataView;
    plant: Plant;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        grid: Tile[][],
        gridIndex: { x: number; y: number },
        dataView: DataView
    ) {
        super(scene, x, y, "dirt");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(Tile.DEPTH);

        this.grid = grid;
        this.gridIndex = gridIndex;
        this.dataView = dataView;
        this.sunLevel = 0;
        this.moisture = 0;

        const plantDataView = new DataView(dataView.buffer, dataView.byteOffset + Plant.SIZE, Plant.SIZE);
        this.plant = new Plant(scene, x, y - this.height / 2, this, plantDataView);
    }

    get sunLevel(): number {
        return this.dataView.getUint8(Tile.OFFSET_SUN_LEVEL);
    }

    set sunLevel(level: number) {
        this.dataView.setUint8(Tile.OFFSET_SUN_LEVEL, level);
    }

    get moisture(): number {
        return this.dataView.getUint8(Tile.OFFSET_MOISTURE);
    }

    set moisture(amount: number) {
        this.dataView.setUint8(Tile.OFFSET_MOISTURE, amount);
    }

    getNeighbor(direction: { x: number; y: number }): Tile | null {
        if (
            this.gridIndex.x + direction.x < 0 ||
            this.gridIndex.x + direction.x > this.grid[0].length-1 ||
            this.gridIndex.y + direction.y < 0 ||
            this.gridIndex.y + direction.y > this.grid.length-1
        ) {
            return null;
        }
        else {
            return this.grid[this.gridIndex.y + direction.y][this.gridIndex.x + direction.x];
        }
    }
}