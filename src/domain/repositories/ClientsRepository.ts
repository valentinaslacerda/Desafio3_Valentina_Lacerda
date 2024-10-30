import { Repository } from 'typeorm';
import { Client } from '../entities/Client';

export class ClientsRepository extends Repository<Client> {
  public async findById(id: string): Promise<Client | null> {
    return this.findOne({ where: { id } });
  }
}

export default ClientsRepository;
