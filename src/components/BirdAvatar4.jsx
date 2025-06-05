// BirdAvatar4: A component that renders an animated bird reacting to player arm movements
import styles from '../modules/BirdAvatar.module.css';
import React, { useEffect, useRef, useState } from 'react';
import { usePoseTracker } from '../hooks/usePoseTracker';

import WinOverlay from './WinOverlay';
import winVideo from '../assets/videos/Bird4.mp4'; 

import iconSpread from '../assets/icons/Instruction4-spread.svg';
import iconFold from '../assets/icons/Instruction4-fold.svg';
import Instruction from './Instruction';

import leftWing from '../assets/bird/bird-4-left-wing.png';
import rightWing from '../assets/bird/bird-4-right-wing.png';
import body from '../assets/bird/bird-4-body.png';

export default function BirdAvatar4({ onWin, onResetDone }) {
  // Pose detection & tracking
  const { videoRef, canvasRef, poseData } = usePoseTracker();

  // Refs and state for motion and logic
  const wingState = useRef({ left: 'idle', right: 'idle' });
  const lastAngle = useRef({ left: 0, right: 0, shared: 0, });
  const lastFolded = useRef(false);

  const WIN_THRESHOLD = 3;
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  // Utility functions
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const smoothAngle = (side, newAngle) => {
    const smoothed = 0.8 * lastAngle.current[side] + 0.2 * newAngle;
    lastAngle.current[side] = smoothed;
    return smoothed;
  };
  const getAngle = (a, b) => {
    if (!a || !b || isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) return 0;
    return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
  };

  const VIDEO_WIDTH = 640;
  const mirrorX = (x) => VIDEO_WIDTH - x;
  const verticalOffset = 0;

  const isFoldedRef = useRef(false); // This keeps its value between frames

  // Main logic to animate wings and check win condition
  useEffect(() => {
    if (!poseData || !canvasRef.current) return;

    // DOM elements
    const leftWingEl = document.getElementById('leftWing');
    const rightWingEl = document.getElementById('rightWing');
    const bodyImg = document.getElementById('birdBody');

    // Keypoints
    const key = (name) => poseData.keypoints.find((k) => k.name === name);
    const leftHip = key('left_hip');
    const rightHip = key('right_hip');
    const leftWrist = key('left_wrist');
    const rightWrist = key('right_wrist');
    const leftElbow = key('left_elbow');
    const rightElbow = key('right_elbow');
    const leftShoulder = key('left_shoulder');
    const rightShoulder = key('right_shoulder');

    const centerY = (leftShoulder.y + rightShoulder.y) / 2;
    const topY = centerY + verticalOffset + 120;

    if (!leftHip || !rightHip || !leftWrist || !rightWrist || !leftElbow || !rightElbow || !leftShoulder || !rightShoulder) return;

    // Folded arms detection (win condition)
    const LOWER_TORSO_Y = (leftHip.y + rightHip.y) / 2;
    const FOLD_THRESHOLD = 80;

    const wristsClose = Math.abs(leftWrist.x - rightWrist.x) < FOLD_THRESHOLD;
    const handsLow = leftWrist.y > LOWER_TORSO_Y && rightWrist.y > LOWER_TORSO_Y;
    const handsFacingDown = leftWrist.y > leftElbow.y && rightWrist.y > rightElbow.y;

    if (
      leftWrist.score > 0.5 &&
      rightWrist.score > 0.5 &&
      wristsClose &&
      handsLow &&
      handsFacingDown &&
      !won
    ) {
      // Score and win logic
      if (!lastFolded.current) {
        setScore(prevScore => {
          const newScore = prevScore + 1;
          if (newScore >= WIN_THRESHOLD) {
            setWon(true);
            setTimeout(() => onWin?.(), 0);
          }
          return newScore;
        });
        lastFolded.current = true;
      }
    } else {
      lastFolded.current = false;
    }

    // Update wing states based on angles
    function updateWingState(side, wrist, shoulder) {
      if (!wrist || !shoulder || wrist.score < 0.5) {
        wingState.current[side] = 'idle';
        return;
      }

      const angle = getAngle(shoulder, wrist);
      if (side === 'left') {
        if (angle < -30) wingState.current.left = 'raised';
        else if (angle < 0) wingState.current.left = 'raising';
        else wingState.current.left = 'lowering';
      } else {
        if (angle > 30) wingState.current.right = 'raised';
        else if (angle > 0) wingState.current.right = 'raising';
        else wingState.current.right = 'lowering';
      }
    }

    updateWingState('left', leftWrist, leftShoulder);
    updateWingState('right', rightWrist, rightShoulder);

    // Wing offsets for visual polish
    const getWingOffset = (side) => {
      switch (wingState.current[side]) {
        case 'raising':
        case 'raised': return 0;
        case 'lowering': return -10;
        default: return 0;
      }
    };

    const LEFT_WING_SHIFT = -20;
    const RIGHT_WING_SHIFT = 90;
    const WING_VERTICAL_SHIFT = 5;

    // Position wings
    if (leftWingEl && leftShoulder) {
      const leftWingX = mirrorX(leftShoulder.x);
      leftWingEl.style.left = `${leftWingX - LEFT_WING_SHIFT}px`;
      leftWingEl.style.top = `${leftShoulder.y + verticalOffset + 120 + WING_VERTICAL_SHIFT + getWingOffset('left')}px`;
    }

    if (rightWingEl && rightShoulder) {
      const rightWingX = mirrorX(rightShoulder.x);
      rightWingEl.style.left = `${rightWingX - RIGHT_WING_SHIFT}px`;
      rightWingEl.style.top = `${rightShoulder.y + verticalOffset + 120 + WING_VERTICAL_SHIFT + getWingOffset('right')}px`;
    }

    // Folding animation for both wings
    const maxRotationLeft = -130;
    const maxRotationRight = 10;
    const restingRotation = 10; // natural resting angle (lightly to the right)


// Folding detection
const wristsAreClose = leftWrist && rightWrist &&
  leftWrist.score > 0.5 && rightWrist.score > 0.5 &&
  Math.abs(leftWrist.x - rightWrist.x) < FOLD_THRESHOLD;

if (wristsAreClose) {
  isFoldedRef.current = true;
} else if (
  leftWrist?.score > 0.5 &&
  rightWrist?.score > 0.5 &&
  Math.abs(leftWrist.x - rightWrist.x) > FOLD_THRESHOLD * 1.5
) {
  isFoldedRef.current = false;
}

// ROTATION
if (isFoldedRef.current) {
  const wristDistance = Math.abs(leftWrist.x - rightWrist.x);
  const t = clamp((FOLD_THRESHOLD - wristDistance) / FOLD_THRESHOLD, 0, 1);
  const rotation = maxRotationRight + t * (maxRotationLeft - maxRotationRight);

  const smoothedRotation = -smoothAngle('shared', -rotation);

  if (leftWingEl) leftWingEl.style.transform = `translate(-50%, -30%) rotate(${smoothedRotation}deg)`;
  if (rightWingEl) rightWingEl.style.transform = `translate(-50%, -30%) rotate(${smoothedRotation}deg)`;

} else if (
  leftShoulder && rightShoulder &&
  leftWrist?.score > 0.5 && rightWrist?.score > 0.5
) {
  // Arms are detected and not folded
  const rawAngleLeft = getAngle(leftShoulder, leftWrist);
  const rawAngleRight = getAngle(rightShoulder, rightWrist);
  const averageAngle = (rawAngleLeft + rawAngleRight) / 2;

  const clamped = clamp(averageAngle, -60, 120);
  const smoothed = -smoothAngle('shared', clamped);

  if (leftWingEl) leftWingEl.style.transform = `translate(-50%, -30%) rotate(${smoothed}deg)`;
  if (rightWingEl) rightWingEl.style.transform = `translate(-50%, -30%) rotate(${smoothed}deg)`;

} else {
  // Arms not detected or hanging down — return wings to resting position smoothly
  const smoothedResting = -smoothAngle('shared', restingRotation);

  if (leftWingEl) leftWingEl.style.transform = `translate(-50%, -30%) rotate(${smoothedResting}deg)`;
  if (rightWingEl) rightWingEl.style.transform = `translate(-50%, -30%) rotate(${smoothedResting}deg)`;
}

    // Center body between shoulders
    if (bodyImg && leftShoulder && rightShoulder) {
      const leftWingX = mirrorX(leftShoulder.x);
      const rightWingX = mirrorX(rightShoulder.x);
      const centerX = (leftWingX + rightWingX) / 2;
      const topY = centerY;

      if (bodyImg.complete) {
        bodyImg.style.left = `${centerX - bodyImg.offsetWidth / 2}px`;
        bodyImg.style.top = `${topY}px`;
      }
    }
  }, [poseData, won]);

  // Render
  return (
    <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 640, height: 480 }}>
      {/* Instruction Window */}
      <Instruction 
        icon1={iconSpread} 
        icon2={iconFold} 
        interval={1000} 
        score={score} 
        countdownStart={WIN_THRESHOLD}
      />

      {/* Hidden video feed and canvas */}
      <video ref={videoRef} width="640" height="480" style={{ display: 'none' }} />
      <canvas ref={canvasRef} width={640} height={480} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />

      {/* Bird with wings and body */}
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
          width: '20%',
          transformOrigin: '80% 20%',
          zIndex: 0,
          transition: 'transform 0.2s ease-out',
        }} />
        <img id="rightWing" src={rightWing} alt="Right wing" style={{
          position: 'absolute',
          transformOrigin: '20% 20%',
          width: '20%',
          zIndex: 2,
          transition: 'transform 0.2s ease-out',
        }} />
      </div>

      {/* Win overlay */}
      {won && (
        <WinOverlay
          videoScr={winVideo}
          onReset={() => {
            foldedCount.current = WIN_THRESHOLD;
            setScore(WIN_THRESHOLD);
            setWon(false);
            onResetDone?.();
          }}
        />
      )}
    </div>
  );
}
