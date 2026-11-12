import type { ReactNode } from 'react';
import { Link } from '@/frontend/i18n/navigation';
import styles from './Button.module.css';

type Props = {
  href: string;
  variant?: 'primary' | 'secondary' | 'dark';
  icon?: ReactNode;
  external?: boolean; // tel:, wa.me, etc. use a plain <a>
  newTab?: boolean;
  children: ReactNode;
};

export default function Button({ href, variant = 'primary', icon, external, newTab, children }: Props) {
  const className = `${styles.btn} ${styles[variant]}`;
  const content = (<>{icon}<span>{children}</span></>);

  if (external) {
    return (
      <a href={href} className={className}
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {content}
      </a>
    );
  }
  return <Link href={href} className={className}>{content}</Link>;
}