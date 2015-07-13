var fs = require( 'fs' );

var autoprefixer = require( 'autoprefixer-core' );
var cssnano = require('cssnano')
var postcss = require( 'postcss' );

var uglifyjs = require( 'uglify-js2' );


function prefixAndMinifyCss() {
  var styleCss = fs.readFileSync( 'style.css', { encoding: 'utf-8' } );

  return postcss([ autoprefixer, cssnano() ]).process( styleCss )
    .then( function ( result ) {
      result.warnings().forEach( function ( warn ) {
        console.warn( warn.toString() );
      });

      return result.css;
    });
}

function minifyJs() {
  // var scriptJs = fs.readFileSync( 'script.js', 'utf-8' );

  return Promise.resolve( uglifyjs.minify( 'script.js' ) );
}


var html = fs.readFileSync( 'dev.html', { encoding: 'utf-8' } );


prefixAndMinifyCss()
  .then(
    function( css ) {
      html = html.replace(
        '<link rel="stylesheet" href="style.css">',
        '<style>' + css + '</style>'
      );
    }
  )
  .then( minifyJs )
  .then(
    function( js ) {
      html = html.replace(
        '<script src="script.js"></script>',
        '<script>' + js + '</script>'
      );
    }
  )
  .then(
    function() {
      console.log( html );
    }
  )
