var fs = require( 'fs' );

var htmlMinify = require( 'html-minifier' ).minify;

var html = fs.readFileSync( 'index.html', { encoding: 'utf-8' } );

var miniHtml = htmlMinify( html, {
  removeComments: true,
  collapseWhitespace: true
  // minifyJS: true,
  // minifyCSS: true
});

fs.writeFileSync( 'index.html', miniHtml );
