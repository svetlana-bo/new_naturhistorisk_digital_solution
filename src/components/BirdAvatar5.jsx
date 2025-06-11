import styles from '../modules/BirdAvatar.module.css';
import React, { useEffect, useRef, useState } from 'react';
import { usePoseTracker } from '../hooks/usePoseTracker';

import WinOverlay from './WinOverlay';
import winVideo from '../assets/videos/Bird5.mp4';

import iconLeft from '../assets/icons/Instruction5-straight.svg';
import iconRight from '../assets/icons/Instruction5-tilt.svg';
import Instruction from './Instruction';

import wing5 from '../assets/bird/bird-5-wing.png';
import body from '../assets/bird/bird-5-body.png';
import tailfeathers from '../assets/bird/bird-5-tail.png';

export default function BirdAvatar5({ onWin, onResetDone }) {
  const { videoRef, canvasRef, poseData } = usePoseTracker();

  const WIN_THRESHOLD = 4;
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const foldedCount = useRef(WIN_THRESHOLD);

  const lastGesture = useRef('neutral');
  const leftAngle = useRef(0);
  const rightAngle = useRef(0);
  const tailAngle = useRef(0); // ✅ NEW: tail rotation state

  const [wingImages, setWingImages] = useState({
    left: wing5,
    right: wing5,
  });

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const smooth = (prev, next, factor = 0.8) => factor * prev + (1 - factor) * next;

  useEffect(() => {
    if (!poseData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const key = (name) => poseData.keypoints.find((k) => k.name === name);
    const leftEye = key('left_eye');
    const rightEye = key('right_eye');
    const leftShoulder = key('left_shoulder');
    const rightShoulder = key('right_shoulder');

    if (!leftEye || !rightEye || !leftShoulder || !rightShoulder) return;

    const verticalDifference = rightEye.y - leftEye.y;
    const HEAD_TILT_THRESHOLD = 5;
    const gesture = verticalDifference > HEAD_TILT_THRESHOLD ? 'bend_right' : 'neutral';

    if (gesture === 'bend_right' && lastGesture.current !== 'bend_right') {
      setScore((prev) => {
        const newScore = prev + 1;
        foldedCount.current = Math.max(WIN_THRESHOLD - newScore, 0);
        if (newScore >= WIN_THRESHOLD && !won) {
          setWon(true);
          setTimeout(() => onWin?.(), 0);
        }
        return newScore;
      });
    }

    lastGesture.current = gesture;

    const leftWingEl = document.getElementById('leftWing');
    const rightWingEl = document.getElementById('rightWing');
    const bodyImg = document.getElementById('birdBody');
    const tailEl = document.getElementById('tailFeathers');

    let targetLeftAngle = 0;
    let targetRightAngle = 0;
    let targetTailAngle = 0;

    if (gesture === 'bend_right') {
      targetLeftAngle = 15;
      targetRightAngle = 15;
      targetTailAngle = 15;
      setWingImages({ left: wing5, right: wing5 });
    } else {
      targetTailAngle = 0;
      setWingImages({ left: wing5, right: wing5 });
    }

    leftAngle.current = smooth(leftAngle.current, targetLeftAngle, 0.1);
    rightAngle.current = smooth(rightAngle.current, targetRightAngle, 0.1);
    tailAngle.current = smooth(tailAngle.current, targetTailAngle, 0.1); // ✅ NEW

    if (leftWingEl) leftWingEl.style.transform = `rotate(${leftAngle.current}deg)`;
    if (rightWingEl) rightWingEl.style.transform = `rotate(${rightAngle.current}deg)`;

    const mirrorX = (x) => canvasWidth - x;

    if (bodyImg && leftShoulder && rightShoulder) {
      const leftX = mirrorX(leftShoulder.x);
      const rightX = mirrorX(rightShoulder.x);
      const centerX = (leftX + rightX) / 2;
      const centerY = canvasHeight / 2;

      bodyImg.style.left = `${centerX - bodyImg.offsetWidth / 2}px`;
      bodyImg.style.top = `${centerY}px`;

      const bodyTop = centerY;
      const bodyLeft = centerX - bodyImg.offsetWidth / 2;

      if (leftWingEl) {
        leftWingEl.style.top = `${bodyTop + 40}px`;
        leftWingEl.style.left = `${bodyLeft + bodyImg.offsetWidth * 0.1 - 20}px`;
      }
      if (rightWingEl) {
        rightWingEl.style.top = `${bodyTop + 40}px`;
        rightWingEl.style.left = `${bodyLeft + bodyImg.offsetWidth * 0.55 - 120}px`;
      }

      if (tailEl) {
        tailEl.style.top = `${bodyTop + 140}px`;
        tailEl.style.left = `${bodyLeft + bodyImg.offsetWidth * 0.1 - 100}px`;
        tailEl.style.transform = `rotate(${tailAngle.current}deg)`; // ✅ NEW
      }
    }
  }, [poseData, won, onWin]);

  return (
    <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 640, height: 480 }}>
      <Instruction
        icon1={iconLeft}
        icon2={iconRight}
        interval={1000}
        score={score}
        countdownStart={WIN_THRESHOLD}
      />
      <video ref={videoRef} width="640" height="480" style={{ display: 'none' }} />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      />

      <div id="birdContainer" className={styles.bird_container}>
        <img
          id="birdBody"
          src={body}
          alt="Bird body"
          style={{
            position: 'absolute',
            width: '35%',
            transformOrigin: 'center',
            zIndex: 1,
            transition: 'top 0.1s ease-out, left 0.1s ease-out',
          }}
        />
        <img
          id="tailFeathers"
          src={tailfeathers}
          alt="Tail feathers"
          style={{
            position: 'absolute',
            width: '18%',
            transformOrigin: 'center',
            zIndex: 0,
            transition: 'top 0.1s ease-out, left 0.1s ease-out, transform 0.2s ease-out',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <img
          id="leftWing"
          src={wingImages.left}
          alt="Left wing"
          style={{
            position: 'absolute',
            width: '25%',
            transformOrigin: 'top right',
            zIndex: -1,
            transition: 'top 0.1s ease-out, left 0.1s ease-out, transform 0.2s ease-out',
          }}
        />
        <img
          id="rightWing"
          src={wingImages.right}
          alt="Right wing"
          style={{
            position: 'absolute',
            width: '25%',
            transformOrigin: 'top left',
            zIndex: 2,
            transition: 'top 0.1s ease-out, left 0.1s ease-out, transform 0.2s ease-out',
          }}
        />
      </div>

      {won && (
        <WinOverlay
          videoScr={winVideo}
          onReset={() => {
            foldedCount.current = WIN_THRESHOLD;
            setScore(0);
            setWon(false);
            onResetDone?.();
          }}
        />
      )}
    </div>
  );
}
