// Interaction view - this is the main interactive experience. 


import React, { useState } from 'react';

import Title from '../components/Title.jsx';
import BirdAvatar from '../components/BirdAvatar.jsx';
import BirdFemale from '../components/BirdFemale.jsx';

import birdFemaleImage from '../assets/images/female_birds/female_bird3.png'

import styles from '../modules/Interaction.module.css';

function Interaction3() {
  // Tracks if the player has "won" (i.e. attracted the female bird)
  const [won, setWon] = useState(false);

   // Increments to trigger a reset animation in the female bird
  const [resetTrigger, setResetTrigger] = useState(0);

   // Called when the win overlay video finishes playing
  const handleResetDone = () => {
    setWon(false);                      //  reset female attraction (to be able to start over)
    setResetTrigger((n) => n + 1);      //  trigger female bird idle animation
  };

  return (
    <div>
      <Title />
      <h3 className={styles.bird_title}>Wilson’s bird-of-paradise</h3>

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

export default Interaction3;
