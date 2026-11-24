import meta from '../imageMeta.json';

// Responsive AVIF/WebP image with intrinsic size reserved (no layout shift).
export default function Picture({ name, alt, className = '', sizes = '(max-width: 768px) 100vw, 50vw', eager = false }) {
  const m = meta[name] || { w: 1600, h: 1000 };
  const set = (ext) => `/img/${name}-800.${ext} 800w, /img/${name}-1600.${ext} 1600w`;
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`/img/${name}-800.webp`}
        alt={alt}
        width={m.w}
        height={m.h}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
      />
    </picture>
  );
}
