//interactionAssets -- to further preload assets for the interaction page

// Bird parts
import birdBody from './bird/bird-body.png';
import wingLeft from './bird/bird-left-wing.png'; 
import wingRight from './bird/bird-right-wing.png';

// Female bird
import femaleBird from './bird/female_bird.png';

// Video
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
