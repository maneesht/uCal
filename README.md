# uCal[![Build Status](https://travis-ci.com/maneesht/uCal.svg?token=HusTaf8T8UP2cptpeArK&branch=master)](https://travis-ci.com/maneesht/uCal)

### Running the server
**Note: This serves from ../uCalAngular/dist so you must first build the front-end to be able to serve the web-app**
1. [Install Node.js](https://nodejs.org)
2. `cd server`
3. `npm install # or yarn install if you're cool`
4. `npm start # or yarn start if you're cool`
5. `Go to localhost:3000`

### Building the front-end
**Note: step 3 and 4 are one-time installs**
1. [Install Node.js](https://nodejs.org)
2. `cd uCalAngular`
3. `npm install -g @angular/cli # you may need sudo on *nix`
4. `npm install # or yarn start if you're cool`
5. `ng build [--prod] # creates the dist folder so you can serve, use the prod flag for performance`

### Running the front-end on its own
1. [Install Node.js](https://nodejs.org)
2. `cd uCalAngular`
3. `npm install -g @angular/cli # you may need sudo on *nix`
4. `npm install # or yarn install if you're cool`
5. `ng serve # runs a development server`
6. Open `localhost:4200`

## More info
Some things to know:
* The web application is set up to use a service-worker when in production, this caches resources and allows people to use the app when offline
