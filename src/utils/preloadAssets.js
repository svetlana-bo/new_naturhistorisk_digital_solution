
// preloadAssets: function preloads images and videos by creating new Image or Video elements

//"Promise" helps the code wait for something that takes time (like loading images, videos, or fetching data)
// — and do something when it’s ready.

export function preloadAssets(urls = []) {
    const promises = urls.map((src) => {
      return new Promise((resolve, reject) => {
        const isVideo = src.match(/\.(mp4|webm|ogg)$/i);
        if (isVideo) {
          const video = document.createElement('video');
          video.src = src;
          video.preload = 'auto';
          video.onloadeddata = resolve;
          video.onerror = reject;
        } else {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        }
      });
    });
  
    return Promise.all(promises);
  }
  