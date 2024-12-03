import { Player } from '../GameObjects/player.ts';
import { Grid } from '../GameObjects/grid.ts';
import { Plant } from '../GameObjects/plant.ts';

export class Play extends Phaser.Scene {
    private player!: Player;
    private grid!: Grid;
    private gridStates: ArrayBuffer[] = [];
    private redoGridStates: ArrayBuffer[] = [];
    private winningPlants: Set<Plant> = new Set();
    private eventBus!: Phaser.Events.EventEmitter;

    private advanceTimeKey!: Phaser.Input.Keyboard.Key;
    private undoKey!: Phaser.Input.Keyboard.Key;
    private redoKey!: Phaser.Input.Keyboard.Key;
    private saveToSlot1Key!: Phaser.Input.Keyboard.Key;
    private saveToSlot2Key!: Phaser.Input.Keyboard.Key;
    private loadSlot1Key!: Phaser.Input.Keyboard.Key;
    private loadSlot2Key!: Phaser.Input.Keyboard.Key;
    private loadAutoSaveKey!: Phaser.Input.Keyboard.Key;
    private debugKey1!: Phaser.Input.Keyboard.Key;
    private debugKey2!: Phaser.Input.Keyboard.Key;

    constructor() {
        super("gameScene");
    }

    preload() {
        this.load.path = 'CMPM121-Final/assets/';
        this.load.image("dirt", "dirt.png");
        this.load.image("grass1", "grass1.png");
        this.load.image("grass2", "grass2.png");
        this.load.image("mushroom1", "mushroom1.png");
        this.load.image("mushroom2", "mushroom2.png");
        this.load.image("player", "player1.png");
    }

    create() {
        this.setInput();
        this.displayControls();
        this.createEventBus();
        this.player = new Player(this, 150, 50);
        this.grid = new Grid(this, 100, 50, 2, 2, 1, 1);
        this.gridStates = [this.grid.state.slice(0)]; // set the first state to the state the game starts out in
        this.redoGridStates = [];
        this.winningPlants = new Set();
    }

    override update() {
        this.player.update();
    }

    private setInput() {
        // Time
        this.advanceTimeKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T);
        this.advanceTimeKey.on("down", () => this.advanceTime());

        // Undo & Redo
        this.undoKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.undoKey.on("down", () => this.undo());
        this.redoKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.redoKey.on("down", () => this.redo());

