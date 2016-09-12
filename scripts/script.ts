import { Promise } from "./promise";
import { bind, wait, raf, makeArray } from "./utils";
import { isVisible, isActive, setClassOnNodes, removeClassFromNodes, addClassToNodes } from "./elements";
import { enterItems, animatePageLanding, followNav, slideToItem } from "./animation";


function setTouchClass() {
  const noTouch = !( "ontouchstart" in window );
  const noTouchNodes = document.querySelectorAll( ".no-touch" );

  setClassOnNodes( "no-touch", noTouch, noTouchNodes, 0 );
}


function init() {
  animatePageLanding();
  setTouchClass();

  const revealItems = makeArray( document.querySelectorAll( ".reveal" ) );
  const navItems = makeArray( document.querySelectorAll( ".link" ) )
    .map( node => {
      const selector = node.getAttribute( "href" );
      const section = document.querySelector( selector );

      return {
        link: node,
        href: selector,
        section: section
      };
    });

  navItems.forEach( item => {
    item.link.addEventListener( "click", e => {
      e.preventDefault();
      var hash = item.href;
      slideToItem( item.section ).then( () => {
        window.location.hash = "";
        window.location.href = item.href;
      });
    });
  });

  /*
    Performance enhancing helpers
  */
  let animationIsTicking = false;
  let coords = {};

  const boundEnterItems = bind( enterItems, revealItems );
  const boundFollowNav = bind( followNav, navItems );

  function update() {
    boundEnterItems();
    boundFollowNav();
    // parallax( coords );

    animationIsTicking = false;
  }

  function requestTick() {
    if ( !animationIsTicking ) {
      requestAnimationFrame( update );
      animationIsTicking = true;
    }
  }

  requestTick();
  window.addEventListener( "load", requestTick );
  window.addEventListener( "scroll", requestTick );
  window.addEventListener( "resize", requestTick );
  const desktop = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i);


  // if ( "DeviceOrientationEvent" in window && !desktop ) {
    // window.addEventListener( "deviceorientation", e => {
    //   const beta = (
    //     Math.min(
    //       Math.max(
    //         e.beta,
    //         -45
    //       ), 45
    //     ) + 45
    //   ) / 90;
    //   const gamma = (
    //     Math.min(
    //       Math.max(
    //         e.gamma,
    //         -45
    //       ), 45
    //     ) + 45
    //   ) / 90;
    //
    //   console.log( e.beta, beta );
    //
    //   if ( window.innerWidth < window.innerHeight ) {
    //     coords = {
    //       x: gamma * window.innerWidth,
    //       y: beta * window.innerHeight
    //     };
    //   } else {
    //     coords = {
    //       x: beta * window.innerWidth,
    //       y: gamma * window.innerHeight
    //     };
    //   }
    //   requestTick();
    // });

  if ( !desktop ) {
    coords = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
    window.addEventListener( "resize", () => {
      coords = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      };
      requestTick();
    });
  } else {
    window.addEventListener( "mousemove", e => {
      const x = e.screenX - window.screenX;
      const y = e.screenY - window.screenY;
      coords = { x, y };
      // console.log( coords );
      requestTick();
    });
  }

  window.addEventListener( "resize", requestTick );
}

if ( document.readyState !== "loading" ) {
  init();
} else {
  window.addEventListener( "DOMContentLoaded", init );
}
