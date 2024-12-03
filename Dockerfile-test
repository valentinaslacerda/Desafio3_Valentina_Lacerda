FROM node:20
WORKDIR app
COPY . .
RUN npm install
CMD ["sh", "-c", "npx -y wait-on tcp:mysql:3306 && npm run migration:run && npm run seed:run && npm run test:run"]
