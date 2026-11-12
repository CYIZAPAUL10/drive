import { useTranslations } from 'next-intl';
import RegisterForm from '@/frontend/components/account/RegisterForm';
import GoogleButton from '@/frontend/components/account/GoogleButton';
import { accent } from '@/frontend/components/ui/rich';
import AccountFormPage from './AccountFormPage';

export default function RegisterPage({ locale, googleEnabled }: { locale: string; googleEnabled: boolean }) {
  const t = useTranslations('Account');
  return (
    <AccountFormPage title={t.rich('register.title', { accent })} intro={t('register.intro')}>
      {googleEnabled && <GoogleButton locale={locale} />}
      <RegisterForm locale={locale} />
    </AccountFormPage>
  );
}