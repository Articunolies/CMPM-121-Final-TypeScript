/// <reference path="../lib/phaser.d.ts" />
import { Play } from './scenes/Play.ts';

const config: Phaser.Types.Core.GameConfig = {
    parent: 'phaser-game',
    type: Phaser.AUTO,
	width: 1920/8,
	height: 1080/8,
	zoom: 4,
    scene: [Play],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const _game = new Phaser.Game(config);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/CMPM-121-Final-TypeScript/serviceWorker.js");
}

const cacheName = "cache";
const appShellFiles = [
    "/assets/config.json",
    "/assets/dirt.png",
    "/assets/grass1.png",
    "/assets/grass2.png",
    "/assets/mushroom1.png",
    "/assets/mushroom2.png",
    "/assets/player1.png",
    "/assets/player2.png",

    "/lib/",
    "/lib/phaser.js",

    "/src/GameObjects/grid.ts",
    "/src/GameObjects/plant.ts",
    "/src/GameObjects/player.ts",
    "/src/GameObjects/tile.ts",
    
    "/src/scenes/Play.ts",

    "/src/Main.ts",

    "/index.html"
];

self.addEventListener("install", (e) => {
    console.log("[Service Worker] Install");
    e.waitUntil(
      (async () => {
        const cache = await caches.open(cacheName);
        console.log("[Service Worker] Caching all: app shell and content");
        await cache.addAll(appShellFiles);
      })(),
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
      (async () => {
        const r = await caches.match(e.request);
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        if (r) {
          return r;
        }
        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
      })(),
    );
  });