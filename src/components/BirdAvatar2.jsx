
// BirdAvatar: A component that renders an animated bird reacting to player head movements
import styles from '../modules/BirdAvatar.module.css';
import React, { useEffect, useRef, useState } from 'react';
import { usePoseTracker } from '../hooks/usePoseTracker';

import WinOverlay from './WinOverlay';
import winVideo from '../assets/videos/Bird2.mp4'; 

import iconDown from '../assets/icons/Instruction2-down.svg';
import iconUp from '../assets/icons/Instruction2-up.svg';
import Instruction from './Instruction';

import leftWing from '../assets/bird/bird-2-left-wing.svg';
import rightWing from '../assets/bird/bird-2-right-wing.svg'
import body from '../assets/bird/bird-2-body.svg';

export default function BirdAvatar({ onWin, onResetDone }) {
  const { videoRef, canvasRef, poseData } = usePoseTracker();
  

  const smoothedXRef = useRef(0);
  const lastAnglesRef = useRef({ left: 0, right: 0 });

  const smoothAngle = (side, newAngle) => {
    const last = lastAnglesRef.current[side];
    const smoothed = 0.8 * last + 0.2 * newAngle;
    lastAnglesRef.current[side] = smoothed;
    return smoothed;
  };
  

  const headPhaseRef = useRef({ origin: null, dir: null });
  const WIN_THRESHOLD = 2;
  
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  const [containerPos, setContainerPos] = useState({ x: 0, y: 200 });

  /* For wing movement */
  const getAngle = (a, b) => {
    if (!a || !b || isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) return 0;
    return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
  };
  


  useEffect(() => {
    if (!poseData || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const k = (n) => poseData.keypoints.find((p) => p.name === n);
    const nose = k('nose');
    const Ls = k('left_shoulder');
    const Rs = k('right_shoulder');
    const Lw = k('left_wrist');
    const Rw = k('right_wrist');


    /* Body movement */
    const W = canvasRef.current.width;
    const TH = 40;

    const canvasWidth = canvasRef.current.width;
    const mx = (x) => canvasWidth - x;

    const centreX = (mx(Ls.x) + mx(Rs.x)) / 2;
    const dx = mx(nose.x) - centreX;
    const maxOffset = 60;
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, dx));
    const containerX = canvasWidth / 2 + offsetX -280;


    // Horizontal offset from head movement
    if (!(nose && Ls && Rs && nose.score > .5)) return;

    // Vertical alignment based on shoulders
    const containerY = 0;
    const alpha = 0.1; // lower = smoother but more lag
    smoothedXRef.current = smoothedXRef.current * (1 - alpha) + containerX * alpha;

    setContainerPos({ x: smoothedXRef.current, y: containerY });

    /* Wing movement */
    const leftWingEl = document.getElementById('leftWing');
    const rightWingEl = document.getElementById('rightWing');

    // LEFT wing
    if (leftWingEl && Ls && Lw && Lw.score > 0.5) {
      const angle = getAngle(Ls, Lw);
      const amplified = angle * 2; 
      const clamped = Math.max(-20, Math.min(70, -amplified));
      const smoothed = smoothAngle('left', clamped);
      leftWingEl.style.transform = `translate(-15%, 260%) rotate(${smoothed}deg)`;

    };

    // RIGHT wing
    if (rightWingEl && Rs && Rw && Rw.score > 0.5) {
      const angle = getAngle(Rs, Rw);
      const amplified = angle * 2; 
      const clamped = Math.max(-70, Math.min(20, amplified));
      const smoothed = smoothAngle('right', clamped);
      rightWingEl.style.transform = `translate(75%, 260%) rotate(${smoothed}deg)`;

    };

    const phase = headPhaseRef.current;
    if (phase.origin === null) phase.origin = dx;

    const delta = dx - phase.origin;

    if (!phase.dir) {
      if (delta > TH) { phase.dir = 'right'; phase.origin = dx; }
      if (delta < -TH) { phase.dir = 'left'; phase.origin = dx; }
    } else if (
      (phase.dir === 'left' && delta > TH) ||
      (phase.dir === 'right' && delta < -TH)
    ) {
      setScore(p => {
        const n = p + 1;
        if (n >= WIN_THRESHOLD && !won) {
          setWon(true);
          onWin?.();
        }
        return n;
      });
      phase.dir = null;
      phase.origin = dx;
    }


  }, [poseData, won, onWin]);

  return (
    <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 640, height: 480 }}>
      <Instruction
        icon1={iconDown}
        icon2={iconUp}
        interval={1000}
        score={score}
        countdownStart={WIN_THRESHOLD} />
      <video ref={videoRef} width="640" height="480" style={{ display: 'none' }} />
      <canvas ref={canvasRef} width={640} height={480} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />

      <div id="birdContainer" className={styles.bird_container}
        style={{
          position: 'absolute',
          top: `${containerPos.y}px`,
          left: `${containerPos.x}px`,
        }}>
        <img id="birdBody" src={body} alt="Bird body" style={{
          position: 'absolute',
          bottom: '-10%',
          width: '35%',
          transformOrigin: 'center',
          zIndex: 1,
          transition: 'top 0.1s ease-out, left 0.1s ease-out, transform 0.1s ease-out',
        }} />
        <img id="leftWing" src={leftWing} alt="Left wing" style={{
          position: 'absolute',
          width: '20%',
          transform: 'translate(-15%, 260%)',
          transformOrigin: '80% 20%',
          zIndex: 1,
          transition: 'transform 0.2s ease-out',
        }} />
        <img id="rightWing" src={rightWing} alt="Right wing" style={{
          position: 'absolute',
          transform: 'translate(75%, 260%)',
          transformOrigin: '20% 20%',
          width: '20%',
          zIndex: 0,
          transition: 'transform 0.2s ease-out',
        }} />
      </div>

      {won && (
        <WinOverlay
          videoScr={winVideo}
          onReset={() => {
            setScore(0);
            setWon(false);
            onResetDone?.();
          }}
        />
      )}
    </div>
  );
}