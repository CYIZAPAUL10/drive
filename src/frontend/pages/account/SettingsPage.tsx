import { useLocale, useTranslations } from 'next-intl';
import AccountNav from '@/frontend/components/account/AccountNav';
import DeleteAccountForm from '@/frontend/components/account/DeleteAccountForm';
import { accent } from '@/frontend/components/ui/rich';
import AccountFormPage from './AccountFormPage';
import styles from './SettingsPage.module.css';

type Props = { fullName: string; email: string; phone: string; hasPassword: boolean };

export default function SettingsPage({ fullName, email, phone, hasPassword }: Props) {
  const t = useTranslations('Account');
  const locale = useLocale();
  const details: Array<[string, string]> = [
    [t('fields.fullName.label'), fullName],
    [t('fields.email.label'), email],
    [t('fields.phone.label'), phone || '-'],
  ];

  return (
    <AccountFormPage title={t.rich('settings.title', { accent })}>
      <AccountNav locale={locale} />
      <section aria-labelledby="details-title">
        <h2 id="details-title" className={styles.h2}>{t('settings.detailsTitle')}</h2>
        <dl className={styles.details}>
          {details.map(([name, value]) => (
            <div key={name} className={styles.item}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <DeleteAccountForm locale={locale} hasPassword={hasPassword} />
    </AccountFormPage>
  );
}