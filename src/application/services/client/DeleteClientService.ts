import { DeleteClientDTO } from '../../../http/dtos/DeleteClient.dto';
import { Client } from '../../../domain/entities/Client';
import ClientsRepository from '../../../domain/repositories/ClientsRepository';

class DeleteClientService {
  private clientsRepository: ClientsRepository;

  constructor() {
    this.clientsRepository = new ClientsRepository();
  }

  public async execute(id: DeleteClientDTO): Promise<Client | null> {
    const client = await this.clientsRepository.delete(id);
    return client;
  }
}

export default DeleteClientService;
