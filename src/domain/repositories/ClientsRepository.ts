import { Repository } from 'typeorm';
import { Client } from '../entities/Client';
import { AppDataSource } from '../../infra/data-source';
import { ClientsRepositoryDTO } from '../../http/dtos/ClientsRepository.dto';
import { CreateClientDTO } from '../../http/dtos/CreateClient.dto';
import { ReadClientDTO } from '../../http/dtos/ReadClient.dto';

class ClientsRepository implements ClientsRepositoryDTO {
  private ormRepository: Repository<Client>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Client);
  }

  public async create(data: CreateClientDTO): Promise<Client> {
    const client = this.ormRepository.create(data);
    await this.ormRepository.save(client);
    return client;
  }

  public async findById({ id }: ReadClientDTO): Promise<Client | null> {
    const client = this.ormRepository.findOneBy({ id });

    return client;
  }
}

export default ClientsRepository;
