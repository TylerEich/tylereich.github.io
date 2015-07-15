function typeString( string, i, element ) {
  if ( i >= string.length ) {
    return;
  }

  var amendment;

  var char = string[ i ];

  element.innerText += char;

  var delay = Math.random() * 200 + 100;

  setTimeout( typeString.bind( null, string, ++i, element ), delay );
}

function beginTyping() {
  setTimeout( function() {
    typeString( 'Hello world.', 0, document.querySelector( '#hello-world' ) );
  }, 1000 );
}
if ( document.readyState !== 'loading' ) {
  beginTyping();
} else {
  window.addEventListener( 'DOMContentLoaded', beginTyping );
}
