import React, { useState } from 'react';
import styles from '../modules/WinOverlay.module.css';
import iconHeart from '../assets/icons/heart.svg';
import flower from '../assets/images/flower.svg';

export default function WinOverlay({ onReset, videoScr, nextView }) {
  const [showNext, setShowNext] = useState(false);

  const handleVideoEnd = () => {
    onReset?.();        // optional chaining to avoid error if not passed
    setShowNext(true);  // trigger rendering of new view
  };

  if (showNext && nextView) return nextView;

  return (
    <div className={styles.container}>
      <img src={flower} alt="Flower decoration" className={styles.flower1} />
      <div className={styles.header}>
        <img src={iconHeart} alt="Heart icon" className={styles.icon_heart} />
        You won!
      </div>
      <img src={flower} alt="Flower decoration" className={styles.flower2} />
      
      <div className={styles.videoWrapper}>
        <video
          src={videoScr}
          className={styles.video}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
        />
      </div>

      <p className={styles.text}>
        Learn more on the 2nd floor in Den Globale Baghave
      </p>
    </div>
  );
}
