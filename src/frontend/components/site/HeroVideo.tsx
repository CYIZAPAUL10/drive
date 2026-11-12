'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import styles from './HeroVideo.module.css';

type Props = {
  src: string;
  poster: string;
  alt: string;
  labels: { pause: string; play: string };
};

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** Autoplaying muted loop. People who ask for reduced motion get the still poster instead,
 *  and everyone else gets a pause button (WCAG 2.2.2). */
export default function HeroVideo({ src, poster, alt, labels }: Props) {
  // The server snapshot is "true", so the server renders the still image
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
    <div className={styles.wrap}>
      {reduced ? (
        <Image
          src={poster}
          alt={alt}
          width={900}
          height={800}
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className={styles.media}
        />
      ) : (
        <>
          <video
            ref={ref}
            className={styles.media}
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={alt}
          />
          <button type="button" className={styles.toggle} onClick={toggle} aria-label={playing ? labels.pause : labels.play}>
            <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
          </button>
        </>
      )}
    </div>
  );
}