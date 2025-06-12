//interactionAssets -- to further preload assets for the interaction page

// Bird parts
import birdBody from './bird/bird-body.png';
import wingLeft from './bird/bird-left-wing.png'; 
import wingRight from './bird/bird-right-wing.png';

// Female bird
import femaleBird from './images/female_birds/female_bird.png';

// Video

import winVid1 from './videos/Bird1.mp4';
import winVid2 from './videos/Bird2.mp4';
import winVid3 from './videos/Bird3.mp4';
import winVid4 from './videos/Bird4.mp4';
import winVid5 from './videos/Bird5.mp4';
import winVid from './videos/Bird6.mp4';


// Export grouped assets
export const birdAssets = {
  body: birdBody,
  wingLeft: wingLeft,
  wingRight: wingRight,
};

export const femaleBirdAssets = {
  femaleBird: femaleBird,
};

export const videoAssets = {
  winVid1: winVid1,
  winVid2: winVid2,
  winVid3: winVid3,
  winVid4: winVid4,
  winVid5: winVid5,
  winVid: winVid,
};

// Export flat array for preloading
export const allInteractionAssets = [
  birdBody,
  wingLeft,
  wingRight,
  femaleBird,
  winVid,
];