        // Saving & Loading
        this.saveToSlot1Key = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P); // P
        this.saveToSlot1Key.on("down", () => this.saveToSlot(1));
        this.saveToSlot2Key = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.QUOTES); // '
        this.saveToSlot2Key.on("down", () => this.saveToSlot(2));
        this.loadSlot1Key = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET); // [
        this.loadSlot1Key.on("down", () => this.loadSlot(1));
        this.loadSlot2Key = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.CLOSED_BRACKET); // ]
        this.loadSlot2Key.on("down", () => this.loadSlot(2));
        this.loadAutoSaveKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.BACK_SLASH); // \
        this.loadAutoSaveKey.on("down", () => this.loadSlot('A'));

        // Debug
        this.debugKey1 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.debugKey1.on("down", () => {
            console.log(this.grid.state);
        });
        this.debugKey2 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.G);
        this.debugKey2.on("down", () => {
            localStorage.clear();
            console.log("CLEARED LOCAL STORAGE");
        });
    }

    private displayControls() {
        document.getElementById("description")!.innerHTML = `
        <h1>Crops Life</h1>
        <h2>Instructions</h2>
        Grow a max level plant on each tile to win! <br>
        Plants have a max level of 2 <br>
        Grass cannot grow if there's a mushroom to its left <br>
        A mushroom cannot grow if there's grass above it <br>
        This game autosaves every time after planting, reaping, or advancing time
        <h2>Controls</h2>
        Move: ( WASD ) <br>
        Plant Grass: ( 1 ) <br>
        Plant Mushroom: ( 2 ) <br>
        Reap: ( R ) <br>
        Advance Time: ( T ) <br>
        Undo: ( LEFT ) <br>
        Redo: ( RIGHT ) <br>
        Save to Slot 1: ( P ) <br>
        Save to Slot 2: ( ' ) <br>
        Load Slot 1: ( [ ) <br>
        Load Slot 2: ( ] ) <br>
        Load Auto Save: ( \\ )
        `;
    }

    private advanceTime() {
        this.grid.tiles.forEach((row, y) => {
            row.forEach((tile, x) => {
                tile.sunLevel = Math.floor(Math.random() * 5); // between 0 and 5
                tile.moisture += Math.floor(Math.random() * 5); // between 0 and 5
                tile.plant.tryToGrow();
                this.updateWinProgress(tile.plant);
            });
        });
        this.eventBus.emit("grid changed");
        console.log("Advanced time");
    }

    private updateWinProgress(plant: Plant) {
        if (this.winningPlants.has(plant)) {
            return;
        }
        if (plant.level >= Plant.MAX_LEVEL) {
            this.winningPlants.add(plant);
            if (this.winningPlants.size >= this.grid.numTiles) {
                console.log("You won!");
            }
        }
    }

    private undo() {
        if (this.gridStates.length > 1) {
            this.redoGridStates.push(this.gridStates.pop()!);
            this.loadCurrentGridState();
            console.log("Undoed");
        } else {
            console.log("Nothing to undo");
        }
    }

    private redo() {
        const data = this.redoGridStates.pop();
        if (data) {
            this.gridStates.push(data);
            this.loadCurrentGridState();
            console.log("Redoed");
        } else {
            console.log("Nothing to redo");
        }
    }

    private loadCurrentGridState() {
        const oldState = new DataView(this.grid.state);
        const newState = new DataView(this.gridStates[this.gridStates.length - 1]);
        for (let i = 0; i < oldState.byteLength; i++) {
            oldState.setUint8(i, newState.getUint8(i));
        }
        this.grid.tiles.forEach(row => row.forEach(tile => tile.plant.reload()));
    }

    private saveToSlot(slot: number | string) {
        const save = {
            gridStates: this.gridStates.map(state => this.byteArrayToIntArray(state)),
            redoGridStates: this.redoGridStates.map(state => this.byteArrayToIntArray(state))
        };
        localStorage.setItem(`slot${slot}`, JSON.stringify(save));
        if (slot !== 'A') {
            console.log(`Saved to slot ${slot}`);
        }
    }

    private byteArrayToIntArray(buffer: ArrayBuffer): number[] {
        const result = [];
        const dataView = new DataView(buffer);
        for (let i = 0; i < dataView.byteLength; i++) {
            result[i] = dataView.getUint8(i);
        }
        return result;
    }

    private loadSlot(slot: number | string) {
        const save = localStorage.getItem(`slot${slot}`);
        if (!save) {
            console.log(slot === 'A' ? "No auto save found" : `Slot ${slot} is empty`);
            return;
        }
        const parsedSave = JSON.parse(save);
        this.gridStates = parsedSave.gridStates.map((intArray: number[]) => this.intArrayToByteArray(intArray));
        this.redoGridStates = parsedSave.redoGridStates.map((intArray: number[]) => this.intArrayToByteArray(intArray));
        this.loadCurrentGridState();
        console.log(slot === 'A' ? "Loaded auto save" : `Loaded slot ${slot}`);
    }

    private intArrayToByteArray(intArray: number[]): ArrayBuffer {
        const result = new ArrayBuffer(intArray.length);
        const dataView = new DataView(result);
        for (let i = 0; i < intArray.length; i++) {
            dataView.setUint8(i, intArray[i]);
        }
        return result;
    }

    private createEventBus() {
        this.eventBus = new Phaser.Events.EventEmitter();
        this.eventBus.on("grid changed", () => {
            this.gridStates.push(this.grid.state.slice(0));
            this.redoGridStates = [];
            this.saveToSlot('A');
        });
    }
}