/**
 * Régénère toutes les icônes de l'application (onglet du navigateur, PWA,
 * écran d'accueil iOS) à partir de `public/logo.jpg`.
 *
 * Usage : node scripts/generer-icons.mjs
 *
 * Nécessite `sharp` (installé avec Next.js).
 */
import sharp from "sharp";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const RACINE = process.cwd();
const LOGO = path.join(RACINE, "public", "logo.jpg");

if (!existsSync(LOGO)) {
  console.error("Logo introuvable : public/logo.jpg");
  process.exit(1);
}

/** Assemble un fichier .ico à partir d'images PNG (format Vista+). */
function creerIco(images) {
  const entetes = [];
  const donnees = [];
  let decalage = 6 + images.length * 16;

  for (const { taille, png } of images) {
    entetes.push({
      largeur: taille >= 256 ? 0 : taille,
      hauteur: taille >= 256 ? 0 : taille,
      taille,
      decalage,
      longueur: png.length,
    });
    donnees.push(png);
    decalage += png.length;
  }

  const entete = Buffer.alloc(6);
  entete.writeUInt16LE(0, 0);
  entete.writeUInt16LE(1, 2);
  entete.writeUInt16LE(images.length, 4);

  const repertoire = Buffer.alloc(entetes.length * 16);
  entetes.forEach((e, i) => {
    const o = i * 16;
    repertoire.writeUInt8(e.largeur, o);
    repertoire.writeUInt8(e.hauteur, o + 1);
    repertoire.writeUInt8(0, o + 2);
    repertoire.writeUInt8(0, o + 3);
    repertoire.writeUInt16LE(1, o + 4);
    repertoire.writeUInt16LE(32, o + 6);
    repertoire.writeUInt32LE(e.longueur, o + 8);
    repertoire.writeUInt32LE(e.decalage, o + 12);
  });

  return Buffer.concat([entete, repertoire, ...donnees]);
}

/** Recadre l'image au format carré (cover) puis la redimensionne. */
async function carre(taille) {
  return sharp(LOGO)
    .resize(taille, taille, { fit: "cover", position: "centre" })
    .toBuffer();
}

/** PNG compressé (palette 256 couleurs) : lightweight pour le favicon. */
async function pngCompact(buffer) {
  return sharp(buffer)
    .png({ compressionLevel: 9, palette: true, quality: 88 })
    .toBuffer();
}

/** PNG RGBA : format exigé par Next.js pour les icônes embarquées dans le .ico. */
async function pngRgba(buffer) {
  return sharp(buffer)
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Variante « maskable » : le logo est réduit pour tenir dans la zone sûre. */
async function maskable(taille) {
  const interieur = Math.round(taille * 0.72);
  const logo = await sharp(LOGO)
    .resize(interieur, interieur, { fit: "cover", position: "centre" })
    .toBuffer();
  return sharp({
    create: {
      width: taille,
      height: taille,
      channels: 4,
      background: { r: 49, g: 46, b: 129, alpha: 1 },
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png({ compressionLevel: 9, palette: true, quality: 88 })
    .toBuffer();
}

async function ecrire(chemin, donnees) {
  mkdirSync(path.dirname(chemin), { recursive: true });
  writeFileSync(chemin, donnees);
  console.log(`✓ ${path.relative(RACINE, chemin)}`);
}

async function principal() {
  // Onglet du navigateur (remplace le favicon Next.js par défaut).
  const taillesIco = [16, 32, 48];
  const images = [];
  for (const taille of taillesIco) {
    images.push({ taille, png: await pngRgba(await carre(taille)) });
  }
  await ecrire(path.join(RACINE, "src", "app", "favicon.ico"), creerIco(images));

  // Icône principale servie par Next (prioritaire sur la config metadata).
  await ecrire(
    path.join(RACINE, "src", "app", "icon.png"),
    await pngCompact(await carre(256))
  );

  // Écran d'accueil iOS.
  await ecrire(
    path.join(RACINE, "src", "app", "apple-icon.png"),
    await pngCompact(await carre(180))
  );

  // Icônes PWA (manifeste web).
  await ecrire(
    path.join(RACINE, "public", "icons", "icon-192.png"),
    await pngCompact(await carre(192))
  );
  await ecrire(
    path.join(RACINE, "public", "icons", "icon-512.png"),
    await pngCompact(await carre(512))
  );
  await ecrire(
    path.join(RACINE, "public", "icons", "maskable-192.png"),
    await maskable(192)
  );
  await ecrire(
    path.join(RACINE, "public", "icons", "maskable-512.png"),
    await maskable(512)
  );
  await ecrire(
    path.join(RACINE, "public", "icons", "apple-touch-icon.png"),
    await pngCompact(await carre(180))
  );

  // L'ancien favicon JPEG du dossier app devient inutile.
  const ancienIcon = path.join(RACINE, "src", "app", "icon.jpg");
  if (existsSync(ancienIcon)) {
    rmSync(ancienIcon);
    console.log(`✓ ${path.relative(RACINE, ancienIcon)} (supprimé)`);
  }
}

principal();
