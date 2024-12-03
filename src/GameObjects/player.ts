import { Plant } from './plant.ts';
import { Tile } from './tile.ts'; 

export class Player extends Phaser.Physics.Arcade.Sprite {
    static DEPTH = 2;
    static VELOCITY = 50;

    private tileHitbox: Phaser.GameObjects.Zone;
    private moveUpKey!: Phaser.Input.Keyboard.Key;
    private moveDownKey!: Phaser.Input.Keyboard.Key;
    private moveLeftKey!: Phaser.Input.Keyboard.Key;
    private moveRightKey!: Phaser.Input.Keyboard.Key;
    private plantGrassKey!: Phaser.Input.Keyboard.Key;
    private plantMushroomKey!: Phaser.Input.Keyboard.Key;
    private reapPlantKey!: Phaser.Input.Keyboard.Key;
    private tileWasLastStandingOn: Tile | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "player");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setDepth(Player.DEPTH);

        // Set tile hitbox
        this.tileHitbox = scene.add.zone(0, 0, 1, 1);
        scene.physics.add.existing(this.tileHitbox);

        // Set input
        this.setInput();
    }

    override update() {
        this.handleMovement();
        this.updateTileHitboxPosition();
    }

    private setInput() {
        // Movement
        this.moveUpKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.moveDownKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.moveLeftKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.moveRightKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Planting & Reaping
        this.plantGrassKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.plantGrassKey.on("down", () => this.plant(Plant.SPECIES.GRASS));
        this.plantMushroomKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.plantMushroomKey.on("down", () => this.plant(Plant.SPECIES.MUSHROOM));
        this.reapPlantKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.reapPlantKey.on("down", () => this.reap());
    }

    private plant(species: { id: number; name: string; level2Conditions: { sunLevel: number; moisture: number } }) {
        const tile = this.tileStandingOn;
        if (tile && !tile.plant.exists) {
            tile.plant.become(species, 1);
            (this.scene as Phaser.Scene & { eventBus: Phaser.Events.EventEmitter }).eventBus.emit("grid changed");
        }
    }

    private reap() {
        const tile = this.tileStandingOn;
        if (tile && tile.plant.exists) {
            (this.scene as Phaser.Scene & { winningPlants: Set<Plant> }).winningPlants.delete(tile.plant);
            tile.plant.remove();
            (this.scene as Phaser.Scene & { eventBus: Phaser.Events.EventEmitter }).eventBus.emit("grid changed");
        }
    }

    set tileStandingOn(tile: Tile | null) {
        this.tileWasLastStandingOn = tile;
    }

    get tileStandingOn(): Tile | null {
        if (!this.tileWasLastStandingOn) {
            return null;
        }
        if (!this.stillStandingOnTileWasLastStandingOn()) {
            return null;
        }
        return this.tileWasLastStandingOn;
    }

    private stillStandingOnTileWasLastStandingOn(): boolean {
        return Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), this.tileWasLastStandingOn!.getBounds());
    }

	private handleMovement() {
		let numMoveDirections = 0;
	
		const body = this.body as Phaser.Physics.Arcade.Body;
	
		if (this.moveUpKey.isDown) {
			body.setVelocityY(-Player.VELOCITY);
			numMoveDirections++;
		} else if (this.moveDownKey.isDown) {
			body.setVelocityY(Player.VELOCITY);
			numMoveDirections++;
		} else {
			body.setVelocityY(0);
		}
	
		if (this.moveLeftKey.isDown) {
			body.setVelocityX(-Player.VELOCITY);
			numMoveDirections++;
		} else if (this.moveRightKey.isDown) {
			body.setVelocityX(Player.VELOCITY);
			numMoveDirections++;
		} else {
			body.setVelocityX(0);
		}
	
		if (numMoveDirections > 1) {
			body.velocity.x /= Math.SQRT2;
			body.velocity.y /= Math.SQRT2;
		}
	}

	private updateTileHitboxPosition() {
		const body = this.body as Phaser.Physics.Arcade.Body;
		this.tileHitbox.setPosition(body.x + body.width / 2, body.y + body.height);
	}
}