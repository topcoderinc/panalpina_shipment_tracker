import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

const { gMap } = environment;

const url = `https://maps.googleapis.com/maps/api/js?key=${gMap.apiKey}&libraries=drawing&callback=__onGoogleLoaded`;

const loadScript = (src) => new Promise((res, rej) => {
  const node = document.createElement('script');
  node.src = src;
  node.type = 'text/javascript';
  node.onload = () => res();
  node.onerror = (err) => rej(err);

  document.getElementsByTagName('head')[0].appendChild(node);
});

@Injectable()
export class GMapsLoader {
  private static promise;

  public static load() {
    // First time 'load' is called?
    if (!GMapsLoader.promise) {

      // Make promise to load
      GMapsLoader.promise = new Promise((resolve, reject) => {

        // Set callback for when google maps is loaded.
        window['__onGoogleLoaded'] = (ev) => {
          resolve('google maps api loaded');
        };

        const node = document.createElement('script');
        node.src = url;
        node.type = 'text/javascript';
        node.onerror = (err) => {
          reject(err);
        };

        document.getElementsByTagName('head')[0].appendChild(node);
      });
    }

    // Always return promise. When 'load' is called many times, the promise is already resolved.
    return GMapsLoader.promise;
  }

  /**
   * loadUtilityLib Loads the maps utlility libraries
   * that need to be loaded after google maps
   */
  public static loadUtilityLib() {
    return Promise.all([
      loadScript('/assets/scripts/infobox.js'),
      loadScript('/assets/scripts/markerwithlabel.js')
    ]);
  }

  load() {
    return GMapsLoader.load();
  }
}
