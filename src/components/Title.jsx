// Title - compopnent for the title of the page

import styles from '../modules/Title.module.css';

const Title = () => {
    return (
    <>
        <h1 className={styles.title1}>
        Rituals of Nature: 
        <span className={styles.title2}> 
        Consent in Paradise </span>
        </h1>
    </>
    );
  };
  
  export default Title;
