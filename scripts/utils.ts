import { Promise } from "./promise";

// Syntax sugar. I hate typing fn.bind( null, ... )
export function bind( fn, ...args ) {
  return fn.bind.apply( fn, [ null, ...args ] );
}

// Promise wrapper for setTimeout
export function wait( ms ) {
  return new Promise( ( resolve, reject ) => void setTimeout( resolve, ms ) );
}

export function raf( callback ) {
  return new Promise(
    ( resolve, reject ) => void requestAnimationFrame( () => {
      callback();
      resolve();
    })
  );
}

export function makeArray( list ): any[] {
  if ( list.length === undefined ) return [ list ];
  return [].slice.call( list );
}

export function listenOnce( node, type, callback ) {
  node.addEventListener( type, function( e ) {
    e.target.removeEventListener( e.type, arguments.callee );
    return callback( e );
  });
}
