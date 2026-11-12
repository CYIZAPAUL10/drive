'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import styles from './HeroBackground.module.css';

type Props = {
  src: string;
  poster: string;
  labels: { pause: string; play: string };
};

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** Decorative full-bleed video behind the hero. Place it as the first child of a
 *  `position: relative` section. Reduced-motion users get the still poster instead,
 *  everyone else gets a pause button (WCAG 2.2.2). */
export default function HeroBackground({ src, poster, labels }: Props) {
  // The server snapshot is "true", so the server renders the still image (good for load speed)
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => true);
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <div className={styles.bg} aria-hidden="true">
        {reduced ? (
          <Image src={poster} alt="" fill priority sizes="100vw" className={styles.fill} />
        ) : (
          <video
            ref={ref}
            className={styles.fill}
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
          />
        )}
      </div>
      {!reduced && (
        <button type="button" className={styles.toggle} onClick={toggle} aria-label={playing ? labels.pause : labels.play}>
          <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
        </button>
      )}
    </>
  );
}