// LoadingScreen - component to transition between elements in the app.
import React from 'react';
import loadingBird from '../assets/gifs/loading_bird.gif';
import styles from '../modules/LoadingScreen.module.css';

const LoadingScreen = () => (
  <div className={styles.loader}>
     <img src={loadingBird} alt="Loading..." className={styles.gif} />
    Loading...
  </div>
);

export default LoadingScreen;