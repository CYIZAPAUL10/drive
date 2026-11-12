import {
  faFacebookF,
  faInstagram,
  faYoutube,
  faXTwitter,
  faTiktok,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons';
import type { SocialPlatformKey } from '@/shared/constants/socialPlatforms';

// Font Awesome Free brand icons (CC BY 4.0), drawn as inline SVG
const ICONS = {
  facebook: faFacebookF,
  instagram: faInstagram,
  youtube: faYoutube,
  x: faXTwitter,
  tiktok: faTiktok,
  linkedin: faLinkedinIn,
} as const;

export function BrandIcon({ platform, size = 22 }: { platform: SocialPlatformKey; size?: number }) {
  const [width, height, , , path] = ICONS[platform].icon;
  const d = Array.isArray(path) ? path.join(' ') : path;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}