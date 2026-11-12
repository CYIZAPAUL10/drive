import { useTranslations } from 'next-intl';
import Button from '@/frontend/components/ui/Button';
import { accent } from '@/frontend/components/ui/rich';
import AccountFormPage from './AccountFormPage';
import styles from '@/frontend/components/account/AccountForms.module.css';

export default function VerifyPage({ result }: { result: 'verified' | 'invalid' }) {
  const t = useTranslations('Account');
  const ok = result === 'verified';
  return (
    <AccountFormPage title={t.rich(ok ? 'verify.okTitle' : 'verify.invalidTitle', { accent })}>
      <div role="status" className={styles.panel}>
        <p>{t(ok ? 'verify.okText' : 'verify.invalidText')}</p>
      </div>
      <p className={styles.links}>
        <Button href="/account/login">{t('verify.signIn')}</Button>
      </p>
    </AccountFormPage>
  );
}