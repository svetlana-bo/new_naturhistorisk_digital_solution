import React, { useEffect, useState } from 'react';
import styles from '../modules/ResetOverlay.module.css';
import iconClock from '../assets/icons/clock.svg';
import flowerOrange from '../assets/images/flower-orange.svg';

export default function ResetOverlay({ onCountdownFinished }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      onCountdownFinished(); // hides the overlay, go back to default screen
      return;
    }

    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onCountdownFinished]);

  return (
    <div className={styles.container}>
      <img src={flowerOrange} alt="Flower decoration" className={styles.flower_orange1} />
      <div className={styles.header}>
        <img src={iconClock} alt="Clock icon" className={styles.icon_clock} />
      </div>
      <img src={flowerOrange} alt="Flower decoration" className={styles.flower_orange2} />
      
      <p className={styles.text_box}>
        Restart in <br />
        <span className={styles.countdown}>{countdown}</span> seconds
      </p>
    </div>
  );
}
