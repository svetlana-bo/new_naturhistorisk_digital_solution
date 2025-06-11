// Interaction view - this is the main interactive experience.
// When scaling to several birds, this would be the main view that handles
// the interaction logic and rendering of the birds.

import React, { useState } from 'react';

import Title from '../components/Title.jsx';
import BirdAvatar1 from '../components/BirdAvatar1.jsx';
import BirdFemale from '../components/BirdFemale.jsx';
import Interaction2 from './Interaction2.jsx'; // <-- NEXT view after win

import birdFemaleImage from '../assets/images/female_birds/female_bird_1.png';

import styles from '../modules/Interaction.module.css';

function Interaction1() {
  // Tracks if the player has "won" (i.e. attracted the female bird)
  const [won, setWon] = useState(false);

  // Increments to trigger a reset animation in the female bird
  const [resetTrigger, setResetTrigger] = useState(0);

  // NEW: Tracks whether we should move to the next interaction view
  const [showNextView, setShowNextView] = useState(false);

  // Called when the win overlay video finishes playing
  const handleResetDone = () => {
    setWon(false);                      // Reset the win state
    setResetTrigger((n) => n + 1);      // Trigger the female bird's idle animation
    setShowNextView(true);              // Switch to next view
  };

  // --- Render logic ---
  if (showNextView) {
    // If the win video has ended, show the next view
    return <Interaction2 />;
  }

  return (
    <div>
      <Title />
      <h3 className={styles.bird_title}>King bird of paradise</h3>

      {/* Player-controlled bird that detects arm movement and winning condition */}
      <BirdAvatar1 
        onWin={() => setWon(true)}         // Called when player wins
        onResetDone={handleResetDone}      // Called after win video ends
      />

      {/* Female bird that reacts to winning and resets when needed */}
      <BirdFemale 
        image={birdFemaleImage}
        isAttracted={won} 
        resetTrigger={resetTrigger} 
      />
    </div>
  );
}

export default Interaction1;

