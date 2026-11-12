import styles from './AnimatedCheck.module.css';

/** The circle draws itself, then the tick. Decorative: the heading says what happened. */
export default function AnimatedCheck() {
  return (
    <svg className={styles.check} viewBox="0 0 52 52" width="64" height="64" aria-hidden="true" focusable="false">
      <circle className={styles.circle} cx="26" cy="26" r="23" pathLength="1" />
      <path className={styles.tick} d="M15 27l8 8 15-17" pathLength="1" />
    </svg>
  );
}