var fs = require( 'fs' );

var autoprefixer = require( 'autoprefixer-core' );
var postcss = require( 'postcss' );

var htmlMinify = require('html-minifier').minify;


var scriptJs = fs.readFileSync( 'script.js', 'utf-8' );


function prefixCss() {
  var styleCss = fs.readFileSync( 'style.css', { encoding: 'utf-8' } );

  return postcss([ autoprefixer ]).process( styleCss )
    .then( function ( result ) {
      result.warnings().forEach( function ( warn ) {
        console.warn( warn.toString() );
      });
      
      return result.css;
    });
}

function minifyJs() {
  return Promise.resolve( uglifyjs.minify( 'script.js' ) );
}


var html = fs.readFileSync( 'dev.html', { encoding: 'utf-8' } );

prefixCss()
  .then(
    function( css ) {
      html = html.replace(
        '<link rel="stylesheet" href="style.css">',
        '<style>' + css + '</style>'
      );

      html = html.replace(
        '<script defer src="script.js"></script>',
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
