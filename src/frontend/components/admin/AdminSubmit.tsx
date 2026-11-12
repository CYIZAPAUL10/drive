'use client';

import { useFormStatus } from 'react-dom';
import buttonStyles from '@/frontend/components/ui/Button.module.css';

type Props = { idle: string; busy: string; variant?: 'primary' | 'secondary' | 'danger' };

export default function AdminSubmit({ idle, busy, variant = 'primary' }: Props) {
  const { pending } = useFormStatus();
  const cls =
    variant === 'danger'
      ? `${buttonStyles.btn} ${buttonStyles.danger}`
      : `${buttonStyles.btn} ${buttonStyles[variant]}`;
  return (
    <button type="submit" className={cls} disabled={pending} aria-busy={pending}>
      {pending ? busy : idle}
    </button>
  );
}