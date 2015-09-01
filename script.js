var KEYSTROKE_DELAY = 100;

Chart.defaults.global.responsive = true;

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

function makeArray( list ) {
  return Array.prototype.slice.call( list );
}

function isVisible( element ) {
  var rect = element.getBoundingClientRect();
//   console.log( rect.top, rect.bottom, window.innerHeight );
  return rect.top <= window.innerHeight &&
    rect.bottom >= 0;
}

// // Promise wrapper/polyfill for requestAnimationFrame
// function nextFrame() {
//   return new Promise( function( resolve, reject ) {
//     if ( 'requestAnimationFrame' in window ) {
//       requestAnimationFrame( resolve );
//     } else {
//       setTimeout( resolve, 0 );
//     }
//   });
// }

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
  var promise = wait( 1000 ).then( bond( typeString, 'Hello world', hello ) )
    .then( bond( wait, 750 ) )
    .then( function() {
      var tyler = document.querySelector( '#tyler-eich' );
      tyler.classList.add( 'enter' );
    });
  
  return promise;
}

function loadGraph() {
  var data = [
        {
            value: 101,
            label: "JavaScript",
            color: "#607D8B ",
//             highlight: "rgba(220,220,220,0.75)",
        }, {
            value: 43,
            label: "Angular",
            color: "#78909C",
//             highlight: "rgba(220,220,220,0.75)",
        }, {
            value: 19,
            label: "jQuery",
            color: "#90A4AE",
//             highlight: "rgba(220,220,220,0.75)",
        }, {
            value: 18,
            label: "Google Maps",
            color: "#B0BEC5",
//             highlight: "rgba(220,220,220,0.75)",
        }, {
            value: 15,
            label: "CSS",
            color: "#CFD8DC",
//             highlight: "rgba(220,220,220,0.75)",
        }
    ];
  var ctx = document.getElementById("myChart").getContext("2d");
  var myNewChart = new Chart(ctx).Doughnut(data, {
    barShowStroke: false,
    animationEasing: 'easeOutQuint',
    animateScale: true,
    animationSteps : 180,
    percentageInnerCutout: 62,
    segmentShowStroke: false
});
}

function setClassOnNodes( className, include, nodes, delay ) {
  if ( delay === undefined ) {
    delay = 0;
  }

  if ( nodes.length > 1 ) {
    nodes = makeArray( nodes );
  } else {
    nodes = [ nodes ];
  }

  var promise = nodes.reduce( function( promise, node ) {
    var nextPromise = promise.then( bond( wait, delay ) )
      .then( function() {
        if ( include ) {
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
  return setClassOnNodes( className, true, nodes, delay );
}

function removeClassFromNodes( className, nodes, delay ) {
  return setClassOnNodes( className, false, nodes, delay );
}

function enterItems( items ) {
  return wait( 0 ).then( function() {
    var visible = items.filter( isVisible );

    visible.reduce( function( promise, item ) {
      return promise.then(
        bond( addClassToNodes, 'enter', item, 100 )
      );
    }, Promise.resolve() );
  });
}

function init() {
  beginTyping();

  var gridItems = makeArray( document.querySelectorAll( '.grid-item' ) );
  var headings = makeArray( document.querySelectorAll( 'h1' ) );

  var items = headings.concat( gridItems );

  var debounce = false;

  if ( window.pageYOffset ) {
    window.window.addEventListener( 'load', bond( enterItems, items ) );
  }
  
  window.addEventListener( 'scroll', bond( enterItems, items ) );
  window.addEventListener( 'resize', bond( enterItems, items ) );
//   loadGraph();
}

if ( document.readyState !== 'loading' ) {
  init();
} else {
  window.addEventListener( 'DOMContentLoaded', init );
}
