import { Router } from 'express';
const ClientController = require('../http/controller/ClientController');
const UserController = require('../http/controller/UserController');

const routes = Router();

routes.get('/user', UserController.index);
routes.post('/user', UserController.create);

routes.post('/client', ClientController.create);
routes.get('/client/:id', ClientController.findById);
routes.get('/client', ClientController.index);
routes.patch('/client/:id', ClientController.update);
routes.delete('/client/:id', ClientController.delete);
export default routes;
