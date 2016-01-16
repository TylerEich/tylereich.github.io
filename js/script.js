var KEYSTROKE_DELAY = 100;

// Syntax sugar. I hate typing fn.bind( null, ... )
function bind() {
  var args = Array.prototype.slice.call( arguments );
  var fn = args.shift();
  args.unshift( null );

  return fn.bind.apply( fn, args );
}

// Promise wrapper for setTimeout
function wait( ms ) {
  return new Promise( function( resolve, reject ) {
    setTimeout( resolve, ms );
  });
}


function makeArray( list ) {
  if ( list.length === undefined ) return [ list ];
  return [].slice.call( list );
}


function listenOnce( node, type, callback ) {
  node.addEventListener( type, function( e ) {
    e.target.removeEventListener( e.type, arguments.callee );
    return callback( e );
  });
}


function isVisible( element ) {
  var rect = element.getBoundingClientRect();
  return rect.top <= window.innerHeight &&
    rect.bottom >= 0;
}


function isActive( element ) {
  var rect = element.getBoundingClientRect();
  var midway = window.innerHeight * 0.25;

  return rect.top <= midway && rect.bottom >= midway;
}




function setClassOnNodes( className, include, nodes, delay ) {
  if ( delay === undefined ) {
    delay = 0;
  }

  nodes = makeArray( nodes );
  console.log( nodes );

  var promise = nodes.reduce( function( promise, node ) {
    var nextPromise = promise.then( bind( wait, delay ) )
      .then( function() {
        if ( include ) {
          console.log( className, node );
          node.classList.add( className );
        } else {
          node.classList.remove( className );
        }
      });
    
    return nextPromise;
  }, Promise.resolve() );

  return promise;
}


function addClassToNodes( className, nodes, delay ) {
  // console.log( 'adding class ' + className + ' to ', nodes )
  return setClassOnNodes( className, true, nodes, delay );
}


function removeClassFromNodes( className, nodes, delay ) {
  return setClassOnNodes( className, false, nodes, delay );
}


function enterItems( items ) {
  return wait( 0 ).then( function() {
    var visible = items.filter( isVisible );
    var invisible = items.filter( function( item ) {
      return !isVisible( item );
    });

    items.splice( 0, Number.MAX_SAFE_INTEGER );
    items.splice.apply( items, [ 0, 0 ].concat( invisible ) );

    console.log( items.length, items );

    return visible.reduce( function( promise, item ) {
      return promise.then(
        bind( addClassToNodes, 'enter', item, 100 )
      );
    }, Promise.resolve() );
  });
}





function animatePageLanding() {

  function typeChar( char, element ) {
    element.innerText += char;
  }


  function typeString( string, element, cb ) {
    var chars = string.split( '' );

    var promise = chars.reduce( function( promise, char ) {
      var delay = KEYSTROKE_DELAY + Math.random() * KEYSTROKE_DELAY / 3;
      var nextPromise = promise.then( bind( wait, delay ) )
        .then( bind( typeChar, char, element ) );
      
      return nextPromise;
    }, Promise.resolve() );

    return promise;
  }


  var hello = document.querySelector( '#hello-world' );
  var promise = wait( 500 ).then( bind( typeString, 'Hello world', hello ) )
    .then( bind( wait, 750 ) )
    .then( function() {
      var tyler = document.querySelector( '#tyler-eich' );
      tyler.classList.remove( 'hide' );
    })
    .then( bind( wait, 750 ) )
    .then( function() {
      var header = document.querySelector( 'header' );
      header.classList.remove( 'hide' );
    });
  
  return promise;
}



function getLinkNode( item ) {
  return item.link;
}

function followNav( items ) {  
  var active = items.filter( function( item ) {
    return isActive( item.section );
  });

  var inactive = items.filter( function( item ) {
    return active.indexOf( item ) === -1;
  });

  removeClassFromNodes( 'active', inactive.map( getLinkNode ) );
  addClassToNodes( 'active', active.map( getLinkNode ) );
}



function init() {
  animatePageLanding();

  var animateItems = makeArray( document.querySelectorAll( '.animate' ) );
  var navItems = makeArray( document.querySelectorAll( '.link' ) )
    .map( function( node ) {
      var selector = node.getAttribute( 'href' );
      var section = document.querySelector( selector );

      return {
        link: node,
        section: section
      };
    });

  var debounce = false;

  window.addEventListener( 'load', bind( enterItems, animateItems ) );
  window.addEventListener( 'scroll', bind( enterItems, animateItems ) );
  window.addEventListener( 'resize', bind( enterItems, animateItems ) );

  window.addEventListener( 'load', bind( followNav, navItems ) );
  window.addEventListener( 'scroll', bind( followNav, navItems ) );
  window.addEventListener( 'resize', bind( followNav, navItems ) );
}

if ( document.readyState === 'complete' ) {
  init();
} else {
  window.addEventListener( 'load', init );
}


function setTouchClass() {
  var noTouch = !( 'ontouchstart' in window );
  var noTouchNodes = document.querySelectorAll( '.no-touch' );

  setClassOnNodes( 'no-touch', noTouch, noTouchNodes, 0 );
}
if ( document.readyState !== 'loading' ) {
  setTouchClass();
} else {
  window.addEventListener( 'DOMContentLoaded', setTouchClass );
}
