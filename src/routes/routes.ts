import { Router } from 'express';
const ClientController = require('../http/controller/ClientController');
const UserController = require('../http/controller/UserController');

const routes = Router();

routes.get('/user', UserController.index);
routes.post('/client', ClientController.create);
export default routes;
