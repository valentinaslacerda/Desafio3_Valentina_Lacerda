import { Client } from '../../domain/entities/Client';
import { CreateClientDTO } from './CreateClient.dto';

export interface ClientsRepositoryDTO {
  create(data: CreateClientDTO): Promise<Client>;

  //findById(id: string): Promise<Client | null>;
}
