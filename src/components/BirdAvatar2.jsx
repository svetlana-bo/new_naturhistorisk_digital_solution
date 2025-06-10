// BirdAvatar: A component that renders an animated bird reacting to player arm movements
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

export default function BirdAvatar({ onWin, onResetDone, canvasRef }) {

  // Custom hook to track pose data and manage video/canvas references
  const { videoRef, poseData } = usePoseTracker();

  // Wing animation states (ref to avoid triggering rerenders)
/*   const wingState = useRef({ left: 'idle', right: 'idle' });
  const lastAngle = useRef({ left: 0, right: 0 });
  const lastRaised = useRef(false); */
  const headPhaseRef = useRef({ origin: null, dir: null });

  // Define of successful actions to win
  const WIN_THRESHOLD = 2;

  // State to manage score and win condition
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  /*   //Utility functions for angle calculations and clamping
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  
    // Smooth angle calculation to avoid jittery movements
    const smoothAngle = (side, newAngle) => {
      const smoothed = 0.8 * lastAngle.current[side] + 0.2 * newAngle;
      lastAngle.current[side] = smoothed;
      return smoothed; */

  /*   // Calculate angle between two body keypoints
    const getAngle = (a, b) => {
      if (!a || !b || isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) return 0;
      return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
    };
  
    const getWingTransform = (angle, scale = 0.75) =>
      `translate(-50%, -30%) rotate(${angle}deg) scale(${scale})`;
  
  const getIdleWingTransform = (scale = 0.75) =>
      `translate(-50%, -30%) scale(${scale})`; */
  
  /* ------------------------------------------------------------------ */
  /*  useEffect : head-swing gesture                                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!poseData || !canvasRef.current) return;

    /* ------ grab keypoints ------------------------------------------ */
    const k = (n) => poseData.keypoints.find((p) => p.name === n);
    const nose = k('nose');                    // head proxy
    const Ls = k('left_shoulder');
    const Rs = k('right_shoulder');
    if (!(nose && Ls && Rs && nose.score > .5)) return;

    /* ------ mirror X so logic = what you see ------------------------ */
    const W = canvasRef.current.width;
    const mx = (x) => W - x;

    /* ------ centre of shoulders (reference) ------------------------- */
    const centreX = (mx(Ls.x) + mx(Rs.x)) / 2;

    /* ------ how far head moved left/right from centre --------------- */
    const dx = mx(nose.x) - centreX;     // + = right, − = left
    const TH = 40;                       // ≈ 40 px ~ “about 40°”

    /* ------ sway phase machine -------------------------------------- */ 
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
      /* ---------- SUCCESS : one left-right or right-left ------------ */
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

      <div id="birdContainer" className={styles.bird_container}>
        <img id="birdBody" src={body} alt="Bird body" style={{
          position: 'absolute',
          width: '35%',
          transformOrigin: 'center',
          zIndex: 1,
          transition: 'top 0.1s ease-out, left 0.1s ease-out, transform 0.1s ease-out',
        }} />
        <img id="leftWing" src={leftWing} alt="Left wing" style={{
          position: 'absolute',
          width: '25%',
          transformOrigin: '80% 20%',
          zIndex: 1,
          transition: 'transform 0.2s ease-out',
        }} />
        <img id="rightWing" src={rightWing} alt="Right wing" style={{
          position: 'absolute',
          transformOrigin: '20% 20%',
          width: '25%',
          zIndex: 1,
          transition: 'transform 0.2s ease-out',
        }} />
      </div>

      {won && (
        <WinOverlay
          videoScr={winVideo}
          onReset={() => {
            setScore(0);
            setWon(false);
            onResetDone?.();// defers the parent trigger
          }}
        />
      )}
    </div>
  );
};