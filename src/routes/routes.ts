import { Router } from 'express';
const UserController = require('../http/controller/UserController');
const CarController = require('../http/controller/CarController');

const routes = Router();

routes.get('/user', UserController.index);
routes.get('/cars', CarController.list);
routes.get('/cars/:id', CarController.show);
routes.post('/cars', CarController.create);
routes.patch('/cars/:id', CarController.update);
routes.delete('/cars/:id', CarController.delete);

export default routes;
