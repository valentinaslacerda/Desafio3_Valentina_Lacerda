import { Router } from 'express';
const OrderController = require('../http/controller/OrderController');
const UserController = require('../http/controller/UserController');

const routes = Router();

routes.get('/user', UserController.index);
routes.post('/orders', OrderController.create);
routes.get('/orders/:id', OrderController.findById);
routes.get('/orders', OrderController.list);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

export default routes;
