import { Repository } from 'typeorm';
import { Client } from '../entities/Client';
import { AppDataSource } from '../../infra/data-source';
import { ClientsRepositoryDTO } from '../../http/dtos/ClientsRepository.dto';
import { CreateClientDTO } from '../../http/dtos/CreateClient.dto';
import { ReadClientDTO } from '../../http/dtos/ReadClient.dto';
import { ListClientParams } from '../../application/params/ListClientParams.type';
import { UpdateClientDTO } from '../../http/dtos/UpdateClient.dto';
import { DeleteClientDTO } from '../../http/dtos/DeleteClient.dto';

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

  public async index(
    params: ListClientParams
  ): Promise<{ clients: Client[]; total: number }> {
    const queryBuilder = this.ormRepository.createQueryBuilder('client');
    //Filtro nome e emailail
    if (params.name) {
      queryBuilder.andWhere('client.name LIKE :name', {
        name: `%${params.name}%`,
      });
    }
    if (params.email) {
      queryBuilder.andWhere('client.email LIKE :email', {
        email: `%${params.email}%`,
      });
    }
    if (params.cpf) {
      queryBuilder.andWhere('client.cpf LIKE :cpf', { cpf: `%${params.cpf}%` });
    }
    //Filtro de exclusão
    if (params.isDeleted !== undefined) {
      if (params.isDeleted)
        queryBuilder.andWhere('client.deletedAt IS NOT NULL');
      else queryBuilder.andWhere('client.deletedAt IS NULL');
    }
    //Ordenação
    if (params.orderBy !== undefined) {
      queryBuilder.orderBy(
        `client.${params.orderBy}`,
        params.orderDirection || 'ASC'
      );
    }

    //Paginação
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [clients, total] = await queryBuilder.getManyAndCount();
    return { clients, total };
  }

  public async update(data: UpdateClientDTO): Promise<Client | null> {
    const { id, ...fieldsToUpdate } = data;
    const client = await this.ormRepository.findOne({
      where: { id, deletedAt: undefined },
    });

    if (!client) {
      return null;
    }

    Object.assign(client, fieldsToUpdate);

    await this.ormRepository.save(client);

    return client;
  }

  public async delete({ id }: DeleteClientDTO): Promise<Client | null> {
    const client = await this.ormRepository.findOne({ where: { id } });

    if (!client) {
      return null;
    }

    if (client.deletedAt) {
      return null;
    }
    client.deletedAt = new Date();
    await this.ormRepository.save(client);

    return client;
  }
}

export default ClientsRepository;
