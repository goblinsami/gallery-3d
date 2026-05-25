import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const runtimeDistDir = path.resolve(rootDir, "packages/runtime/dist");
const appDistDir = path.resolve(rootDir, "dist");

const runtimeFiles = ["scrollix-art-gallery-runtime.js", "scrollix-art-gallery-runtime.css"];
const runtimeDirectories = ["images", "fonts"];

const copyDirRecursive = (sourceDir, targetDir) => {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
};

if (!fs.existsSync(runtimeDistDir)) {
  throw new Error(`Runtime dist not found at ${runtimeDistDir}. Run "npm run build:runtime" first.`);
}

if (!fs.existsSync(appDistDir)) {
  fs.mkdirSync(appDistDir, { recursive: true });
}

for (const fileName of runtimeFiles) {
  const sourceFile = path.join(runtimeDistDir, fileName);
  const targetFile = path.join(appDistDir, fileName);

  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Missing runtime artifact: ${sourceFile}`);
  }

  fs.copyFileSync(sourceFile, targetFile);
  console.log(`[Scrollix Art Gallery] copied ${fileName} -> dist/${fileName}`);
}

for (const dirName of runtimeDirectories) {
  const sourceDir = path.join(runtimeDistDir, dirName);
  if (!fs.existsSync(sourceDir)) continue;

  const targetDir = path.join(appDistDir, dirName);
  copyDirRecursive(sourceDir, targetDir);
  console.log(`[Scrollix Art Gallery] copied ${dirName}/ -> dist/${dirName}/`);
}

