// Genera versiones web optimizadas (WebP) de las fotos originales en /source-images
import sharp from 'sharp';
const jobs = [
  ['novios.jpg', 'novios.webp', 1400],
  ['iglesia.jpg', 'iglesia.webp', 1100],
  ['cortijo.webp', 'cortijo.webp', 1280],
];
for (const [src, out, w] of jobs) {
  const info = await sharp(`source-images/${src}`).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`public/images/${out}`);
  console.log(out, info.width + 'x' + info.height, Math.round(info.size / 1024) + 'KB');
}
