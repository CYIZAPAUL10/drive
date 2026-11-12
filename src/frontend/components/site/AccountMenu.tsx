'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/frontend/i18n/navigation';
import { logoutAction } from '@/server/actions/account.actions';
import styles from './AccountMenu.module.css';

type Me = { signedIn: false } | { signedIn: true; name: string; initials: string };

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function AccountMenu() {
  const t = useTranslations('Auth.menu');
  const locale = useLocale();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const ref = useRef<HTMLDetailsElement>(null);

  // Asks "who is signed in?" after each page change, so the icon follows signing in and out
  useEffect(() => {
    let cancelled = false;
    fetch('/api/account/me', { cache: 'no-store', credentials: 'same-origin' })
      .then((response) => (response.ok ? response.json() : { signedIn: false }))
      .then((data: Me) => {
        if (!cancelled) setMe(data);
      })
      .catch(() => {
        if (!cancelled) setMe({ signedIn: false });
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Escape, click outside and tabbing out close the menu; it also closes after navigating
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const close = () => {
      el.open = false;
    };
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
  }, [me]);

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  if (me === null) return <span className={styles.slot} aria-hidden="true" />;

  if (!me.signedIn) {
    return (
      <Link href="/account/login" className={styles.button}>
        <UserIcon />
        <span className="sr-only">{t('signIn')}</span>
      </Link>
    );
  }

  return (
    <details ref={ref} className={styles.root}>
      <summary className={`${styles.button} ${styles.avatar}`}>
        <span aria-hidden="true">{me.initials}</span>
        <span className="sr-only">{t('label')}: {t('signedInAs', { name: me.name })}</span>
      </summary>
      <div className={styles.panel}>
        <p className={styles.name}>{t('signedInAs', { name: me.name })}</p>
        <ul className={styles.list}>
          <li><Link href="/account/requests" className={styles.item}>{t('requests')}</Link></li>
          <li><Link href="/account/settings" className={styles.item}>{t('settings')}</Link></li>
          <li>
            <form action={logoutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className={styles.item}>{t('signOut')}</button>
            </form>
          </li>
        </ul>
      </div>
    </details>
  );
}