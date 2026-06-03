import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const runtimeDistDir = path.resolve(rootDir, "packages/runtime/dist");
const runtimePackageJsonPath = path.resolve(rootDir, "packages/runtime/package.json");
const appDistDir = path.resolve(rootDir, "dist");
const runtimeOutRootDir = path.resolve(appDistDir, "runtime");

const runtimeRequiredFiles = ["scrollix-art-gallery-runtime.js"];
const runtimeOptionalFiles = ["scrollix-art-gallery-runtime.css"];
const runtimeDirectories = ["images", "fonts", "textures"];
const DEFAULT_CHANNEL = "stable";

const sanitizeSegment = (value) => value.replace(/[^a-zA-Z0-9._-]/g, "-");

const toVersionStamp = (date) =>
  `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(
    date.getUTCDate()
  ).padStart(2, "0")}${String(date.getUTCHours()).padStart(2, "0")}${String(
    date.getUTCMinutes()
  ).padStart(2, "0")}${String(date.getUTCSeconds()).padStart(2, "0")}`;

const parseCsv = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

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

const copyFileRequired = (sourceFile, targetFile) => {
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Missing runtime artifact: ${sourceFile}`);
  }
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.copyFileSync(sourceFile, targetFile);
};

const copyFileIfExists = (sourceFile, targetFile) => {
  if (!fs.existsSync(sourceFile)) return false;
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.copyFileSync(sourceFile, targetFile);
  return true;
};

if (!fs.existsSync(runtimeDistDir)) {
  throw new Error(`Runtime dist not found at ${runtimeDistDir}. Run "npm run build:runtime" first.`);
}

if (!fs.existsSync(appDistDir)) {
  fs.mkdirSync(appDistDir, { recursive: true });
}

if (!fs.existsSync(runtimePackageJsonPath)) {
  throw new Error(`Runtime package.json not found at ${runtimePackageJsonPath}.`);
}

const runtimePackageJson = JSON.parse(fs.readFileSync(runtimePackageJsonPath, "utf-8"));
const now = new Date();
const defaultRuntimeVersion = `${runtimePackageJson.version}-${toVersionStamp(now)}`;
const runtimeVersionRaw = process.env.RUNTIME_VERSION?.trim() || defaultRuntimeVersion;
const runtimeVersion = sanitizeSegment(runtimeVersionRaw);
if (!runtimeVersion) {
  throw new Error("Resolved runtime version is empty. Set RUNTIME_VERSION with a valid value.");
}

const runtimeChannelRaw = process.env.RUNTIME_CHANNEL?.trim() || DEFAULT_CHANNEL;
const runtimeChannel = sanitizeSegment(runtimeChannelRaw.toLowerCase());
if (!runtimeChannel) {
  throw new Error("Resolved runtime channel is empty. Set RUNTIME_CHANNEL with a valid value.");
}

const runtimeChannelAliasesRaw = process.env.RUNTIME_CHANNEL_ALIASES?.trim() || "";
const runtimeChannelAliases = parseCsv(runtimeChannelAliasesRaw).map((alias) =>
  sanitizeSegment(alias.toLowerCase())
);

const runtimeVersionDir = path.join(runtimeOutRootDir, runtimeVersion);
fs.mkdirSync(runtimeVersionDir, { recursive: true });

for (const fileName of runtimeRequiredFiles) {
  const sourceFile = path.join(runtimeDistDir, fileName);
  const versionTarget = path.join(runtimeVersionDir, fileName);
  const legacyTarget = path.join(appDistDir, fileName);

  copyFileRequired(sourceFile, versionTarget);
  copyFileRequired(sourceFile, legacyTarget);
  console.log(`[Scrollix Art Gallery] copied ${fileName} -> runtime/${runtimeVersion}/${fileName}`);
  console.log(`[Scrollix Art Gallery] copied ${fileName} -> dist/${fileName} (legacy)`);
}

for (const fileName of runtimeOptionalFiles) {
  const sourceFile = path.join(runtimeDistDir, fileName);
  const versionTarget = path.join(runtimeVersionDir, fileName);
  const legacyTarget = path.join(appDistDir, fileName);

  const copiedVersion = copyFileIfExists(sourceFile, versionTarget);
  const copiedLegacy = copyFileIfExists(sourceFile, legacyTarget);
  if (copiedVersion) {
    console.log(`[Scrollix Art Gallery] copied ${fileName} -> runtime/${runtimeVersion}/${fileName}`);
  }
  if (copiedLegacy) {
    console.log(`[Scrollix Art Gallery] copied ${fileName} -> dist/${fileName} (legacy)`);
  }
}

for (const dirName of runtimeDirectories) {
  const sourceDir = path.join(runtimeDistDir, dirName);
  if (!fs.existsSync(sourceDir)) continue;

  const versionTargetDir = path.join(runtimeVersionDir, dirName);
  const legacyTargetDir = path.join(appDistDir, dirName);
  copyDirRecursive(sourceDir, versionTargetDir);
  copyDirRecursive(sourceDir, legacyTargetDir);
  console.log(`[Scrollix Art Gallery] copied ${dirName}/ -> runtime/${runtimeVersion}/${dirName}/`);
  console.log(`[Scrollix Art Gallery] copied ${dirName}/ -> dist/${dirName}/ (legacy)`);
}

const channels = {
  [runtimeChannel]: runtimeVersion,
};
for (const alias of runtimeChannelAliases) {
  if (!alias) continue;
  channels[alias] = runtimeVersion;
}

const defaultChannel = channels[DEFAULT_CHANNEL] ? DEFAULT_CHANNEL : runtimeChannel;

const runtimeManifest = {
  schemaVersion: 1,
  updatedAt: now.toISOString(),
  defaultChannel,
  channels,
  versions: {
    [runtimeVersion]: {
      script: `./${runtimeVersion}/scrollix-art-gallery-runtime.js`,
    },
  },
};

fs.mkdirSync(runtimeOutRootDir, { recursive: true });
const latestManifestPath = path.join(runtimeOutRootDir, "latest.json");
fs.writeFileSync(latestManifestPath, JSON.stringify(runtimeManifest, null, 2) + "\n", "utf-8");
console.log(`[Scrollix Art Gallery] wrote runtime manifest -> runtime/latest.json`);
