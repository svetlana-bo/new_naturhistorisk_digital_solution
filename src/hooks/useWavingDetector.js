//useWavingDetector - A custom hook to detect waving gestures based on pose data.
// we get the pose data from the Parent.

import { useEffect, useState, useRef } from 'react';

//Detect waving gestures based on pose data.
export const useWavingDetector = (poseData, {
  threshold = 40, // Minimum pixel change to consider a swing
  swingCount = 2, // Number of swings required to consider it a wave
  cooldown = 2000 // Cooldown period after a wave is detected (in milliseconds)
} = {}) => {
  const [isWaving, setIsWaving] = useState(false); // State to track if waving is detected

  // State to track the last known positions and swing counts for each hand
  const handState = useRef({
    left: { lastX: null, direction: null, swings: 0 },
    right: { lastX: null, direction: null, swings: 0 }
  });

  // Cooldown reference to prevent multiple detections in a short time
  const cooldownRef = useRef(false);

  // Function to check if a swing has occurred based on the current X position
  const checkSwing = (side, currentX) => {
    const state = handState.current[side];
    if (state.lastX === null) {
      state.lastX = currentX;
      return;
    }

    const delta = currentX - state.lastX;
    if (Math.abs(delta) > threshold) {
      const newDir = delta > 0 ? 'right' : 'left';
      // If the direction has changed, increment the swing count
      if (state.direction && state.direction !== newDir) {
        state.swings += 1;
      }
      state.direction = newDir;
      state.lastX = currentX;
    }
  };

  useEffect(() => {
    if (!poseData || cooldownRef.current) return;

    // Get the left and right wrist keypoints from the pose data
    const leftWrist = poseData.keypoints.find(p => p.name === 'left_wrist');
    const rightWrist = poseData.keypoints.find(p => p.name === 'right_wrist');

    if (leftWrist?.score > 0.3) {
      checkSwing('left', leftWrist.x);
    }

    if (rightWrist?.score > 0.3) {
      checkSwing('right', rightWrist.x);
    }

    // Check if both hands have swung enough times to be considered waving
    const bothWaving = ['left', 'right'].every(
      (side) => handState.current[side].swings >= swingCount
    );

    if (bothWaving) {
      setIsWaving(true);
      cooldownRef.current = true;
      // Reset hand states after detecting a wave
      setTimeout(() => {
        setIsWaving(false);
        handState.current = {
          left: { lastX: null, direction: null, swings: 0 },
          right: { lastX: null, direction: null, swings: 0 }
        };
        cooldownRef.current = false;
      }, cooldown);
    }
  }, [poseData]);

  return isWaving;
};
