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
    private moveUp: boolean = false;
    private moveDown: boolean = false;
    private moveLeft: boolean = false;
    private moveRight: boolean = false;
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
        document.getElementById('moveUpButton')!.addEventListener('mousedown', () => this.moveUp = true);
        document.getElementById('moveUpButton')!.addEventListener('mouseup', () => this.moveUp = false);
        document.getElementById('moveDownButton')!.addEventListener('mousedown', () => this.moveDown = true);
        document.getElementById('moveDownButton')!.addEventListener('mouseup', () => this.moveDown = false);
        document.getElementById('moveLeftButton')!.addEventListener('mousedown', () => this.moveLeft = true);
        document.getElementById('moveLeftButton')!.addEventListener('mouseup', () => this.moveLeft = false);
        document.getElementById('moveRightButton')!.addEventListener('mousedown', () => this.moveRight = true);
        document.getElementById('moveRightButton')!.addEventListener('mouseup', () => this.moveRight = false);
        // Planting & Reaping
        document.getElementById('plantGrassButton')!.addEventListener('click', () => this.plant(Plant.SPECIES.GRASS));
        document.getElementById('plantMushroomButton')!.addEventListener('click', () => this.plant(Plant.SPECIES.MUSHROOM));
        document.getElementById('reapPlantButton')!.addEventListener('click', () => this.reap());
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
    
        if (this.moveUp) {
            body.setVelocityY(-Player.VELOCITY);
            numMoveDirections++;
        } else if (this.moveDown) {
            body.setVelocityY(Player.VELOCITY);
            numMoveDirections++;
        } else {
            body.setVelocityY(0);
        }
    
        if (this.moveLeft) {
            body.setVelocityX(-Player.VELOCITY);
            numMoveDirections++;
        } else if (this.moveRight) {
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