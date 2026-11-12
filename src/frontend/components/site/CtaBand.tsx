import { useTranslations } from 'next-intl';
import Button from '@/frontend/components/ui/Button';
import { CalendarIcon, PhoneIcon, WhatsAppIcon } from '@/frontend/components/ui/Icons';
import { whatsappUrl } from '@/shared/constants/contact';
import type { SiteProfile } from '@/shared/types/profile';
import Taxi from './Taxi';
import styles from './CtaBand.module.css';

export default function CtaBand({ profile }: { profile: SiteProfile }) {
  const t = useTranslations('CtaBand');
  const home = useTranslations('Home');
  return (
    <section className={styles.band} aria-labelledby="cta-title" data-motion="cta">
      <div className={styles.inner}>
        <div>
          <h2 id="cta-title" className={styles.title}>{t('title')}</h2>
          <p className={styles.text}>{t('text')}</p>
        </div>
        <div className={styles.actions}>
          <Button href="/book" variant="dark" icon={<CalendarIcon />}>{home('requestRide')}</Button>
          <Button href={`tel:${profile.phone}`} external variant="secondary" icon={<PhoneIcon />}>{home('callElvais')}</Button>
          <Button
            href={whatsappUrl(home('whatsappPrefill'), profile.whatsappDigits)}
            external
            newTab
            variant="secondary"
            icon={<WhatsAppIcon />}
          >
            {home('whatsappElvais')}
          </Button>
        </div>
      </div>
      <Taxi />
    </section>
  );
}