//Instruction - component that displays the gesture inscrutions as alternating icons at a set interval

import { useEffect, useState } from 'react';
import styles from '../modules/Instruction.module.css';

export default function Instruction({ icon1, icon2, interval = 1000 }) {
  // State to track which icons to show
  const [showFirst, setShowFirst] = useState(true);

  // Effect to toggle icons at the specified interval
  useEffect(() => {
    const id = setInterval(() => setShowFirst(prev => !prev), interval);
    return () => clearInterval(id);
  }, [interval]);

  // Determine which icon to show based on state
  const currentIcon = showFirst ? icon1 : icon2;

  return (
    <div className={styles.instuction_box}>
      <img
        src={currentIcon}
        alt="instruction icon"
        className={styles.instruction_icon}
      />
    </div>
  );
}
