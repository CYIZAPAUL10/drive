'use client';

import { useEffect, useState, type ReactNode } from 'react';
import styles from './SiteHeader.module.css';

// Adds data-scrolled="true" once the page has moved, so the CSS can switch to the glass look.
export default function StickyHeader({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <header className={`surface-dark ${styles.header}`} data-scrolled={scrolled}>
      {children}
    </header>
  );
}