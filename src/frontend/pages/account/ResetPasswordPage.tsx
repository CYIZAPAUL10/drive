import { useTranslations } from 'next-intl';
import ResetPasswordForm from '@/frontend/components/account/ResetPasswordForm';
import { accent } from '@/frontend/components/ui/rich';
import Button from '@/frontend/components/ui/Button';
import AccountFormPage from './AccountFormPage';
import styles from '@/frontend/components/account/AccountForms.module.css';

type Props = { locale: string; token: string; valid: boolean };

export default function ResetPasswordPage({ locale, token, valid }: Props) {
  const t = useTranslations('Account');

  if (!valid) {
    return (
      <AccountFormPage title={t('reset.invalidTitle')}>
        <div role="status" className={styles.panel}>
          <p>{t('reset.invalidText')}</p>
        </div>
        <p className={styles.links}>
          <Button href="/account/forgot-password">{t('reset.requestNew')}</Button>
        </p>
      </AccountFormPage>
    );
  }

  return (
    <AccountFormPage title={t.rich('reset.title', { accent })} intro={t('reset.intro')}>
      <ResetPasswordForm locale={locale} token={token} />
    </AccountFormPage>
  );
}