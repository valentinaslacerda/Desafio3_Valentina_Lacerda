import { Router } from 'express';
const UserController = require('../http/controller/UserController');

const routes = Router();

routes.get('/user', UserController.index);

export default routes;
