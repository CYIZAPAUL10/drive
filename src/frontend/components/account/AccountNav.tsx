import { useTranslations } from 'next-intl';
import { Link } from '@/frontend/i18n/navigation';
import { logoutAction } from '@/server/actions/account.actions';
import styles from './AccountNav.module.css';

export default function AccountNav({ locale }: { locale: string }) {
  const t = useTranslations('Account.nav');
  return (
    <nav aria-label={t('label')} className={styles.nav}>
      <ul className={styles.list}>
        <li><Link href="/account/requests" className={styles.link}>{t('requests')}</Link></li>
        <li><Link href="/account/settings" className={styles.link}>{t('settings')}</Link></li>
        <li>
          <form action={logoutAction}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className={styles.signOut}>{t('signOut')}</button>
          </form>
        </li>
      </ul>
    </nav>
  );
}