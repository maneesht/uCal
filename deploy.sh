#!/bin/bash
npm install -g @angular/cli
cd uCalAngular
npm i
ng build --prod
cd ../server/
npm i
npm start
