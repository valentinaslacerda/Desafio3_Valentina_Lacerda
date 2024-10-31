import { Router } from 'express';
const UserController = require('../http/controller/UserController');

const routes = Router();

routes.get('/user', UserController.index);
routes.post('/user', UserController.create);

export default routes;
