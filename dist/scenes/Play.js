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
exports.Play = void 0;
var player_ts_1 = require("../GameObjects/player.ts");
var grid_ts_1 = require("../GameObjects/grid.ts");
var plant_ts_1 = require("../GameObjects/plant.ts");
var Play = /** @class */ (function (_super) {
    __extends(Play, _super);
    function Play() {
        var _this = _super.call(this, "gameScene") || this;
        _this.gridStates = [];
        _this.redoGridStates = [];
        _this.winningPlants = new Set();
        return _this;
    }
    Play.prototype.preload = function () {
        this.load.path = './assets/';
        this.load.image("dirt", "dirt.png");
        this.load.image("grass1", "grass1.png");
        this.load.image("grass2", "grass2.png");
        this.load.image("mushroom1", "mushroom1.png");
        this.load.image("mushroom2", "mushroom2.png");
        this.load.image("player", "player1.png");
    };
    Play.prototype.create = function () {
        this.setInput();
        this.displayControls();
        this.createEventBus();
        this.player = new player_ts_1.Player(this, 150, 50);
        this.grid = new grid_ts_1.Grid(this, 100, 50, 2, 2, 1, 1);
        this.gridStates = [this.grid.state.slice(0)]; // set the first state to the state the game starts out in
        this.redoGridStates = [];
        this.winningPlants = new Set();
    };
    Play.prototype.update = function () {
        this.player.update();
    };
    Play.prototype.setInput = function () {
        var _this = this;
        // Time
        this.advanceTimeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
        this.advanceTimeKey.on("down", function () { return _this.advanceTime(); });
        // Undo & Redo
        this.undoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.undoKey.on("down", function () { return _this.undo(); });
        this.redoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.redoKey.on("down", function () { return _this.redo(); });
        // Saving & Loading
        this.saveToSlot1Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEMICOLON); // ;
        this.saveToSlot1Key.on("down", function () { return _this.saveToSlot(1); });
        this.saveToSlot2Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.QUOTES); // '
        this.saveToSlot2Key.on("down", function () { return _this.saveToSlot(2); });
        this.loadSlot1Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET); // [
        this.loadSlot1Key.on("down", function () { return _this.loadSlot(1); });
        this.loadSlot2Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CLOSED_BRACKET); // ]
        this.loadSlot2Key.on("down", function () { return _this.loadSlot(2); });
        this.loadAutoSaveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACK_SLASH); // \
        this.loadAutoSaveKey.on("down", function () { return _this.loadSlot('A'); });
        // Debug
        this.debugKey1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.debugKey1.on("down", function () {
            console.log(_this.grid.state);
        });
        this.debugKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
        this.debugKey2.on("down", function () {
            localStorage.clear();
            console.log("CLEARED LOCAL STORAGE");
        });
    };
    Play.prototype.displayControls = function () {
        document.getElementById("description").innerHTML = "\n        <h1>Crops Life</h1>\n        <h2>Instructions</h2>\n        Grow a max level plant on each tile to win! <br>\n        Plants have a max level of 2 <br>\n        Grass cannot grow if there's a mushroom to its left <br>\n        A mushroom cannot grow if there's grass above it <br>\n        This game autosaves every time after planting, reaping, or advancing time\n        <h2>Controls</h2>\n        Move: ( WASD ) <br>\n        Plant Grass: ( 1 ) <br>\n        Plant Mushroom: ( 2 ) <br>\n        Reap: ( R ) <br>\n        Advance Time: ( T ) <br>\n        Undo: ( LEFT ) <br>\n        Redo: ( RIGHT ) <br>\n        Save to Slot 1: ( ; ) <br>\n        Save to Slot 2: ( ' ) <br>\n        Load Slot 1: ( [ ) <br>\n        Load Slot 2: ( ] ) <br>\n        Load Auto Save: ( \\ )\n        ";
    };
    Play.prototype.advanceTime = function () {
        var _this = this;
        this.grid.tiles.forEach(function (row, y) {
            row.forEach(function (tile, x) {
                tile.sunLevel = Math.floor(Math.random() * 5); // between 0 and 5
                tile.moisture += Math.floor(Math.random() * 5); // between 0 and 5
                tile.plant.tryToGrow();
                _this.updateWinProgress(tile.plant);
            });
        });
        this.eventBus.emit("grid changed");
        console.log("Advanced time");
    };
    Play.prototype.updateWinProgress = function (plant) {
        if (this.winningPlants.has(plant)) {
            return;
        }
        if (plant.level >= plant_ts_1.Plant.MAX_LEVEL) {
            this.winningPlants.add(plant);
            if (this.winningPlants.size >= this.grid.numTiles) {
                console.log("You won!");
            }
        }
    };
    Play.prototype.undo = function () {
        if (this.gridStates.length > 1) {
            this.redoGridStates.push(this.gridStates.pop());
            this.loadCurrentGridState();
            console.log("Undoed");
        }
        else {
            console.log("Nothing to undo");
        }
    };
    Play.prototype.redo = function () {
        var data = this.redoGridStates.pop();
        if (data) {
            this.gridStates.push(data);
            this.loadCurrentGridState();
            console.log("Redoed");
        }
        else {
            console.log("Nothing to redo");
        }
    };
    Play.prototype.loadCurrentGridState = function () {
        var oldState = new DataView(this.grid.state);
        var newState = new DataView(this.gridStates[this.gridStates.length - 1]);
        for (var i = 0; i < oldState.byteLength; i++) {
            oldState.setUint8(i, newState.getUint8(i));
        }
        this.grid.tiles.forEach(function (row) { return row.forEach(function (tile) { return tile.plant.reload(); }); });
    };
    Play.prototype.saveToSlot = function (slot) {
        var _this = this;
        var save = {
            gridStates: this.gridStates.map(function (state) { return _this.byteArrayToIntArray(state); }),
            redoGridStates: this.redoGridStates.map(function (state) { return _this.byteArrayToIntArray(state); })
        };
        localStorage.setItem("slot".concat(slot), JSON.stringify(save));
        if (slot !== 'A') {
            console.log("Saved to slot ".concat(slot));
        }
    };
    Play.prototype.byteArrayToIntArray = function (buffer) {
        var result = [];
        var dataView = new DataView(buffer);
        for (var i = 0; i < dataView.byteLength; i++) {
            result[i] = dataView.getUint8(i);
        }
        return result;
    };
    Play.prototype.loadSlot = function (slot) {
        var _this = this;
        var save = localStorage.getItem("slot".concat(slot));
        if (!save) {
            console.log(slot === 'A' ? "No auto save found" : "Slot ".concat(slot, " is empty"));
            return;
        }
        var parsedSave = JSON.parse(save);
        this.gridStates = parsedSave.gridStates.map(function (intArray) { return _this.intArrayToByteArray(intArray); });
        this.redoGridStates = parsedSave.redoGridStates.map(function (intArray) { return _this.intArrayToByteArray(intArray); });
        this.loadCurrentGridState();
        console.log(slot === 'A' ? "Loaded auto save" : "Loaded slot ".concat(slot));
    };
    Play.prototype.intArrayToByteArray = function (intArray) {
        var result = new ArrayBuffer(intArray.length);
        var dataView = new DataView(result);
        for (var i = 0; i < intArray.length; i++) {
            dataView.setUint8(i, intArray[i]);
        }
        return result;
    };
    Play.prototype.createEventBus = function () {
        var _this = this;
        this.eventBus = new Phaser.Events.EventEmitter();
        this.eventBus.on("grid changed", function () {
            _this.gridStates.push(_this.grid.state.slice(0));
            _this.redoGridStates = [];
            _this.saveToSlot('A');
        });
    };
    return Play;
}(Phaser.Scene));
exports.Play = Play;
