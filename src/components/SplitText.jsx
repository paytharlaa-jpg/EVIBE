// Splits text into words and characters for per-letter animation.
// Screen readers get the plain text; the split spans are hidden from them.
export default function SplitText({ text, as: Tag = 'span', className = '', charClass = 'ch', wordClass = 'wd' }) {
  const words = text.split(' ');
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, wi) => (
        <span className={wordClass} aria-hidden="true" key={wi}>
          {[...w].map((c, ci) => (
            <span className={charClass} key={ci}>
              {c}
            </span>
          ))}
          {wi < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
