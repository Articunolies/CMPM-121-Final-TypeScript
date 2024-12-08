import { Player } from '../GameObjects/player.ts';
import { Grid } from '../GameObjects/grid.ts';
import { Plant } from '../GameObjects/plant.ts';

export class Play extends Phaser.Scene {
    private player!: Player;
    private grid!: Grid;
    private gridStates: ArrayBuffer[] = [];
    private redoGridStates: ArrayBuffer[] = [];
    private winningPlants: Set<Plant> = new Set();
    private daysPassed!: number;
    private eventBus!: Phaser.Events.EventEmitter;
    private gameConfig: any; // To hold config

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
    private currentLanguage: string = 'en'; // Default language

    constructor() {
        super("gameScene");
    }

    async preload() {
        this.load.path = './assets/';
        this.load.image("dirt", "dirt.png");
        this.load.image("grass1", "grass1.png");
        this.load.image("grass2", "grass2.png");
        this.load.image("mushroom1", "mushroom1.png");
        this.load.image("mushroom2", "mushroom2.png");
        this.load.image("player", "player1.png");

        // Apply link for json file
        try {
            const response = await fetch('./assets/config.json');
            this.gameConfig = await response.json();
        } catch (error) {
            console.error('Error loading config.json:', error);
        }
    }

    create() {
        this.setInput();
        this.displayControls();
        this.createEventBus();
        this.player = new Player(this, 150, 50);
        if(this.gameConfig){
            this.grid = new Grid(this, 10, 12, this.gameConfig.grid.height, this.gameConfig.grid.width, 1, 1);
        } else{
            this.grid = new Grid(this, 100, 50, 2, 2, 1, 1);
        }
        this.gridStates = [this.grid.state.slice(0)]; // set the first state to the state the game starts out in
        this.redoGridStates = [];
        this.winningPlants = new Set();
        this.daysPassed = 0;

        this.updateText();   // Set default language text
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
        <h1>${this.gameConfig.en.Title}</h1>
        <h2>${this.gameConfig.en.Instructions}</h2>
        <pre>${this.gameConfig.en.human_instructions}</pre>
        <h2>${this.gameConfig.en.Controls}</h2>
        `;
        document.getElementById('advanceTimeButton')!.addEventListener('click', () => this.advanceTime());
        document.getElementById('undoButton')!.addEventListener('click', () => this.undo());
        document.getElementById('redoButton')!.addEventListener('click', () => this.redo());
        document.getElementById('saveToSlot1Button')!.addEventListener('click', () => this.saveToSlot(1));
        document.getElementById('saveToSlot2Button')!.addEventListener('click', () => this.saveToSlot(2));
        document.getElementById('loadSlot1Button')!.addEventListener('click', () => this.loadSlot(1));
        document.getElementById('loadSlot2Button')!.addEventListener('click', () => this.loadSlot(2));
        document.getElementById('loadAutoSaveButton')!.addEventListener('click', () => this.loadSlot('A'));
        document.getElementById('languageEnButton')!.addEventListener('click', () => this.setLanguage('en'));
        document.getElementById('languageZhButton')!.addEventListener('click', () => this.setLanguage('zh'));
        document.getElementById('languageArButton')!.addEventListener('click', () => this.setLanguage('ar'));
    }

    private advanceTime() {
        const currentEvent = this.checkEvent();
        if(!currentEvent){
            this.grid.tiles.forEach((row, y) => {
                row.forEach((tile, x) => {
                    tile.sunLevel = Math.floor(Math.random() * 5); // between 0 and 5
                    tile.moisture += Math.floor(Math.random() * 5); // between 0 and 5
                    tile.plant.tryToGrow();
                    this.updateWinProgress(tile.plant);
                });
            });
        } else{
            this.grid.tiles.forEach((row) => {
                row.forEach((tile) => {
                    if (currentEvent.effects.sunLevel !== undefined) {
                        tile.sunLevel = currentEvent.effects.sunLevel;
                    }
                    if (currentEvent.effects.moisture !== undefined) {
                        tile.moisture = currentEvent.effects.moisture;
                    }
                });
            });
        }
        this.daysPassed += 1;
        this.eventBus.emit("grid changed");
        console.log("Advanced time");
    }

    private updateWinProgress(plant: Plant) {
        if (this.winningPlants.has(plant)) {
            return;
        }
        if (plant.level >= Plant.MAX_LEVEL) {
            this.winningPlants.add(plant);
    
            // Initialize species counts
            const speciesCounts: Record<string, number> = {};
            for (const p of this.winningPlants) {
                if (!p.species) {   // so TS doesn't get mad
                    continue;
                }
                if (!speciesCounts[p.species.name]) {
                    speciesCounts[p.species.name] = 0;
                }
                speciesCounts[p.species.name]++;
            }
    
            // Win conditions from JSON
            const winConditions = this.gameConfig.win_conditions;
            const maxLevelPlants = winConditions.maxLevelPlants;
    
            // Check max plants
            if (this.winningPlants.size < maxLevelPlants) {
                return;
            }
            // Check species
            for (const species in winConditions) {
                if (species === "maxLevelPlants") {
                    continue;
                }
                const requiredCount = winConditions[species];
                if ((speciesCounts[species] || 0) < requiredCount) {
                    return;
                }
            }
    
            console.log("You won!");
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

    private checkEvent(){
        let currentEvent = undefined;
        for (const event of this.gameConfig.events) {
            if (event.turn == this.daysPassed) {
                console.log(event.id, this.daysPassed);
                currentEvent = event;
                break;
            }
        }
        return currentEvent;
    }

    private setLanguage(language: string) {
        this.currentLanguage = language;
        this.updateText();
    }
    
    private updateText() {
        const lang = this.gameConfig[this.currentLanguage];
        const descriptionElement = document.getElementById("description")!;
        descriptionElement.innerHTML = `
        <h1>${lang.title}</h1>
        <h2>${lang.instructions}</h2>
        <pre>${lang.human_instructions}</pre>
        <h2>${lang.controls}</h2>
        `;
        if (this.currentLanguage === 'ar') {
            descriptionElement.setAttribute('dir', 'rtl');
        } else {
            descriptionElement.setAttribute('dir', 'ltr');
        }
        document.getElementById('moveUpButton')!.innerText = lang.buttons.moveUp;
        document.getElementById('moveDownButton')!.innerText = lang.buttons.moveDown;
        document.getElementById('moveLeftButton')!.innerText = lang.buttons.moveLeft;
        document.getElementById('moveRightButton')!.innerText = lang.buttons.moveRight;
        document.getElementById('plantGrassButton')!.innerText = lang.buttons.plantGrass;
        document.getElementById('plantMushroomButton')!.innerText = lang.buttons.plantMushroom;
        document.getElementById('reapPlantButton')!.innerText = lang.buttons.reapPlant;
        document.getElementById('advanceTimeButton')!.innerText = lang.buttons.advanceTime;
        document.getElementById('undoButton')!.innerText = lang.buttons.undo;
        document.getElementById('redoButton')!.innerText = lang.buttons.redo;
        document.getElementById('saveToSlot1Button')!.innerText = lang.buttons.saveToSlot1;
        document.getElementById('saveToSlot2Button')!.innerText = lang.buttons.saveToSlot2;
        document.getElementById('loadSlot1Button')!.innerText = lang.buttons.loadSlot1;
        document.getElementById('loadSlot2Button')!.innerText = lang.buttons.loadSlot2;
        document.getElementById('loadAutoSaveButton')!.innerText = lang.buttons.loadAutoSave;
    }
}