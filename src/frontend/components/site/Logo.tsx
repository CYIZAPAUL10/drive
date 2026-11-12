import Image from 'next/image';
import { LOGO, type LogoVariant } from '@/shared/constants/brand';
import styles from './Logo.module.css';

type Props = {
  variant?: LogoVariant;
  priority?: boolean;
  alt?: string;
  className?: string;
};

export default function Logo({ variant = 'onDark', priority = false, alt = 'ERVAIS', className }: Props) {
  const logo = LOGO[variant];
  return (
    <Image
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt={alt}
      priority={priority}
      className={`${styles.logo} ${className ?? ''}`}
    />
  );
}