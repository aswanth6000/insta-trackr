import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";
import { createWriteStream } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

// Read version from manifest.json
const manifestPath = resolve(rootDir, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
const version = manifest.version;

console.log(`Building Insta Trackr v${version}...`);

// Build the extension
console.log("Running build...");
execSync("npm run build", { cwd: rootDir, stdio: "inherit" });

// Create zip file
const distDir = resolve(rootDir, "dist");
const releasesDir = resolve(rootDir, "releases");
const zipFileName = `insta-trackr-v${version}.zip`;
const zipPath = resolve(releasesDir, zipFileName);

console.log(`Creating zip file: ${zipFileName}...`);

const output = createWriteStream(zipPath);
const archive = archiver("zip", {
  zlib: { level: 9 }, // Maximum compression
});

output.on("close", () => {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✅ Release created successfully!`);
  console.log(`   File: ${zipFileName}`);
  console.log(`   Size: ${sizeInMB} MB`);
  console.log(`   Location: releases/${zipFileName}`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

// Add all files from dist directory
archive.directory(distDir, false);

archive.finalize();