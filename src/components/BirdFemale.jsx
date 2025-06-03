import React, { useEffect, useState, useRef } from 'react';
import femaleBird from '../assets/bird/female_bird.png';

export default function BirdFemale({ isAttracted, resetTrigger }) {
  // Inline style controls female bird's position and size
  const [style, setStyle] = useState({
    top: '50%',
    left: '60vw',
    width: '15%',
    transform: 'scaleX(-1)', // Flip horizontally to face the avatar
  });

  const intervalRef = useRef(null);

  // Fly to player on win
  useEffect(() => {
    if (isAttracted) {
      clearInterval(intervalRef.current);
      setStyle({
        top: '60%',
        left: '30vw',
        width: '15%',
        transform: 'scaleX(-1)',
      });
    }
  }, [isAttracted]);

  // Reset + idle wander when resetTrigger changes  --
  //!! reset currently needs fixing, as it's interrupted by the rendering
  useEffect(() => {
    if (!isAttracted) {
      console.log('🔄 Reset triggered! Female bird going idle.');

      // Set to default position
      setStyle({
        top: '50%',
        left: '60vw',
        width: '15%',
        transform: 'scaleX(-1)',
      });

      clearInterval(intervalRef.current);

      // Start wandering every 3 sec
      intervalRef.current = setInterval(() => {
        const top = Math.floor(Math.random() * 20) + 40;   // 40–60%
        const left = Math.floor(Math.random() * 15) + 55;  // 55vw–70vw

        setStyle(prev => ({
          ...prev,
          top: `${top}%`,
          left: `${left}vw`,
        }));
      }, 3000);
    }

    return () => clearInterval(intervalRef.current);
  }, [resetTrigger]);

  // Render the bird
  return (
    <img
      src={femaleBird}
      alt="Female Bird"
      style={{
        position: 'absolute',
        ...style,
        height: '24vh', 
        width: 'auto',  // Maintain aspect ratio
        transition: 'top 2s ease-in-out, left 2s ease-in-out, width 2s ease-in-out',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
}
