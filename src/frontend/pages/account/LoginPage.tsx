import { useTranslations } from 'next-intl';
import LoginForm from '@/frontend/components/account/LoginForm';
import GoogleButton from '@/frontend/components/account/GoogleButton';
import { accent } from '@/frontend/components/ui/rich';
import AccountFormPage from './AccountFormPage';
import styles from './AuthAlert.module.css';

type Props = {
  locale: string;
  next: string;
  notice?: 'reset' | 'deleted';
  googleEnabled: boolean;
  error?: 'google' | 'google_cancelled' | 'google_unverified';
};

export default function LoginPage({ locale, next, notice, googleEnabled, error }: Props) {
  const t = useTranslations('Account');
  const auth = useTranslations('Auth');
  return (
    <AccountFormPage title={t.rich('login.title', { accent })} intro={t('login.intro')}>
      {error && (
        <div role="alert" className={styles.alert}>
          <p>{auth(`google.error.${error}`)}</p>
        </div>
      )}
      {googleEnabled && <GoogleButton locale={locale} next={next} />}
      <LoginForm locale={locale} next={next} notice={notice} />
    </AccountFormPage>
  );
}