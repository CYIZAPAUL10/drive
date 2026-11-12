import { useTranslations } from 'next-intl';
import ForgotPasswordForm from '@/frontend/components/account/ForgotPasswordForm';
import { accent } from '@/frontend/components/ui/rich';
import AccountFormPage from './AccountFormPage';

export default function ForgotPasswordPage({ locale }: { locale: string }) {
  const t = useTranslations('Account');
  return (
    <AccountFormPage title={t.rich('forgot.title', { accent })} intro={t('forgot.intro')}>
      <ForgotPasswordForm locale={locale} />
    </AccountFormPage>
  );
}