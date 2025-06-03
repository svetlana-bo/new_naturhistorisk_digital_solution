// usePoseTracker - custom hook to track the motion of the body using MediaPipe Pose
// Instructions: https://medium.com/@codetrade/implementation-of-human-pose-estimation-using-mediapipe-23a57968356b

import { useEffect, useRef, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

// Human body landmarks provided by MediaPipe
const landmarkNames = [ 'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner',
  'right_eye', 'right_eye_outer', 'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist',
  'left_pinky', 'right_pinky', 'left_index', 'right_index', 'left_thumb', 'right_thumb',
  'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
  'left_heel', 'right_heel', 'left_foot_index', 'right_foot_index'
 ];

export const usePoseTracker = () => {
  const videoRef = useRef(null); // Reference to the video element
  const canvasRef = useRef(null); // Reference to the canvas element for drawing the avatar later
  const [poseData, setPoseData] = useState(null); // current pose data

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d'); // Get the 2D context for drawing

  //Initialize MediaPipe Pose
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

  //Set tracking options
    pose.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

  //Callback: capture pose results
    pose.onResults((results) => {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

      if (results.poseLandmarks) {
        // Convert landmarks to screen coordinates + include names and visibility score
        const keypoints = results.poseLandmarks.map((landmark, i) => ({
          x: landmark.x * canvas.width,
          y: landmark.y * canvas.height,
          name: landmarkNames[i],
          score: landmark.visibility || 0
        }));
        setPoseData({ keypoints }); // Store the keypoints in state
      }

      ctx.restore(); // Draw the video frame
    });

    // Start the camera and send video frames to MediaPipe Pose
    const camera = new Camera(video, {
      onFrame: async () => await pose.send({ image: video }),
      width: 640,
      height: 480,
    });

    camera.start(); // It's LIVE
    
  }, []);

  return { videoRef, canvasRef, poseData };
};
