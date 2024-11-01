import { Router } from 'express';

const UserController = require('../http/controller/UserController');
const AuthController = require('../http/controller/AuthController');
const Authenticated = require('../http/middleware/Auth');

const routes = Router();

routes.post('/login', AuthController.create);
routes.get('/user', UserController.index);
routes.get('/user/:id', Authenticated, UserController.selectById);
routes.post('/user', UserController.create);
routes.patch('/user/:id', UserController.update);
routes.delete('/user/:id', UserController.delete);

export default routes;
