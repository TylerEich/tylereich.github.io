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

function renderLineNumbers() {
  var content = document.querySelector( '#content' );
  var gutterContainer = document.querySelector( '#gutter' );

  // clear gutter
  while ( gutterContainer.firstChild ) {
    gutterContainer.removeChild( gutterContainer.firstChild );
  }

  var gutter = document.createDocumentFragment();
  // var ctx = gutter.getContext( '2d' );
  // ctx.fillStyle = '#a0a0a0';
  // ctx.font = 'sans-serif 12px';
  // ctx.textAlign = 'right';
  // console.log( ctx );

  var lineNumber = 1;
  var cursorPosition = 0;

  for ( var i = 0; i < content.children.length; i++ ) {
    var child = content.children[ i ];
    var computedStyle = window.getComputedStyle( child );
    var tag = child.tagName;
    var height = child.offsetHeight;
    var lineHeight = parseFloat(
      computedStyle.getPropertyValue( 'line-height' )
    );
    var topOffset = 0;

    while ( topOffset < height ) {
      var el = document.createElement( 'p' );
      el.className = 'line-number';
      el.style.height = lineHeight + 'px';
      el.style.lineHeight = lineHeight + 'px';
      el.textContent = lineNumber.toString( 10 );
      gutter.appendChild( el );

      lineNumber++;
      topOffset += lineHeight;

      paddingBottom = parseFloat( computedStyle.getPropertyValue( 'padding-bottom' ) );
      console.log( topOffset + paddingBottom, height );

      if ( topOffset + paddingBottom >= height ) {
        el.style.paddingBottom = paddingBottom + 'px';
        console.log( 'padding', el );
        break;
      }
      if ( lineNumber > 500 ) {
        console.log( 'overflow' ); break;
      }
    }



    // topOffset = 0;
    // cursorOffset = lineHeight / 2;
    //
    // while ( topOffset < height ) {
    //   ctx.fillText( lineNumber.toString( 10 ), 8, cursorPosition + cursorOffset );
    //   console.log( lineNumber.toString( 10 ), 8, cursorPosition + cursorOffset );
    //
    //   topOffset += lineHeight;
    //   cursorPosition += lineHeight;
    //   lineNumber++;
    //
    // }
  }

  gutterContainer.appendChild( gutter );
}

window.addEventListener( 'load', function() {
  // renderLineNumbers();
  // window.addEventListener( 'resize', renderLineNumbers );

  setTimeout( function() {
    typeString( 'Hello world!', 0, document.querySelector( '#hello-world' ) );
  }, 1000 );

  $( '#background' ).plaxify();
  $( '#hello-world' ).plaxify();

  $.plax.enable();
  // typeString( 'Hello.\n\nMy name\'s Tyler Eich.\n\nI build apps for the web.', 0, document.querySelector( '#text' ) );
});
