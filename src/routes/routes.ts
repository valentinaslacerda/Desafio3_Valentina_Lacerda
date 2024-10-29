import { Router } from 'express';
const UserController = require('../controller/UserController');

const routes = Router();

routes.get('/', UserController.index);

export default routes;
