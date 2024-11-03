import { Order } from '../../../domain/entities/Order';
import { OrderRepository } from '../../../domain/repositories/OrderRepository';

export class DeleteOrderService {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async softDeleteOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) throw new Error('Pedido não encontrado');

    if (order.status !== 'Aberto')
      throw new Error(
        'Apenas pedidos com status "Aberto" podem ser cancelados.'
      );

    order.status = 'Cancelado';
    order.cancellationDate = new Date();

    return await this.orderRepository.createOrder(order);
  }
}
