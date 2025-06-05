import styles from '../modules/BirdAvatar.module.css';
import React, { useEffect, useRef, useState } from 'react';
import { usePoseTracker } from '../hooks/usePoseTracker';

import WinOverlay from './WinOverlay';
import winVideo from '../assets/videos/Bird1.mp4';

import iconLeft from '../assets/icons/Instruction1-left.svg';
import iconRight from '../assets/icons/Instruction1-right.svg';
import Instruction from './Instruction';

import outsideWing from '../assets/bird/bird-1-wing-outside.png';
import birdWing1 from '../assets/bird/bird-1-wing-1.png';
import birdWing2 from '../assets/bird/bird-1-wing-2.png';
import body from '../assets/bird/bird-1-body.png';
import tailfeathers from '../assets/bird/bird-1-tailfeathers.png';

export default function BirdAvatar1({ onWin, onResetDone }) {
  // --- Pose tracking setup ---
  const { videoRef, canvasRef, poseData } = usePoseTracker();

  // --- Game state ---
  const WIN_THRESHOLD = 4; // Number of successful gestures to win
  const [score, setScore] = useState(0); // Tracks current gesture score
  const [won, setWon] = useState(false); // Tracks if player has won

  // --- Refs for gesture tracking and wing animation ---
  const lastGesture = useRef('neutral'); // Last detected gesture: 'left', 'right', or 'neutral'
  const leftAngle = useRef(0); // Smoothed rotation angle for left wing
  const rightAngle = useRef(0); // Smoothed rotation angle for right wing

  // --- State for current wing images to display ---
  const [wingImages, setWingImages] = useState({
    left: outsideWing,
    right: outsideWing,
  });

  // --- Helper functions for clamping and smoothing values ---
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const smooth = (prev, next, factor = 0.8) => factor * prev + (1 - factor) * next;

  // --- Effect to process pose data and update bird animation & game state ---
  useEffect(() => {
    if (!poseData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Helper to find keypoints by name
    const key = (name) => poseData.keypoints.find((k) => k.name === name);

    // Get important keypoints from pose data
    const leftWrist = key('left_wrist');
    const rightWrist = key('right_wrist');
    const leftShoulder = key('left_shoulder');
    const rightShoulder = key('right_shoulder');
    const nose = key('nose');

    // If any keypoints are missing, skip processing
    if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder || !nose) return;

    // Mirror X coordinates to match canvas coordinate system
    const mirrorX = (x) => canvasWidth - x;

    // Calculate mirrored wrist and shoulder positions
    const leftWristX = mirrorX(leftWrist.x);
    const rightWristX = mirrorX(rightWrist.x);
    const leftShoulderX = mirrorX(leftShoulder.x);
    const rightShoulderX = mirrorX(rightShoulder.x);

    // Normalize Y coordinates by canvas height
    const leftWristY = leftWrist.y / canvasHeight;
    const rightWristY = rightWrist.y / canvasHeight;
    const noseY = nose.y / canvasHeight;

    // Calculate body center X and shoulder span for gesture detection
    const bodyCenterX = (leftShoulderX + rightShoulderX) / 2;
    const shoulderSpan = Math.abs(rightShoulderX - leftShoulderX);
    const offset = shoulderSpan * 0.3;

    // --- Determine current gesture based on wrist positions ---
    let gesture = 'neutral';
    if (leftWristX < bodyCenterX - offset && rightWristX < bodyCenterX - offset) {
      gesture = 'left';
    } else if (leftWristX > bodyCenterX + offset && rightWristX > bodyCenterX + offset) {
      gesture = 'right';
    }

    // --- Win condition: alternate gestures increase score ---
    if (
      (gesture === 'left' && lastGesture.current === 'right') ||
      (gesture === 'right' && lastGesture.current === 'left')
    ) {
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore >= WIN_THRESHOLD && !won) {
          setWon(true);
          setTimeout(() => onWin?.(), 0); // Trigger win callback asynchronously
        }
        return newScore;
      });
    }

    // Update last gesture if changed and not neutral
    if (gesture !== 'neutral' && gesture !== lastGesture.current) {
      lastGesture.current = gesture;
    }

    // --- Wing animation handling ---

    // Access wing DOM elements for applying rotation transform
    const leftWingEl = document.getElementById('leftWing');
    const rightWingEl = document.getElementById('rightWing');

    // Target rotation angles and wing images based on gesture
    let targetLeftAngle = 0;
    let targetRightAngle = 0;
    let targetWings = { left: outsideWing, right: outsideWing };

    if (gesture === 'left') {
      targetLeftAngle = 5;
      targetRightAngle = 5;
      targetWings = { left: birdWing1, right: birdWing1 };
    } else if (gesture === 'right') {
      targetLeftAngle = 5;
      targetRightAngle = 5;
      targetWings = { left: birdWing2, right: birdWing2 };
    }

    // Smooth wing rotation transitions
    leftAngle.current = smooth(leftAngle.current, targetLeftAngle, 0.1);
    rightAngle.current = smooth(rightAngle.current, targetRightAngle, 0.1);

    // Apply rotation styles to wing elements if found
    if (leftWingEl) {
      leftWingEl.style.transform = `rotate(${leftAngle.current}deg)`;
    }
    if (rightWingEl) {
      rightWingEl.style.transform = `rotate(${rightAngle.current}deg)`;
    }

    // Update wing images state only if gesture is stable and not neutral
    if (gesture !== 'neutral' && gesture === lastGesture.current) {
      setWingImages(targetWings);
    } else if (gesture === 'neutral') {
      setWingImages({ left: outsideWing, right: outsideWing });
    }

    // --- Position the bird body horizontally centered between shoulders ---
    const bodyImg = document.getElementById('birdBody');
    if (bodyImg && leftShoulder && rightShoulder) {
      const leftX = mirrorX(leftShoulder.x);
      const rightX = mirrorX(rightShoulder.x);
      const bodyCenter = (leftX + rightX) / 2;
      bodyImg.style.left = `${bodyCenter - bodyImg.offsetWidth / 2}px`;
      bodyImg.style.top = `240px`; // Fixed vertical position
    }
  }, [poseData, won, onWin]);

  // --- Render ---
  return (
    <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 640, height: 480 }}>
      {/* Instructions overlay with icons and score */}
      <Instruction
        icon1={iconLeft}
        icon2={iconRight}
        interval={1000}
        score={score}
        countdownStart={WIN_THRESHOLD}
      />

      {/* Hidden video element for pose tracking */}
      <video ref={videoRef} width="640" height="480" style={{ display: 'none' }} />

      {/* Canvas where pose skeleton or other visuals can be drawn */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      />

      {/* Bird container with relative positioning */}
      <div id="birdContainer" className={styles.bird_container} style={{ position: 'relative' }}>
        {/* Bird body and tail feathers */}
        <div
          id="birdBodyWrapper"
          style={{
            position: 'absolute',
            top: '240px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '35%',
            height: 'auto',
            zIndex: 1,
          }}
        >
          <img
            id="birdBody"
            src={body}
            alt="Bird body"
            style={{ width: '100%', display: 'block', zIndex: 1 }}
          />
          <img
            id="tailFeathers"
            src={tailfeathers}
            alt="Tail feathers"
            style={{
              position: 'absolute',
              width: '50%',
              left: '0%',
              top: '0%',
              transformOrigin: 'center',
              zIndex: -1,
              transition: 'transform 0.2s ease-out',
              transform: wingImages.left === outsideWing ? 'rotate(-92deg)' : 'rotate(0deg)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </div>

        {/* Left wing image with rotation */}
        <img
          id="leftWing"
          src={wingImages.left}
          alt="Left wing"
          style={{
            position: 'absolute',
            width: wingImages.left === birdWing1 ? '32%' : '25%', // larger when wing1
            left: '36%',
            top: '58%',
            transformOrigin: 'top right',
            zIndex: -1,
            transition: 'transform 0.2s ease-out',
            transform: `rotate(${leftAngle.current}deg)`,
          }}
        />

        {/* Right wing image with rotation */}
        <img
          id="rightWing"
          src={wingImages.right}
          alt="Right wing"
          style={{
            position: 'absolute',
            width: wingImages.right === birdWing1 ? '32%' : '25%',
            left: '36%',
            top: '58%',
            transformOrigin: 'top left',
            zIndex: 2,
            transition: 'transform 0.2s ease-out',
            transform: `rotate(${rightAngle.current}deg)`,
          }}
        />
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
      
