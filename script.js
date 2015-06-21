// Code goes here

var invisibleSpan = document.createElement( 'span' );
invisibleSpan.className = 'invisible';
var charSpan = document.createElement( 'span' );
charSpan.className = 'char';

function typeString( string, i, element ) {
  if ( i >= string.length ) {
    return;
  }
  
  var amendment;
  
  // if ( char === ' ' ) {
  //   amendment = invisibleSpan.cloneNode();
  //   amendment.innerText = '';
  // } else if ( char === '\n' ) {
  //   amendment = invisibleSpan.cloneNode();
  //   amendment.innerText = '';
  // } else {
  //   char
  // }
  
  var char = string[ i ];
  
  element.innerText += char;
  
  var delay = Math.random() * 200 + 100;
  
  // delay = delay - ( delay / 2 ) + Math.random() * delay
  
  setTimeout( typeString.bind( null, string, ++i, element ), delay );
}

window.addEventListener( 'load', function() {
  setTimeout( function() {
    typeString( 'Hello world.', 0, document.querySelector( '#hello-world' ) );
  }, 1000 );
  
  $( '#background' ).plaxify();
  $( '#hello-world' ).plaxify();
  
  $.plax.enable();
  // typeString( 'Hello.\n\nMy name\'s Tyler Eich.\n\nI build apps for the web.', 0, document.querySelector( '#text' ) );
});
