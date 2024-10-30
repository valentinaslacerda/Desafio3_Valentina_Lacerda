import { ClientsRepository } from '../../domain/repositories/ClientsRepository';
import { Client } from '../../domain/entities/Client';

interface ICreateClient {
  name: string;
  birthday: Date;
  cpf: string;
  email: string;
  phone: string;
}

export class CreateClientService {
  private clientsRepository: ClientsRepository;

  constructor(clientsRepository: ClientsRepository) {
    this.clientsRepository = clientsRepository;
  }

  public async execute({
    name,
    birthday,
    cpf,
    email,
    phone,
  }: ICreateClient): Promise<Client> {
    const client = this.clientsRepository.create({
      name,
      birthday,
      cpf,
      email,
      phone,
    });
    await this.clientsRepository.save(client);

    return client;
  }
}
export default CreateClientService;
