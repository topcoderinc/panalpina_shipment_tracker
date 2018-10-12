# Panalpina Shipping App Design-to-Prototype

### HEROKU URL & DEMO
https://pan-app-tc.herokuapp.com/
To test out the application, please use these tracking numbers:
PNH009736, LKHBA-004459, TKY001234, BRRIO-006783, 157-48197836, 220-12345678

## Prerequisite
> [node >= 9.11 and npm >= 5.6](https://nodejs.org/en/download/)
> [angular-cli >= 6.2](https://github.com/angular/angular-cli#installation)

!!! Note: this project uses the `node-sass` npm package, which, on windows machines requires the [`node-gyp` prerequisites](https://github.com/nodejs/node-gyp#on-windows).

Install all dependencies by running `npm install` in project's root folder.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.2.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.
To run the files in the `dist` folder you can use either apache, nginx.
You can also install [http-server](https://www.npmjs.com/package/http-server) and use it to run the project: 
```sh
$ npm i -g http-server
$ http-server dist/panalpina
```

See https://www.npmjs.com/package/http-server for more details on `http-server`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Deploying to heroku
Make sure you have latest Heroku CLI installed:
``` sh
$ npm install -g heroku-cli
```

Login to heroku:
``` sh
$ heroku login
```

Create the heroku application:
``` sh
$ heroku apps:create <application-name>
```
Replace `<application-name>` with the name of the application you'd like. eg:
``` sh
$ heroku apps:create pan-app-tc
```

Build the application:
``` sh
$ ng build -prod
```

Add the code to your heroku instance:
``` sh
$ git add .
$ git add -f dist
$ git commit -m "init"
```

Finally, deploy to your heroku instance:
``` sh
$ git push heroku master
```

See your running app at `https://<application-name>.heroku.com`, in the given example it would be: `https://pan-app-tc.herokuapp.com/`, or simply open it by running:
``` sh
$ heroku open
```
!!!NOTE: the `server.js` file is only for serving files on heroku. do not use it on localhost!

### Environment configuration files
Please find the env configuration files located in `src/environments/`, as follows:
> `environment.ts` config file for development environment
> `environment.prod.ts` config file for production environment

The available configurations are:
> `production` sets current environment as production or not
> `api` Mock urls for the api (locations to json files, as of this moment)
> `gMap.apiKey` The google maps api key to use in the application. It is required in api v3. Check [here](https://developers.google.com/maps/documentation/javascript/get-api-key) to see how to get one.
> `gmap` Config the default center & zoom level for the map


## 3rd Party libraries
> [d3js](https://d3js.org/)


### Mock data
All data can be found in `.json` files under `/assets/data/` folder.
The JSON structure is normalized, as well as the properties are (no white space, just camelCase properties).
