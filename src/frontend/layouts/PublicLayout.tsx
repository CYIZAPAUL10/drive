import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import SiteHeader from '@/frontend/components/site/SiteHeader';
import SiteFooter from '@/frontend/components/site/SiteFooter';
import type { SiteProfile } from '@/shared/types/profile';
import styles from './PublicLayout.module.css';

export default function PublicLayout({ children, profile }: { children: ReactNode; profile: SiteProfile }) {
  const t = useTranslations('Layout');
  return (
    <>
      <a className={styles.skip} href="#main">{t('skipToContent')}</a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className={styles.main}>{children}</main>
      <SiteFooter profile={profile} />
    </>
  );
}