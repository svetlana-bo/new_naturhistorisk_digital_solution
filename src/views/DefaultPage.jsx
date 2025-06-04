//Home page component. 
//Uses the pose tracker and waving detector hooks

import { useEffect, useState } from 'react';
import { preloadAssets } from '../utils/preloadAssets';
import { allInteractionAssets } from '../assets/interactionAssets';
import styles from '../modules/DefaultPage.module.css';
import wave from '../assets/icons/wave.svg';
import Interaction from './Interaction';
import LoadingScreen from '../components/LoadingScreen'; 
import dkIcon from '../assets/icons/dk.svg';
import enIcon from '../assets/icons/en.svg';
import bird1 from '../assets/gifs/bird1.gif'
import bird2 from '../assets/gifs/bird2.gif';

import { usePoseTracker } from '../hooks/usePoseTracker';
import { useWavingDetector } from '../hooks/useWavingDetector';

export default function DefaultPage() {
  // Set up pose tracking and waving detection
  const { videoRef, canvasRef, poseData } = usePoseTracker();
  const isWaving = useWavingDetector(poseData);

  const [hasEntered, setHasEntered] = useState(false);
  const [loading, setLoading] = useState(false);

  //When user waves, start preloading assets and show loading screen
  useEffect(() => {
    if (isWaving && !hasEntered && !loading) {
      setLoading(true);

    // Start preloading assets and set a minimum delay
    const assetPreload = preloadAssets(allInteractionAssets);
    const delay = new Promise((resolve) => setTimeout(resolve, 1500)); // minimum 1.5 sec delay

    Promise.all([assetPreload, delay])
      .then(() => {
        setLoading(false);
        setHasEntered(true);
      })
      .catch((error) => {
        console.error('Error preloading assets:', error);
        setLoading(false);
        setHasEntered(true); // still allow entry even if preload fails
      });
  }
  }, [isWaving, hasEntered, loading]);

  //Show loading screen while assets are being preloaded
  if (loading) return <LoadingScreen />;

  // Launch interactive bird experience after loading
  if (hasEntered) return <Interaction />;

  // Render the default page with instructions and intro content
  return (
    <div className={styles.main_container}>
      {/* Hidden video and canvas for pose tracking */}
      <video ref={videoRef} width="640" height="480" style={{ display: 'none' }} />
      <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />

      <h1>Rituals of Nature:</h1>
      <h2>Consent in Paradise</h2>

      <div className={styles.content_container}>
         {/* Instruction box: wave to begin */}
        <div className={styles.text_box_wave}>
          <h3>
            Wave to start
            <img src={wave} alt="Icon waving hand" className={styles.waving_icon} />
          </h3>
          <p>
            Even in paradise, there are rules of engagement.
            <br />
            <br />
            <b>Can you impress a mate while staying respectful of their boundaries?</b>
          </p>
          <img src={bird1} alt="Image of bird" className={styles.intro_bird} />
        </div>

        {/* Intro text box in EN & DK  */}
        <div className={styles.text_box}>
          <div className={styles.text_box_lang}>
            <img src={dkIcon} alt="Icon danish language" className={styles.icon} />
            <p>
              <b>Rituals</b> er et nyt projekt, der har til formål at tilføje friske perspektiver
              og aktuelle emner til udstillingerne og samlingerne på Naturhistorisk Museum Aarhus.
              <br />
              I denne sæson har vi givet <b>paradisfuglene</b> i udstillingen <b>Global Backyard</b>{' '}
              nyt liv for at undersøge deres <b>parringsritualer</b> – og de mange forskellige måder,
              hvorpå hver art forholder sig til <b>samtykke</b>.
            </p>
          </div>
          <hr />
          <div className={styles.text_box_lang}>
            <img src={enIcon} alt="Icon english language" className={styles.icon} />
            <p>
              <b>Rituals</b> is a new project aiming to add fresh perspectives and hot topics to
              exhibits and collections in Naturhistorisk Museum Aarhus.
              <br /> This season we have brought the <b>birds of paradise</b> on display in the{' '}
              <b>Global Backyard</b> exhibition to life to explore their <b>courtship</b> customs and
              the many different ways each species deals with <b>consent</b>.
            </p>
          </div>
        </div>

        {/* Instruction box: wave to begin in Danish */}
        <div className={styles.text_box_wave}>
          <h3>
            <img src={wave} alt="Icon waving hand" className={styles.waving_icon} />
            Wave to start
          </h3>
          <p>
            Selv i paradis findes der regler for romantik.
            <br />
            <br />
            <b>Kan du vinde en partners hjerte uden at overskride deres grænser?</b>
          </p>
          <img src={bird2} alt="Image of bird" className={styles.intro_bird}/>
        </div>
      </div>
    </div>
  );
}
