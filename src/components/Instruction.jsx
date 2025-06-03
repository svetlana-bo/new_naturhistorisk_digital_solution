// Instruction - component that displays the gesture instructions as alternating icons
// and reacts to user's score updates by showing a countdown overlay (e.g., 3 → 2 → 1).

import { useEffect, useRef, useState } from 'react';
import styles from '../modules/Instruction.module.css';

export default function Instruction({ icon1, icon2, interval = 1000, score }) {
  // Toggle state for alternating icons
  const [showFirst, setShowFirst] = useState(true);

  // State for showing countdown overlay
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);

  // Ref to store the previous score to detect changes
  const prevScoreRef = useRef(score);

  // Toggle between the two icons at the specified interval
  useEffect(() => {
    const id = setInterval(() => setShowFirst(prev => !prev), interval);
    return () => clearInterval(id); // Cleanup on unmount
  }, [interval]);

  // Show countdown overlay when score increases (but is still < 3)
  useEffect(() => {
    // Only react if score is different from the previous one
    if (
      score >= 0 &&
      score <= 3 &&
      score !== prevScoreRef.current
    ) {
      // Set countdown value to show (reverse logic: 3 - current score)
      setCountdownValue(3 - score);
      setShowCountdown(true); // Trigger overlay

      // Hide overlay after 3 seconds
      const timer = setTimeout(() => setShowCountdown(false), 2000);

      // Update the stored previous score
      prevScoreRef.current = score;

      return () => clearTimeout(timer); // Clean up timer
    }
  }, [score]);

  // Choose which icon to show based on toggle state
  const currentIcon = showFirst ? icon1 : icon2;

  return (
    <div className={styles.instruction_box}>
      {/* Instructional gesture icon (alternates) */}
      <img
        src={currentIcon}
        alt="instruction icon"
        className={styles.instruction_icon}
      />

      {/* Countdown overlay (e.g. 3, 2, 1) shown briefly on score update */}
      {showCountdown && (
        <div className={styles.countdown_overlay}>
          {countdownValue}
        </div>
      )}
    </div>
  );
}
