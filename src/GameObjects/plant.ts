import { Tile } from './tile.ts'; // Adjust the import path as necessary

export class Plant extends Phaser.GameObjects.Sprite {
    static DEPTH = 1;
    static SPECIES = {
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
        if (!this.id || this.level >= Plant.MAX_LEVEL) {
            return;
        }
        // Ensure spatial conditions are met
        if (this.species == Plant.SPECIES.GRASS) {
            // don't go out of array bounds
            if (this.tile.gridIndex.x > 0) {
                if (this.tile.getNeighbor(Tile.DIRECTIONS.LEFT).plant.species == Plant.SPECIES.MUSHROOM) {
                    return;
                }
            }
        } else if (this.species == Plant.SPECIES.MUSHROOM) {
            // don't go out of array bounds
            if (this.tile.gridIndex.y > 0) {
                if (this.tile.getNeighbor(Tile.DIRECTIONS.UP).plant.species == Plant.SPECIES.GRASS) {
                    return;
                }
            }
        }
        // Ensure sun and moisture conditions are met
        if (
            this.species && (
                this.tile.sunLevel < this.species.level2Conditions.sunLevel ||
                this.tile.moisture < this.species.level2Conditions.moisture
            )
        ) {
            return;
        }

        // Grow
        this.level++;
        this.updateTexture();

        // Decrease tile moisture
        if (this.species) {
            this.tile.moisture -= this.species.level2Conditions.moisture;
        }
    }
}