// Code goes here

// var invisibleSpan = document.createElement( 'span' );
// invisibleSpan.className = 'invisible';
// var charSpan = document.createElement( 'span' );
// charSpan.className = 'char';

function backgroundScroll() {
  var canvas = document.querySelector( '#background' );
  var ctx = canvas.getContext( '2d' );

  var y = 0;

  var bg = new Image();

  bg.addEventListener( 'load', function drawBackground() {
    console.time( 'render' );
//     console.log( 'Loaded' );
//     console.log( canvas.width, canvas.height );
    var width = bg.naturalWidth;
    var height = bg.naturalHeight;

    ctx.drawImage( bg, -600, -y * 0.5, width * 0.7, height * 0.7 );

    y++;

    console.timeEnd( 'render' );

    window.setTimeout(
      requestAnimationFrame.bind( window, drawBackground ),
      100
    );
  }, false );

  bg.src = 'blurred-background.png';
}

function backgroundImageScroll() {
  var bg = document.querySelector( '#background' );

  var y = 0;

  function moveBackground() {
    console.time( 'render' );
    console.log( y );
//     console.log( canvas.width, canvas.height );
    
    bg.style.backgroundPosition = '50% -' + y + 'px';
    y++;

    console.timeEnd( 'render' );

    window.setTimeout(
      requestAnimationFrame.bind( window, moveBackground ),
      200
    );
  }

  moveBackground();
}

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

if ( document.readyState === 'complete' ) {
  setTimeout( function() {
    typeString( 'Hello world.', 0, document.querySelector( '#hello-world' ) );
  }, 1000 );
} else {
  window.addEventListener( 'load', function() {
    setTimeout( function() {
      typeString( 'Hello world.', 0, document.querySelector( '#hello-world' ) );
    }, 1000 );

  //   $( '#background' ).plaxify();
  //   $( '#hello-world' ).plaxify();

  //   $.plax.enable();
    // typeString( 'Hello.\n\nMy name\'s Tyler Eich.\n\nI build apps for the web.', 0, document.querySelector( '#text' ) );
  });
}
