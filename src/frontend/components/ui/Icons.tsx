import type { SVGProps } from 'react';
import {
  faFacebookF,
  faInstagram,
  faYoutube,
  faXTwitter,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons';

/* ---------- Generic line icons (decorative) ---------- */

function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props} />
  );
}

export const MenuIcon = () => <Svg><path d="M4 6h16M4 12h16M4 18h16" /></Svg>;
export const CalendarIcon = () => <Svg><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>;
export const PhoneIcon = () => <Svg><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></Svg>;
export const ChatIcon = () => <Svg><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></Svg>;
export const CheckCircleIcon = () => <Svg><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" /></Svg>;
export const PinIcon = () => <Svg><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></Svg>;
export const ClockIcon = () => <Svg><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Svg>;
export const ChevronDownIcon = ({ className }: { className?: string }) => <Svg className={className} width="16" height="16"><path d="M6 9l6 6 6-6" /></Svg>;
export const CheckIcon = ({ className }: { className?: string }) => <Svg className={className} width="18" height="18"><path d="M5 13l4 4L19 7" /></Svg>;

/* ---------- Brand icons: Font Awesome Free (CC BY 4.0), rendered as inline SVG ---------- */

type FaIcon = { icon: readonly [number, number, unknown, unknown, string | string[]] };

function Brand({ def, size = 22 }: { def: FaIcon; size?: number }) {
  const [width, height, , , path] = def.icon;
  const d = Array.isArray(path) ? path.join(' ') : path;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}

export const FacebookIcon = () => <Brand def={faFacebookF} />;
export const InstagramIcon = () => <Brand def={faInstagram} />;
export const YoutubeIcon = () => <Brand def={faYoutube} />;
export const XIcon = () => <Brand def={faXTwitter} />;
export const WhatsAppIcon = () => <Brand def={faWhatsapp} size={24} />;