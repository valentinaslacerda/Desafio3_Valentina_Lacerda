#!bin/bash
cd /home/node/app
npm install
npx -y wait-on tcp:mysql:3306
npm run migration:run
npm run seed:run