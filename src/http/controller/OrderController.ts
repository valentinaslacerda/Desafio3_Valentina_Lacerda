import { Request, Response } from 'express';
import { CreateOrderService } from '../../application/services/order/CreateOrderService';
import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { ClientsRepository } from '../../domain/repositories/ClientsRepository';
import { CarRepository } from '../../domain/repositories/CarRepository';
import { AppDataSource } from '../../infra/data-source';
import { FindOrderService } from '../../application/services/order/FindOrderService';
import { ListOrderService } from '../../application/services/order/ListOrdersService';
import { UpdateOrderService } from '../../application/services/order/UpdateOrderService';
import { DeleteOrderService } from '../../application/services/order/DeleteOrderService';

class OrderController {
  private createOrderService: CreateOrderService;
  private findOrderService: FindOrderService;
  private listOrderService: ListOrderService;
  private updateOrderService: UpdateOrderService;
  private deleteOrderService: DeleteOrderService;

  constructor() {
    const orderRepository = new OrderRepository(AppDataSource);
    const clientRepository = new ClientsRepository(AppDataSource);
    const carRepository = new CarRepository(AppDataSource);
    this.createOrderService = new CreateOrderService(
      orderRepository,
      clientRepository,
      carRepository
    );
    this.findOrderService = new FindOrderService(orderRepository);
    this.listOrderService = new ListOrderService(orderRepository);
    this.updateOrderService = new UpdateOrderService(orderRepository);
    this.deleteOrderService = new DeleteOrderService(orderRepository);
  }

  public create = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { clientId, carId } = req.body;

    try {
      const order = await this.createOrderService.execute({ clientId, carId });
      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  };

  public findById = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { id } = req.params;

    try {
      const order = await this.findOrderService.findOrderById(id);
      return res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  };

  public list = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { status, clientCpf, startDate, endDate, sortOrder, page, limit } =
      req.query;

    try {
      const orders = await this.listOrderService.listOrders({
        status: status as string,
        clientCpf: clientCpf as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        sortOrder: sortOrder as 'ASC' | 'DESC',
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      });

      return res.status(200).json(orders);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  };

  public update = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { id } = req.params;
    const { initialDate, finalDate, cep, status } = req.body;

    try {
      const order = await this.updateOrderService.updateOrder({
        orderId: id,
        initialDate: initialDate ? new Date(initialDate) : undefined,
        finalDate: finalDate ? new Date(finalDate) : undefined,
        cep,
        status,
      });

      return res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  };

  public delete = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { id } = req.params;

    try {
      const order = await this.deleteOrderService.softDeleteOrder(id);
      return res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  };
}

module.exports = new OrderController();
