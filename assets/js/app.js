/**
 *
 * @see https://codepen.io/songyima/pen/VKbyYG
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

/**
 * Detect if screen is vertical
 *
 * @returns {boolean}
 */
function screenVertical() {
  return 1 > window.innerWidth / window.innerHeight;
}

function assignWindowSize() {
  if ( screenVertical() ) {
    $('#front-youtube').addClass('vertical');
  } else {
    $('#front-youtube').removeClass('vertical');
  }
}

window.onYouTubeIframeAPIReady = () => {
  youtubePlayer = new YT.Player('front-youtube', {
    videoId: [ 'xsSg2t7ldEU', 'S2tlc3265TI', '4IquOq0mKVE' ][ Math.floor(Math.random() * 3 ) ],
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
          $( '.front-header' ).addClass( 'done' );
        }

        if (event.data == YT.PlayerState.ENDED) { // loop video
          event.target.playVideo();
        }
      },
    }
  });
};

$(document).ready(function(){
  //  smooth scroll.
  let headerHeight = 0;
  $('a[href^="#"]').click( function( e ) {
    e.preventDefault();
    const speed = 400;
    const href= $(this).attr("href");
    const target = jQuery( '#' === href ? 'html' : href );
    const position = target.offset().top - headerHeight;
    $( 'body,html' ).animate({scrollTop:position}, speed, 'swing');
  });
  // Detect height.
  assignWindowSize();
  let timer;
  $( window ).resize( () => {
    if ( timer ) {
      clearTimeout( timer );
    }
    timer = setTimeout( assignWindowSize, 100 );
  } );
});
