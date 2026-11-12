'use client';

import { useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/frontend/i18n/navigation';
import { LOCALES, LOCALE_NAMES, LOCALE_CODES, type Locale } from '@/shared/constants/locales';
import { Flag } from '@/frontend/components/ui/Flags';
import { ChevronDownIcon, CheckIcon } from '@/frontend/components/ui/Icons';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher() {
  const t = useTranslations('Layout');
  const pathname = usePathname();
  const current = useLocale() as Locale;
  const ref = useRef<HTMLDetailsElement>(null);

  // Escape, click outside, and tabbing out all close the dropdown
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const close = () => { el.open = false; };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && el.open) {
        close();
        el.querySelector('summary')?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (el.open && !el.contains(e.target as Node)) close();
    };
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && !el.contains(next)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    el.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
      el.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  // Close after a language change
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname, current]);

  return (
    <details ref={ref} className={styles.root}>
      <summary className={styles.summary}>
        <Flag locale={current} />
        {/* Sighted users see the short code; screen readers hear the full name */}
        <span aria-hidden="true">{LOCALE_CODES[current]}</span>
        <span className="sr-only">{t('languageNav')}: {LOCALE_NAMES[current]}</span>
        <ChevronDownIcon className={styles.chevron} />
      </summary>
      <ul className={styles.list}>
        {LOCALES.map((l) => (
          <li key={l}>
            <Link
              href={pathname}
              locale={l}
              lang={l}
              hrefLang={l}
              className={styles.option}
              aria-current={l === current ? 'true' : undefined}
            >
              <Flag locale={l} />
              <span aria-hidden="true">{LOCALE_CODES[l]}</span>
              <span className="sr-only">{LOCALE_NAMES[l]}</span>
              {l === current && <CheckIcon className={styles.check} />}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}