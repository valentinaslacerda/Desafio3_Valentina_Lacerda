import { Order } from '../../../domain/entities/Order';
import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { ListOrdersDTO } from '../../../http/dtos/ListOrders.dto';

export class ListOrderService {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async listOrders(
    params: ListOrdersDTO
  ): Promise<{ orders: Order[]; total: number; pages: number }> {
    return this.orderRepository.listOrders(params);
  }
}
