'use client';

import { useTranslations } from 'next-intl';
import { PageSkeleton } from './Skeleton';

export default function LocalizedSkeleton() {
  const t = useTranslations('Ui');
  return <PageSkeleton label={t('loading')} />;
}