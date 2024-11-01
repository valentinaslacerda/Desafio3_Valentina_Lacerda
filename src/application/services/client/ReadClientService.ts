import { Client } from '../../../domain/entities/Client';
import ClientsRepository from '../../../domain/repositories/ClientsRepository';
import { ReadClientDTO } from '../../../http/dtos/ReadClient.dto';

class ReadClientService {
  private clientsRepository: ClientsRepository;

  constructor() {
    this.clientsRepository = new ClientsRepository();
  }

  public async execute({ id }: ReadClientDTO): Promise<Client> {
    const client = await this.clientsRepository.findById({ id });
    if (!client) {
      throw new Error('Could not find client');
    }
    return client;
  }
}

export default ReadClientService;
