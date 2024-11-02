import { Router } from 'express';
const UserController = require('../http/controller/UserController');
const AuthController = require('../http/controller/AuthController');
const Authenticated = require('../http/middleware/Auth');
const CarController = require('../http/controller/CarController');
const ClientController = require('../http/controller/ClientController');
const routes = Router();

routes.post('/login', AuthController.create);
routes.get('/user', UserController.index);
routes.get('/user/:id', Authenticated, UserController.selectById);
routes.post('/user', UserController.create);
routes.patch('/user/:id', UserController.update);
routes.delete('/user/:id', UserController.delete);
routes.get('/cars', Authenticated, CarController.list);
routes.get('/cars/:id', Authenticated, CarController.show);
routes.post('/cars', Authenticated, CarController.create);
routes.patch('/cars/:id', Authenticated, CarController.update);
routes.delete('/cars/:id', Authenticated, CarController.delete);

routes.post('/client', ClientController.create);
routes.get('/client/:id', ClientController.findById);
routes.get('/client', ClientController.index);
routes.patch('/client/:id', ClientController.update);
routes.delete('/client/:id', ClientController.delete);
export default routes;
