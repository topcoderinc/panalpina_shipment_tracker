// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  gMap: {
    apiKey: 'AIzaSyBOVh9qEzv3VlBVA8Hc_hJm_vBnYYL32QQ',
    userLocation: { lat: 52.689329, lng: -0.875330 },
    center: { lat: 0, lng: 0 },
    zoom: 2,
  },
  apiBaseUrl: 'http://ec2-3-16-49-18.us-east-2.compute.amazonaws.com:8080/v1'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
