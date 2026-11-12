import type { ReactNode } from 'react';
import Link from 'next/link';
import Logo from '@/frontend/components/site/Logo';
import { logoutAdminAction } from '@/server/actions/admin.actions';
import styles from './AdminShell.module.css';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/requests', label: 'Requests' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/profile', label: 'Profile' },
  { href: '/admin/social', label: 'Social links' },
  { href: '/admin/account', label: 'Account' },
] as const;

export default function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  return (
    <>
      <a className={styles.skip} href="#main">Skip to main content</a>
      <header className={`surface-dark ${styles.header}`}>
        <div className={styles.inner}>
          <Link href="/admin" className={styles.brand}>
            <Logo priority />
            <span className={styles.tag}>Admin</span>
          </Link>
          <nav aria-label="Admin">
            <ul className={styles.nav}>
              {NAV.map((item) => (
                <li key={item.href}><Link href={item.href} className={styles.navLink}>{item.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div className={styles.account}>
            <span className={styles.email}>{email}</span>
            <form action={logoutAdminAction}>
              <button type="submit" className={styles.signOut}>Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className={styles.main}>{children}</main>
    </>
  );
}