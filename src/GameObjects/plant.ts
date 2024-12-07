import { Tile } from './tile.ts'; // Adjust the import path as necessary

interface Species {
    name: string;
    id: number;
    growthConditions: {
        sunLevel: number;
        moisture: number;
        badNeighborSpecies: Species;
        badNeighborDirection: Direction;
    };
}
interface Direction {
    x: number;
    y: number;
}

export class Plant extends Phaser.GameObjects.Sprite {
    static DEPTH = 1;
    static SPECIES = {
        GRASS: {
            name: "grass",
            id: 1,
            growthConditions: {
                sunLevel: 3,
                moisture: 5,
                badNeighborName: "mushroom",
                badNeighborDirection: Tile.DIRECTIONS.LEFT
            }
        },
        MUSHROOM: {
            name: "mushroom",
            id: 2,
            growthConditions: {
                sunLevel: 1,
                moisture: 15,
                badNeighborName: "grass",
                badNeighborDirection: Tile.DIRECTIONS.UP
            }
        },
    };
    static MAX_LEVEL = 2;

    static SIZE = 2; // in bytes
    /*
        Bytes	Type	Attribute
        -------------------------
        0		Uint8	id
        1		Uint8	level
    */
    static OFFSET_ID = 0;
    static OFFSET_LEVEL = 1;

    private tile: Tile;
    private dataView: DataView;

    constructor(scene: Phaser.Scene, x: number, y: number, tile: Tile, dataView: DataView) {
        super(scene, x, y, 'dirt'); // Provide a default texture key
        scene.add.existing(this);
        this.setDepth(Plant.DEPTH);

        this.tile = tile;
        this.dataView = dataView;
        this.id = 0;
        this.level = 0;
    }

    updateTexture() {
        if (this.species) {
            this.setTexture(`${this.species.name}${this.level}`);
        }
    }

    reload() {
        if (this.exists) {
            this.updateTexture();
        }
        this.setVisible(this.exists);
    }

    get id(): number {
        return this.dataView.getUint8(Plant.OFFSET_ID);
    }

    set id(id: number) {
        this.dataView.setUint8(Plant.OFFSET_ID, id);
    }

    get exists(): boolean {
        return this.id != 0;
    }

    get species() {
        if (this.id == Plant.SPECIES.GRASS.id) {
            return Plant.SPECIES.GRASS;
        } else if (this.id == Plant.SPECIES.MUSHROOM.id) {
            return Plant.SPECIES.MUSHROOM;
        }
        return null;
    }

    become(species: { id: number; name: string; level2Conditions: { sunLevel: number; moisture: number } }, level: number) {
        this.id = species.id;
        this.level = level;
        this.updateTexture();
        this.setVisible(true);
    }

    remove() {
        this.id = 0;
        this.level = 0;
        this.setVisible(false);
    }

    get level(): number {
        return this.dataView.getUint8(Plant.OFFSET_LEVEL);
    }

    set level(level: number) {
        this.dataView.setUint8(Plant.OFFSET_LEVEL, level);
    }

    tryToGrow() {
        // Ensure plant exists and is below max level
        if (!this.species || this.level >= Plant.MAX_LEVEL) {
            return;
        }
        // Ensure growth conditions are met
        if (this.tile.sunLevel < this.species.growthConditions.sunLevel) {
            return;
        }
        if (this.tile.moisture < this.species.growthConditions.moisture) {
            return;
        }
        if (
            this.tile.getNeighbor(this.species.growthConditions.badNeighborDirection) &&
            this.tile.getNeighbor(this.species.growthConditions.badNeighborDirection)?.plant.species?.name == this.species.growthConditions.badNeighborName
            // don't know why i needed these question marks above but there was red squigglies
        ) {
            return;
        }

        // Grow
        this.level++;
        this.updateTexture();

        // Decrease tile moisture
        if (this.species) {
            this.tile.moisture -= this.species.growthConditions.moisture;
        }
    }
}