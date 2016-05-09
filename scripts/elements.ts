import { fastdom } from "./fastdom";
import { wait, bind, makeArray } from "./utils";

export function isVisible( element ) {
  const rect = element.getBoundingClientRect();
  return rect.top <= window.innerHeight &&
    rect.bottom >= 0;
}


export function isActive( element ) {
  const rect = element.getBoundingClientRect();
  const height = document.body.scrollHeight;
  const pos = document.body.scrollTop;
  const midway = pos / height * window.innerHeight;

  return rect.top <= midway && rect.bottom >= midway;
}


export function setClassOnNodes( className, include, nodes, delay = 0 ) {
  nodes = makeArray( nodes );

  const promise = nodes.reduce( function( promise, node ) {
    const nextPromise = promise.then(
        () => wait( delay )
      )
      .then(
        () => fastdom.mutate( () => {
          if ( include ) {
            node.classList.add( className );
          } else {
            node.classList.remove( className );
          }
        })
      );

    return nextPromise;
  }, wait( 0 ) );

  return promise;
}


export function addClassToNodes( className, nodes, delay = 0 ) {
  return setClassOnNodes( className, true, nodes, delay );
}


export function removeClassFromNodes( className, nodes, delay = 0 ) {
  return setClassOnNodes( className, false, nodes, delay );
}
