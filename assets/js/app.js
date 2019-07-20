/**
 *
 */

/* global YT:false */

const $ = jQuery;

// Loads the Youtube IFrame Player API code asynchronously.
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//  This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
let youtubePlayer;
const _youtube_id = document.getElementById('front-youtube');

window.onYouTubeIframeAPIReady = () => {
  youtubePlayer = new YT.Player('front-youtube', {
    videoId: _youtube_id.dataset.youtubeurl,
    playerVars: { // https://developers.google.com/youtube/player_parameters?playerVersion=HTML5
      cc_load_policy: 0, // closed caption
      controls: 0,
      disablekb: 0, //disable keyboard
      iv_load_policy: 3, // annotations
      playsinline: 1, // play inline on iOS
      rel: 0, // related videos
      showinfo: 0, // title
      modestbranding: 3 // youtube logo
    },
    events: {
      'onReady': ( event ) => {
        event.target.mute();
        event.target.playVideo();
      },
      'onStateChange': (event ) => {
        if (event.data == YT.PlayerState.PLAYING) {
          $( '.front-header-buffer' ).addClass( 'done' );
        }

        if (event.data == YT.PlayerState.ENDED) { // loop video
          event.target.playVideo();
        }
      },
    }
  });
};
