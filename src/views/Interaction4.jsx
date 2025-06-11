// Interaction view - this is the main interactive experience. 
// When scaling to several birds, this would be the main view that handles the interaction logic and rendering of the birds.

import React, { useState } from 'react';

import Title from '../components/Title.jsx';

import BirdFemale from '../components/BirdFemale.jsx';
import BirdAvatar4 from '../components/BirdAvatar4.jsx';
import birdFemaleImage from '../assets/images/female_birds/female_bird_4.png'

import styles from '../modules/Interaction.module.css';

import Interaction5 from './Interaction5.jsx'; // <-- NEXT view after win

function Interaction4() {
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
   return <Interaction5 />;
 }

  return (
    <div>
      <Title />
      <h3 className={styles.bird_title}>Goldie's bird of paradise</h3>

       {/* Player-controlled bird that detects arm movement and winning condition */}
      <BirdAvatar4 
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

export default Interaction4;
