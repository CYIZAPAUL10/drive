import { useTranslations } from 'next-intl';
import Button from '@/frontend/components/ui/Button';
import HowItWorks from '@/frontend/components/site/HowItWorks';
import AnimatedCheck from '@/frontend/components/booking/AnimatedCheck';
import { accent } from '@/frontend/components/ui/rich';
import { PhoneIcon, WhatsAppIcon } from '@/frontend/components/ui/Icons';
import { whatsappUrl } from '@/shared/constants/contact';
import type { SiteProfile } from '@/shared/types/profile';
import styles from './ReceivedPage.module.css';

export default function ReceivedPage({ referenceCode, profile }: { referenceCode: string; profile: SiteProfile }) {
  const t = useTranslations('Received');
  const home = useTranslations('Home');

  return (
    <>
      <section className={`surface-dark ${styles.hero}`}>
        <div className={styles.inner}>
          <AnimatedCheck />
          <h1 className={styles.title}>{t.rich('title', { accent })}</h1>
          <p className={styles.lead}>{t('lead')}</p>
        </div>
      </section>

      <section className={styles.body}>
        <div className={styles.inner}>
          <div role="status" className={styles.codeBox} data-motion="code">
            <p className={styles.codeLabel}>{t('codeLabel')}</p>
            <p className={styles.code}>{referenceCode}</p>
            <p className={styles.keep}>{t('keepCode')}</p>
          </div>

          <p>{t('contactText')}</p>
          <p className={styles.strong}>{t('noPayment')}</p>

          <div className={styles.actions}>
            <Button href={`tel:${profile.phone}`} external variant="secondary" icon={<PhoneIcon />}>
              {home('callErvais')}
            </Button>
            <Button
              href={whatsappUrl(t('whatsappPrefill', { ref: referenceCode }), profile.whatsappDigits)}
              external
              newTab
              variant="secondary"
              icon={<WhatsAppIcon />}
            >
              {home('whatsappErvais')}
            </Button>
            <Button href="/">{t('backHome')}</Button>
          </div>
        </div>
      </section>

      <HowItWorks />
    </>
  );
}