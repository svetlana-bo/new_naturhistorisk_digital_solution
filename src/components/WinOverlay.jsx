// WinOverlay - component to show the overlay when the player "wins"

import React from 'react';
import styles from '../modules/WinOverlay.module.css';
import iconHeart from '../assets/icons/heart.svg';
import flower from '../assets/images/flower.svg';

// Ensure reusability by passing video source and reset callback as props
export default function WinOverlay({ onReset, videoScr }) {
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
          onEnded={onReset} //  triggers reset when video finishes
        />
      </div>

      <p className={styles.text}>
        Learn more on the 2nd floor in Den Globale Baghave
      </p>
    </div>
  );
}
