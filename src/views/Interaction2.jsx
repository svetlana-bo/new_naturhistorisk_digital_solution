import React, { useState } from 'react';

import Title from '../components/Title.jsx';
import BirdAvatar from '../components/BirdAvatar2.jsx';
import BirdFemale from '../components/BirdFemale.jsx';

import birdFemaleImage from '../assets/images/female_birds/female_bird2.svg'

import styles from '../modules/Interaction.module.css';

import Interaction3 from './Interaction3.jsx';

function Interaction2() {
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
      return <Interaction3 />;
    }
  return (
    <div>
      <Title />
      <h3 className={styles.bird_title}>Western Parotia</h3>

       {/* Player-controlled bird that detects arm movement and winning condition */}
      <BirdAvatar 
        onWin={() => setWon(true)} 
        onResetDone={handleResetDone} 
      />

      {/* Female bird that reacts when the player wins, then resets on trigger */}
      <BirdFemale 
        image={birdFemaleImage}
        isAttracted={won} 
        resetTrigger={resetTrigger} />
    </div>
  );
}

export default Interaction2;