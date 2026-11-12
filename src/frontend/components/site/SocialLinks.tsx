import { useTranslations } from 'next-intl';
import { SOCIAL_PLATFORMS } from '@/shared/constants/socialPlatforms';
import type { SiteProfile } from '@/shared/types/profile';
import { BrandIcon } from '@/frontend/components/ui/BrandIcons';
import styles from './SocialLinks.module.css';

export default function SocialLinks({ links = [] }: { links?: SiteProfile['socials'] }) {
  const t = useTranslations('Footer');
  // Only ever render real web links, even if the database held something unexpected
  const items = links.filter((l) => l.url.startsWith('https://'));
  if (items.length === 0) return null;

  return (
    <nav aria-label={t('followUs')}>
      <ul className={styles.list}>
        {items.map(({ platform, url }) => {
          const label = SOCIAL_PLATFORMS.find((p) => p.key === platform)?.label ?? platform;
          return (
            <li key={platform}>
              <a href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                <BrandIcon platform={platform} />
                <span className="sr-only">{label} {t('opensNewTab')}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}