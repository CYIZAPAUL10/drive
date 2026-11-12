import styles from './Taxi.module.css';

/** Decorative. A small Cybertruck-style taxi drives along a road line as the yellow band scrolls into view. */
export default function Taxi() {
  return (
    <div className={styles.road} aria-hidden="true">
      <div className={styles.driver} data-motion="driver">
        <svg className={styles.taxi} viewBox="0 0 120 48" width="96" height="38" focusable="false">
          {/* Body: one angular wedge. Flat tail (left), roof peak at x=48, long straight slope down to the nose (right) */}
          <path className={styles.body} d="M4 38 V18 L48 6 L114 26 V38 Z" />

          {/* Roof taxi sign, sitting on the roof peak */}
          

          {/* One angular window panel, parallel to the roof line */}
          <path className={styles.window} d="M38 20 L48 10 L74 17 L86 20 Z" />

          {/* Front light bar (the Cybertruck signature) */}
          <rect className={styles.light} x="107" y="26" width="7" height="3" rx="1" />

          {/* Wheels last, so they draw in front of the body */}
          <circle className={styles.wheel} cx="26" cy="37" r="9" />
          <circle className={styles.wheel} cx="94" cy="37" r="9" />
        </svg>
      </div>
    </div>
  );
}