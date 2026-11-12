'use client';

import { useEffect, useRef } from 'react';
import styles from './ErrorSummary.module.css';

type Item = { targetId: string; text: string };

type Props = {
  title: string;
  message?: string;
  items: Item[];
  focusKey: unknown; // changes on every failed submit, so focus moves to the summary each time
};

export function ErrorSummary({ title, message, items, focusKey }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, [focusKey]);

  return (
    <div ref={ref} tabIndex={-1} role="alert" aria-labelledby="error-summary-title" className={styles.box}>
      <h2 id="error-summary-title" className={styles.title}>{title}</h2>
      {message && <p className={styles.message}>{message}</p>}
      {items.length > 0 && (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.targetId}><a href={`#${item.targetId}`}>{item.text}</a></li>
          ))}
        </ul>
      )}
    </div>
  );
}