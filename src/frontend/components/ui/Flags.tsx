import type { Locale } from '@/shared/constants/locales';

// Fixed, pre-rounded values. Calculating these with Math.cos/Math.sin at render time
// made the server and browser disagree in the last decimal digit (hydration error).
// Each entry is [x1, y1, x2, y2].
const RAYS: ReadonlyArray<readonly [number, number, number, number]> = [
  [26.20, 5.00, 27.80, 5.00],
  [26.11, 5.70, 27.65, 6.11],
  [25.84, 6.35, 27.22, 7.15],
  [25.41, 6.91, 26.54, 8.04],
  [24.85, 7.34, 25.65, 8.72],
  [24.20, 7.61, 24.61, 9.15],
  [23.50, 7.70, 23.50, 9.30],
  [22.80, 7.61, 22.39, 9.15],
  [22.15, 7.34, 21.35, 8.72],
  [21.59, 6.91, 20.46, 8.04],
  [21.16, 6.35, 19.78, 7.15],
  [20.89, 5.70, 19.35, 6.11],
  [20.80, 5.00, 19.20, 5.00],
  [20.89, 4.30, 19.35, 3.89],
  [21.16, 3.65, 19.78, 2.85],
  [21.59, 3.09, 20.46, 1.96],
  [22.15, 2.66, 21.35, 1.28],
  [22.80, 2.39, 22.39, 0.85],
  [23.50, 2.30, 23.50, 0.70],
  [24.20, 2.39, 24.61, 0.85],
  [24.85, 2.66, 25.65, 1.28],
  [25.41, 3.09, 26.54, 1.96],
  [25.84, 3.65, 27.22, 2.85],
  [26.11, 4.30, 27.65, 3.89],
];

// Decorative: the language code always sits next to the flag, so the flag is hidden from screen readers.
export function Flag({ locale }: { locale: Locale }) {
  return (
    <svg
      width="24"
      height="16"
      viewBox="0 0 30 20"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={{ flex: 'none', borderRadius: 2 }}
    >
      {locale === 'en' && (
        <>
          {/* England: St George's Cross */}
          <rect width="30" height="20" fill="#ffffff" />
          <rect x="13" width="4" height="20" fill="#ce1124" />
          <rect y="8" width="30" height="4" fill="#ce1124" />
        </>
      )}
      {locale === 'fr' && (
        <>
          <rect width="10" height="20" fill="#0055a4" />
          <rect x="10" width="10" height="20" fill="#ffffff" />
          <rect x="20" width="10" height="20" fill="#ef4135" />
        </>
      )}
      {locale === 'rw' && (
        <>
          <rect width="30" height="10" fill="#00a1de" />
          <rect y="10" width="30" height="5" fill="#fad201" />
          <rect y="15" width="30" height="5" fill="#20603d" />
          {RAYS.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fad201" strokeWidth="0.5" />
          ))}
          <circle cx="23.5" cy="5" r="2.3" fill="#fad201" />
        </>
      )}
    </svg>
  );
}