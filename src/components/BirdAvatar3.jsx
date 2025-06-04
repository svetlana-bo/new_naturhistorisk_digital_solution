import styles from '../modules/BirdAvatar.module.css';
import React, { useEffect, useRef, useState } from 'react';
import { usePoseTracker } from '../hooks/usePoseTracker';

import WinOverlay from './WinOverlay';
import winVideo from '../assets/videos/Bird3.mp4'; 

import iconOut from '../assets/icons/Instruction3-out.svg';
import iconIn from '../assets/icons/Instruction3-in.svg';
import Instruction from './Instruction';

import body from '../assets/bird/bird3-body.png';
import collar from '../assets/bird/bird3-collar.png';

export default function BirdAvatar({ onWin, onResetDone }) {
  const { videoRef, canvasRef, poseData } = usePoseTracker();

  const lastHandsAtChest = useRef(false);
  const WIN_THRESHOLD = 3;
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ handsAtChest: false, leftWrist: {}, rightWrist: {}, leftShoulder: {}, rightShoulder: {} });
  const [collarVisible, setCollarVisible] = useState(false);

  useEffect(() => {
    if (!poseData || !canvasRef.current) return;

    const key = (name) => poseData.keypoints.find((k) => k.name === name || k.part === name);
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

    const bodyImg = document.getElementById('birdBody');
    const collarEl = document.getElementById('birdCollar');

    // Check if both wrists are close to the chest (center between shoulders)
    const areHandsAtChest = () => {
      if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder) return false;

      const chestY = (leftShoulder.y + rightShoulder.y) / 2;
      const chestX = (leftShoulder.x + rightShoulder.x) / 2;
      const chestZone = 100; // px radius around chest center

      const isLeftNearChest = Math.abs(leftWrist.x - chestX) < chestZone && Math.abs(leftWrist.y - chestY) < chestZone;
      const isRightNearChest = Math.abs(rightWrist.x - chestX) < chestZone && Math.abs(rightWrist.y - chestY) < chestZone;

      return isLeftNearChest && isRightNearChest;
    };

    const handsAtChest = areHandsAtChest();

    // Temporarily show collar for 800ms if gesture is detected
    if (handsAtChest && !collarVisible) {
      setCollarVisible(true);
      setTimeout(() => setCollarVisible(false), 800);
    }

    // Increase score only when handsAtChest transitions from false to true
    if (handsAtChest && !lastHandsAtChest.current && !won) {
      console.log('Hands at chest detected');
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore >= WIN_THRESHOLD) {
          setWon(true);
          setTimeout(() => onWin?.(), 0);
        }
        return newScore;
      });
    }
    lastHandsAtChest.current = handsAtChest;

    // Position the bird body between shoulders
    if (bodyImg && leftShoulder && rightShoulder) {
      const leftX = mirrorX(leftShoulder.x);
      const rightX = mirrorX(rightShoulder.x);
      const centerX = (leftX + rightX) / 2;
      const topY = centerY;
      if (bodyImg.complete) {
        bodyImg.style.left = `${centerX - bodyImg.offsetWidth / 2}px`;
        bodyImg.style.top = `${topY}px`;
      }
    }

    // Position the collar on neck
    if (collarEl && leftShoulder && rightShoulder) {
      const leftX = mirrorX(leftShoulder.x);
      const rightX = mirrorX(rightShoulder.x);
      const centerX = (leftX + rightX) / 2 + 65;
      const topY = centerY + 60;
      if (collarEl.complete) {
        collarEl.style.left = `${centerX - collarEl.offsetWidth / 2}px`;
        collarEl.style.top = `${topY}px`;
      }
    }
  }, [poseData, won, collarVisible]);

  return (
    <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 640, height: 480 }}>
      {/* Instruction prompts */}
      <Instruction 
        icon1={iconOut} 
        icon2={iconIn} 
        interval={1000} 
        score={score} 
        countdownStart={WIN_THRESHOLD} />

      {/* Hidden video & canvas used for pose tracking */}
      <video ref={videoRef} width="640" height="480" style={{ display: 'none' }} />
      <canvas ref={canvasRef} width={640} height={480} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />

      {/* Render bird */}
      <div id="birdContainer" className={styles.bird_container}>
        <img id="birdBody" src={body} alt="Bird body" style={{
          position: 'absolute',
          width: '35%',
          transformOrigin: 'center',
          zIndex: 1,
          transition: 'top 0.1s ease-out, left 0.1s ease-out, transform 0.1s ease-out',
        }} />
         
        <img id="birdCollar" src={collar} alt="Bird collar" style={{
          position: 'absolute',
          width: '10%',
          transformOrigin: 'center',
          zIndex: 2,
          opacity: collarVisible ? 1 : 0,
          transition: 'opacity 0.3s ease, top 0.1s ease-out, left 0.1s ease-out'
        }} />
      </div>

      {/* Win screen overlay */}
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
