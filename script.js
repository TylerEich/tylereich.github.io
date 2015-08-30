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

function init() {
  beginTyping();
//   loadGraph();
}

if ( document.readyState !== 'loading' ) {
  init();
} else {
  window.addEventListener( 'DOMContentLoaded', init );
}
