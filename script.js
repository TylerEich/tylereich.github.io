var KEYSTROKE_DELAY = 100;

// Syntax sugar. I hate typing fn.bind( null, ... )
function bond() {
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


function typeChar( char, element ) {
  element.innerText += char;
}
function typeString( string, element, cb ) {
  var chars = string.split( '' );

  var promise = chars.reduce( function( promise, char ) {
    var delay = KEYSTROKE_DELAY + Math.random() * KEYSTROKE_DELAY / 3;
    var nextPromise = promise.then( bond( wait, delay ) )
      .then( bond( typeChar, char, element ) );
    
    return nextPromise;
  }, Promise.resolve() );

  return promise;
}

function beginTyping() {
  var hello = document.querySelector( '#hello-world' );
  wait( 1000 ).then( bond( typeString, 'Hello world', hello ) )
    .then( bond( wait, 750 ) )
    .then( function() {
      var tyler = document.querySelector( '#tyler-eich' );
      tyler.classList.add( 'enter' );
    });
}
if ( document.readyState !== 'loading' ) {
  beginTyping();
} else {
  window.addEventListener( 'DOMContentLoaded', beginTyping );
}
