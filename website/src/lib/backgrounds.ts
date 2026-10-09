/**
 * The photo backgrounds behind the homepage sections (#381).
 *
 * These used to be the original photos straight from public/ (up to 5 MB
 * each, 6240 px wide) under a gradient that hides almost all of them. They
 * are now built at screen size as AVIF with a WebP fallback, a few hundred
 * KB at most, which looks the same through the overlay.
 */
import { getImage } from 'astro:assets';
import nordic1 from '../assets/backgrounds/nordic-1.jpg';
import nordic2 from '../assets/backgrounds/nordic-2.jpg';
import nordic3 from '../assets/backgrounds/nordic-3.jpg';

const SOURCES = { 'nordic-1': nordic1, 'nordic-2': nordic2, 'nordic-3': nordic3 };

export type BackgroundName = keyof typeof SOURCES;

/** Inline `style` for a `.nordic-bg` element: WebP for every browser, AVIF where image-set() allows it. */
export async function backgroundStyle(name: BackgroundName): Promise<string> {
  const src = SOURCES[name];
  const [avif, webp] = await Promise.all([
    getImage({ src, width: 1600, format: 'avif', quality: 50 }),
    getImage({ src, width: 1600, format: 'webp', quality: 60 }),
  ]);
  return (
    `background-image: url('${webp.src}'); ` +
    `background-image: image-set(url('${avif.src}') type('image/avif'), url('${webp.src}') type('image/webp'));`
  );
}
