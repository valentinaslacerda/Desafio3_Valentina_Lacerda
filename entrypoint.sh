#!/bin/sh
cd /home/node/app
echo "Running"
npm install
npx -y wait-on tcp:mysql:3306
npm run migration:run
npm run seed:run
# npm run dev 
tail -f /dev/null