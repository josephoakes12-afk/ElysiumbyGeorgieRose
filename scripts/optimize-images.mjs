#!/usr/bin/env node
/**
 * Image optimisation pipeline for Elysium By Georgie Rose.
 *
 * Usage:
 * 1) npm install
 * 2) npm run images:build
 *
 * What this generates:
 * - Responsive AVIF, WebP and JPG files in assets/images/optimized
 * - assets/images/optimized/manifest.json
 *
 * Runtime behaviour:
 * - The site keeps using current image sources when manifest.json is absent.
 * - Once this script runs, assets/main.js auto-upgrades images to the optimised variants.
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT_DIR = process.cwd();
const SOURCE_DIR = path.join(ROOT_DIR, "assets", "images");
const OUTPUT_DIR = path.join(SOURCE_DIR, "optimized");

const WIDTHS = [320, 480, 768, 1024, 1400];
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

const JPG_QUALITY = 80;
const WEBP_QUALITY = 80;
const AVIF_QUALITY = 56;

const toPosixPath = (value) => value.split(path.sep).join("/");

const encodeAssetPath = (relativePath) => encodeURI(toPosixPath(relativePath));

const pathExists = async (targetPath) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch (error) {
    return false;
  }
};

const walkFiles = async (directoryPath) => {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(absolutePath);
      }
      return [absolutePath];
    })
  );
  return nested.flat();
};

const getTargetWidths = (originalWidth) => {
  const width = Number(originalWidth);
  if (!Number.isFinite(width) || width <= 0) return [];

  const candidateWidths = WIDTHS.filter((value) => value <= width);
  if (!candidateWidths.length) {
    return [Math.round(width)];
  }

  if (candidateWidths[candidateWidths.length - 1] !== Math.round(width)) {
    candidateWidths.push(Math.round(width));
  }

  return Array.from(new Set(candidateWidths)).sort((left, right) => left - right);
};

const writeVariant = async (inputPath, outputPath, width, format) => {
  const pipeline = sharp(inputPath)
    .rotate()
    .resize({
      width,
      withoutEnlargement: true,
      fit: "inside"
    });

  if (format === "jpg") {
    pipeline.jpeg({
      quality: JPG_QUALITY,
      mozjpeg: true
    });
  } else if (format === "webp") {
    pipeline.webp({
      quality: WEBP_QUALITY
    });
  } else if (format === "avif") {
    pipeline.avif({
      quality: AVIF_QUALITY
    });
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }

  await pipeline.toFile(outputPath);
};

const buildVariantsForFile = async (inputPath, manifest) => {
  const metadata = await sharp(inputPath).metadata();
  const widths = getTargetWidths(metadata.width);
  if (!widths.length) return;

  const relativeSource = toPosixPath(path.relative(SOURCE_DIR, inputPath));
  const sourceKey = `assets/images/${relativeSource}`;
  const sourceBase = relativeSource.replace(/\.[^.]+$/, "");

  const outputSubDir = path.join(OUTPUT_DIR, path.dirname(relativeSource));
  await fs.mkdir(outputSubDir, { recursive: true });

  const manifestEntry = {
    width: metadata.width || null,
    height: metadata.height || null,
    avif: [],
    webp: [],
    jpg: []
  };

  for (const width of widths) {
    const variantBase = `${sourceBase}-${width}`;
    const outputJpgRel = path.join("assets", "images", "optimized", `${variantBase}.jpg`);
    const outputWebpRel = path.join("assets", "images", "optimized", `${variantBase}.webp`);
    const outputAvifRel = path.join("assets", "images", "optimized", `${variantBase}.avif`);

    const outputJpgAbs = path.join(ROOT_DIR, outputJpgRel);
    const outputWebpAbs = path.join(ROOT_DIR, outputWebpRel);
    const outputAvifAbs = path.join(ROOT_DIR, outputAvifRel);

    await writeVariant(inputPath, outputJpgAbs, width, "jpg");
    await writeVariant(inputPath, outputWebpAbs, width, "webp");
    await writeVariant(inputPath, outputAvifAbs, width, "avif");

    manifestEntry.jpg.push({
      width,
      src: encodeAssetPath(outputJpgRel)
    });
    manifestEntry.webp.push({
      width,
      src: encodeAssetPath(outputWebpRel)
    });
    manifestEntry.avif.push({
      width,
      src: encodeAssetPath(outputAvifRel)
    });
  }

  manifest.images[sourceKey] = manifestEntry;
  console.log(`[images] ${sourceKey} -> ${widths.length} responsive size(s)`);
};

const main = async () => {
  if (!(await pathExists(SOURCE_DIR))) {
    throw new Error(`Source directory not found: ${toPosixPath(path.relative(ROOT_DIR, SOURCE_DIR))}`);
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const allFiles = await walkFiles(SOURCE_DIR);
  const sourceFiles = allFiles.filter((filePath) => {
    const extension = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension)) return false;
    return !toPosixPath(filePath).includes("/assets/images/optimized/");
  });

  const manifest = {
    generatedAt: new Date().toISOString(),
    widths: WIDTHS,
    images: {}
  };

  for (const sourceFile of sourceFiles) {
    await buildVariantsForFile(sourceFile, manifest);
  }

  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`[images] Processed ${sourceFiles.length} file(s).`);
  console.log(`[images] Manifest written: ${toPosixPath(path.relative(ROOT_DIR, manifestPath))}`);
};

main().catch((error) => {
  console.error(`[images] Build failed: ${error.message}`);
  process.exitCode = 1;
});
