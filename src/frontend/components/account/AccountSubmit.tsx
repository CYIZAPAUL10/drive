'use client';

import { useFormStatus } from 'react-dom';
import buttonStyles from '@/frontend/components/ui/Button.module.css';

type Props = { idle: string; busy: string; variant?: 'primary' | 'secondary' | 'danger' };

export default function AccountSubmit({ idle, busy, variant = 'primary' }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`${buttonStyles.btn} ${buttonStyles[variant]}`}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? busy : idle}
    </button>
  );
}