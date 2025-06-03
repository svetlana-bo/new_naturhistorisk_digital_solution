// BirdAvatar: A component that renders an animated bird reacting to player arm movements
import styles from '../modules/BirdAvatar.module.css';
import React, { useEffect, useRef, useState } from 'react';
import { usePoseTracker } from '../hooks/usePoseTracker';

import WinOverlay from './WinOverlay';
import winVideo from '../assets/videos/Bird6.mp4'; 

import iconDown from '../assets/icons/Instruction1-down.svg';
import iconUp from '../assets/icons/Instruction1-up.svg';
import Instruction from './Instruction';

import leftWing from '../assets/bird/bird-left-wing.png';
import rightWing from '../assets/bird/bird-right-wing.png';
import body from '../assets/bird/bird-body.png';

export default function BirdAvatar({ onWin, onResetDone }) {

  // Custom hook to track pose data and manage video/canvas references
  const { videoRef, canvasRef, poseData } = usePoseTracker();

  // Wing animation states (ref to avoid triggering rerenders)
  const wingState = useRef({ left: 'idle', right: 'idle' });
  const lastAngle = useRef({ left: 0, right: 0 });
  const lastRaised = useRef(false);

  // State to manage score and win condition
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  //Utility functions for angle calculations and clamping
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  // Smooth angle calculation to avoid jittery movements
  const smoothAngle = (side, newAngle) => {
    const smoothed = 0.8 * lastAngle.current[side] + 0.2 * newAngle;
    lastAngle.current[side] = smoothed;
    return smoothed;
  };

  // Calculate angle between two body keypoints
  const getAngle = (a, b) => {
    if (!a || !b || isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) return 0;
    return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
  };

  //Main animation and win logic
  useEffect(() => {
    if (!poseData || !canvasRef.current) return;

    // Get keypoints for shoulders and wrists
    const key = (name) => poseData.keypoints.find((k) => k.name === name);
    const leftShoulder = key('left_shoulder');
    const rightShoulder = key('right_shoulder');
    const leftWrist = key('left_wrist');
    const rightWrist = key('right_wrist');

    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;
    const mirrorX = (x) => canvasWidth - x;
    const bodyPoseY = (leftShoulder?.y + rightShoulder?.y) / 2;
    const centerY = canvasHeight / 2;
    const verticalOffset = centerY - bodyPoseY;

    // Get references to the wing and body elements
    const leftWingEl = document.getElementById('leftWing');
    const rightWingEl = document.getElementById('rightWing');
    const bodyImg = document.getElementById('birdBody');

    // Update wing states based on wrist and shoulder positions (idle / raising / raised / lowering)
    const updateWingState = (side, wrist, shoulder) => {
      const state = wingState.current[side];
      if (!wrist || !shoulder || wrist.score < 0.3) {
        wingState.current[side] = 'idle';
        return;
      }
      const isAbove = wrist.y < shoulder.y;
      switch (state) {
        case 'idle': wingState.current[side] = isAbove ? 'raising' : 'idle'; break;
        case 'raising': wingState.current[side] = isAbove ? 'raised' : 'lowering'; break;
        case 'raised': wingState.current[side] = isAbove ? 'raised' : 'lowering'; break;
        case 'lowering': wingState.current[side] = isAbove ? 'raising' : 'idle'; break;
      }
    };

    // Update the wing states based on current pose data
    updateWingState('left', leftWrist, leftShoulder);
    updateWingState('right', rightWrist, rightShoulder);

    // Check if both wings are raised and update score
    const bothRaised = wingState.current.left === 'raised' && wingState.current.right === 'raised';
    if (bothRaised && !lastRaised.current && !won) {
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore >= 3) {
          setWon(true);
          setTimeout(() => onWin?.(), 0);
        }
        return newScore;
      });
    }
    lastRaised.current = bothRaised;

    // Vertical offset adjustments for wing animation
    const getWingOffset = (side) => {
      switch (wingState.current[side]) {
        case 'raising':
        case 'raised': return 0;
        case 'lowering': return -10;
        default: return 0;
      }
    };

    // Update left wing position and rotation
    if (leftWingEl && leftShoulder) {
      const leftWingX = mirrorX(leftShoulder.x - 50);
      leftWingEl.style.left = `${leftWingX}px`;
      leftWingEl.style.top = `${leftShoulder.y + verticalOffset + 120 + getWingOffset('left')}px`;
      if (leftWrist?.score > 0.5) {
        const rawAngle = getAngle(leftShoulder, leftWrist);
        const angle = clamp(rawAngle, -90, 90);
        const smoothed = smoothAngle('left', -angle);
        leftWingEl.style.transform = `translate(-50%, -30%) rotate(${smoothed}deg)`;
      } else {
        leftWingEl.style.transform = `translate(-50%, -30%)`;
      }
    }

    // Update right wing position and rotation
    if (rightWingEl && rightShoulder) {
      const rightWingX = mirrorX(rightShoulder.x - 30);
      rightWingEl.style.left = `${rightWingX}px`;
      rightWingEl.style.top = `${rightShoulder.y + verticalOffset + 120 + getWingOffset('right')}px`;
      if (rightWrist?.score > 0.5) {
        const angle = clamp(getAngle(rightShoulder, rightWrist), -90, 90);
        const smoothed = smoothAngle('right', angle);
        rightWingEl.style.transform = `translate(-50%, -30%) rotate(${smoothed}deg)`;
      } else {
        rightWingEl.style.transform = `translate(-50%, -30%)`;
      }
    }

  // Position the bird body centered between the shoulders of the user
    if (bodyImg && leftShoulder && rightShoulder) {
      const leftWingX = mirrorX(leftShoulder.x + 50);
      const rightWingX = mirrorX(rightShoulder.x - 110);
      const centerX = (leftWingX + rightWingX) / 2;
      const topY = centerY;
      if (bodyImg.complete) {
        bodyImg.style.left = `${centerX - bodyImg.offsetWidth / 2}px`;
        bodyImg.style.top = `${topY}px`;
      }
    }
  }, [poseData, won]);

 

  return (
    <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 640, height: 480 }}>
      <Instruction icon1={iconDown} icon2={iconUp} interval={800} />
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
}
