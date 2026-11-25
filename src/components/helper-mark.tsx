const hues = ["#c4622d", "#a34b32", "#8c6239", "#d0894c", "#6e5344", "#e0a06a"];

export function hueFor(name: string) {
  const n = name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return hues[n % hues.length];
}

export function HelperMark({ name, size = 28 }: { name: string; size?: number }) {
  const letter = (name.trim()[0] || "H").toUpperCase();
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-lg font-semibold text-white"
      style={{ width: size, height: size, background: hueFor(name), fontSize: size < 32 ? 12 : 18 }}
      aria-hidden
    >
      {letter}
    </span>
  );
}

export function DiamondFace({ name }: { name: string }) {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" role="img" aria-label={name}>
      <rect x="14" y="14" width="60" height="60" rx="18" transform="rotate(45 44 44)" fill={hueFor(name)} />
      <circle cx="34" cy="42" r="3" fill="#fff" />
      <circle cx="54" cy="42" r="3" fill="#fff" />
      <path d="M36 52c3 4 13 4 16 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
