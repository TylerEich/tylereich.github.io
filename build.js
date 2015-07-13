var fs = require( 'fs' );

var autoprefixer = require( 'autoprefixer-core' );
// var CleanCss = require( 'clean-css' );
var postcss = require( 'postcss' );

// var uglifyjs = require( 'uglify-js' );

var htmlMinify = require('html-minifier').minify;


var scriptJs = fs.readFileSync( 'script.js', 'utf-8' );


function prefixCss() {
  var styleCss = fs.readFileSync( 'style.css', { encoding: 'utf-8' } );

  return postcss([ autoprefixer ]).process( styleCss )
    .then( function ( result ) {
      result.warnings().forEach( function ( warn ) {
        console.warn( warn.toString() );
      });

      // var minified = new CleanCss().minify( result.css ).styles;

      // console.log( minified );
      return result.css;
    });
}

function minifyJs() {
  // var scriptJs = fs.readFileSync( 'script.js', 'utf-8' );

  return Promise.resolve( uglifyjs.minify( 'script.js' ) );
}


var html = fs.readFileSync( 'dev.html', { encoding: 'utf-8' } );

// console.log( prefixAndMinifyCss() );

prefixCss()
  .then(
    function( css ) {
      html = html.replace(
        '<link rel="stylesheet" href="style.css">',
        '<style>' + css + '</style>'
      );

      html = html.replace(
        '<script src="script.js"></script>',
        '<script>' + scriptJs + '</script>'
      );

      html = htmlMinify( html, {
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true
      });

      fs.writeFileSync( 'index.html', html );
    }
  )

// prefixAndMinifyCss()
//   .then(
//     function( css ) {
//       // console.log( css );
//       html = html.replace(
//         '<link rel="stylesheet" href="style.css">',
//         '<style>' + css + '</style>'
//       );
//     }
//   )
//   .then( minifyJs )
//   .then(
//     function( js ) {
//       html = html.replace(
//         '<script src="script.js"></script>',
//         '<script>' + js + '</script>'
//       );
//     }
//   )
//   .then(
//     function() {
//       html = minify( html, {
//         removeAttributeQuotes: true
//       });
//
//       console.log( html );
//     }
//   ).then(
//     function() {
//       console.log( 'finished' );
//     }
//   )

// setTimeout( function() {}, 5000 );
