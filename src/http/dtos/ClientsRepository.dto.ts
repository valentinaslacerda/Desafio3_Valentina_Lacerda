import { Client } from '../../domain/entities/Client';
import { CreateClientDTO } from './CreateClient.dto';
import { ReadClientDTO } from './ReadClient.dto';

export interface ClientsRepositoryDTO {
  create(data: CreateClientDTO): Promise<Client>;

  findById(id: ReadClientDTO): Promise<Client | null>;
}
