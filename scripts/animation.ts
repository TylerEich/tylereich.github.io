import { fastdom } from "./fastdom";

import { bind, wait, raf, makeArray } from "./utils";
import { isVisible, isActive, setClassOnNodes, removeClassFromNodes, addClassToNodes } from "./elements";

const KEYSTROKE_DELAY = 100;


export function enterItems( items ) {
  return fastdom.measure( () => {
    const visible = items.filter( isVisible );
    const invisible = items.filter( function( item ) {
      return !isVisible( item );
    });

    items.splice( 0, Number.MAX_VALUE );
    items.splice.apply( items, [ 0, 0 ].concat( invisible ) );

    return visible.reduce( ( promise, item ) =>
      promise.then(
        () => addClassToNodes( "enter", item, 100 )
      ),
      wait( 0 )
    );
  });
}


export function animatePageLanding() {
  function typeChar( char, element ) {
    element.textContent += char;
  }

  function typeString( textString, element ) {
    const chars = textString.split( "" );

    const promise = chars.reduce( function( promise, char ) {
      const delay = KEYSTROKE_DELAY + Math.random() * KEYSTROKE_DELAY / 3;
      const nextPromise =
        promise.then( () => wait( delay ) )
        .then( () => fastdom.mutate(
          () => typeChar( char, element )
        ));

      return nextPromise;
    }, wait( 0 ) );

    return promise;
  }

  const hello = document.querySelector( "#hello-world" );
  const promise = wait( 500 )
    .then( () => typeString( "Hello world", hello ) )
    .then( () => wait( 750 ) )
    .then( () => {
      const tyler = document.querySelector( "#tyler-eich" );
      fastdom.mutate(
        () => tyler.classList.remove( "hide" )
      );
    })
    .then( () => wait( 750 ) )
    .then( () => {
      const header = document.querySelector( "header" );
      fastdom.mutate(
        () => header.classList.remove( "hide" )
      );
    });

  return promise;
}


function leanToward( node, coords ) {
  const translate = node.style.transform;

  const matches = translate.match( /(-?\d+\.?\d*)px, (-?\d+\.?\d*)px/ );
  let translatedX = 0;
  let translatedY = 0;

  if ( matches ) {
    translatedX = Number( matches[ 1 ] );
    translatedY = Number( matches[ 2 ] );
  }

  const bounds = node.getBoundingClientRect();

  const top = bounds.top - translatedY;
  const bottom = bounds.bottom - translatedY;
  const left = bounds.left - translatedX;
  const right = bounds.right - translatedX;


  let dx = coords.x - (left + right) / 2;
  let dy = coords.y - (top + bottom) / 2;

  if ( dx > 0 ) {
    dx = Math.pow( dx, 0.5 ) / 10;
  } else {
    dx = -Math.pow( -dx, 0.5 ) / 10;
  }

  if ( dy > 0 ) {
    dy = Math.pow( dy, 0.5 ) / 10;
  } else {
    dy = -Math.pow( -dy, 0.5 ) / 10;
  }

  const pos = {
    x: dx * Math.log( bounds.width ),
    y: dy * Math.log( bounds.height )
  };

  fastdom.mutate(
    () => node.style.transform = `translate(${pos.x}px,${pos.y}px)`
  );
}

export function parallax( coords ) {
  const nodes = makeArray( document.querySelectorAll( ".parallax" ) );

  for ( const node of nodes ) {
    fastdom.measure(
      () => {
        if ( isVisible( node ) ) {
          leanToward( node, coords );
        }
      }
    );
  }
}


export function followNav( items ) {
  fastdom.measure( () => {
    const active = items.filter( function( item ) {
      return isActive( item.section );
    });

    const inactive = items.filter( function( item ) {
      return active.indexOf( item ) === -1;
    });

    removeClassFromNodes( "active", inactive.map( item => item.link ) );
    addClassToNodes( "active", active.map( item => item.link ) );
  });
}


// function slide( start, end, duration, elapsed ) {
//   const progress = elapsed / duration - 1;
//   // position--;
//   const scrollPos = (end - start) * (progress ** 5 + 1) + start;
//
//   window.scrollTo( 0, scrollPos );
// }

function slide( start, end, duration, elapsed ) {
  const progress = elapsed / duration;
  let multiplier = 0;
  if ( progress < 0.5 ) {
    multiplier = 16 * ( progress ** 5 );
  } else {
    multiplier = 1 + 16 * ( (progress - 1) ** 5 );
  }

  const scrollPos = multiplier * ( end - start ) + start;

  window.scrollTo( 0, scrollPos );
}

export function slideToItem( item ) {
  const start = window.scrollY;
  const docHeight = document.body.scrollHeight;
  const winHeight = window.innerHeight;

  const { top, bottom } = item.getBoundingClientRect();

  // check if top of element is able to be scrolled to top of window
  // height of body - height of window vs top of element
  const maxScroll = docHeight - winHeight;
  const elTop = top + start;

  const end = Math.min( maxScroll, elTop );

  const timestamp = performance.now();
  let stop = false;

  const rafCallback = ( now ) => {
    if ( stop ) {
      return;
    }

    slide( start, end, 750, now - timestamp );

    if ( now - timestamp <= 750 ) {
      requestAnimationFrame( rafCallback );
    }
  };
  requestAnimationFrame( rafCallback );

  window.addEventListener( "scroll", () => {
    void 0;
  });
}
