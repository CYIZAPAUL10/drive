import { useTranslations } from 'next-intl';
import { Link } from '@/frontend/i18n/navigation';
import Button from '@/frontend/components/ui/Button';
import { MenuIcon } from '@/frontend/components/ui/Icons';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import AccountMenu from './AccountMenu';
import StickyHeader from './StickyHeader';
import styles from './SiteHeader.module.css';

function NavItems() {
  const t = useTranslations('Layout');
  return (
    <>
      <li><Link href="/#services" className={styles.navLink}>{t('navServices')}</Link></li>
      <li><Link href="/#how" className={styles.navLink}>{t('navHow')}</Link></li>
      <li><Link href="/#about" className={styles.navLink}>{t('navAbout')}</Link></li>
      <li><Button href="/book">{t('navBook')}</Button></li>
    </>
  );
}

export default function SiteHeader() {
  const t = useTranslations('Layout');
  return (
    <StickyHeader>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}><Logo priority /></Link>

        {/* Wide screens: inline navigation */}
        <nav aria-label={t('mainNav')} className={styles.desktopNav}>
          <ul className={styles.navList}><NavItems /></ul>
        </nav>

        <div className={styles.controls}>
          <AccountMenu />
          <LanguageSwitcher />

          {/* Small screens: navigation in a native disclosure (works without JavaScript) */}
          <details className={styles.menu}>
            <summary className={styles.summary}>
              <MenuIcon />
              <span className="sr-only">{t('menu')}</span>
            </summary>
            <div className={styles.panel}>
              <nav aria-label={t('mainNav')}>
                <ul className={styles.navList}><NavItems /></ul>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </StickyHeader>
  );
}