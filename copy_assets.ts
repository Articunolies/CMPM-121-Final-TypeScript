import { copy, ensureDir } from "https://deno.land/std@0.111.0/fs/mod.ts";

const srcDir = "./assets";
const destDir = "./dist/assets";

// Ensure the destination directory exists
await ensureDir(destDir);
// Copy assets to the destination
await copy(srcDir, destDir, { overwrite: true });
console.log("Assets successfully copied to dist/assets");