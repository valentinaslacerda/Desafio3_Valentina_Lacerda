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

    if (params.name) {
      queryBuilder.andWhere('client.name = :name', {
        name: params.name,
      });
    }
    if (params.email) {
      queryBuilder.andWhere('client.email = :email', {
        email: params.email,
      });
    }
    if (params.cpf) {
      queryBuilder.andWhere('client.cpf = :cpf', { cpf: params.cpf });
    }

    if (params.isDeleted === true) {
      queryBuilder.andWhere('client.deletedAt IS NOT NULL');
    } else if (params.isDeleted === false) {
      queryBuilder.andWhere('client.deletedAt IS NULL');
    }

    if (params.orderBy) {
      const orderFields = Array.isArray(params.orderBy)
        ? params.orderBy
        : [params.orderBy];
      const orderDirection = params.orderDirection || 'ASC';

      orderFields.forEach((field) => {
        queryBuilder.addOrderBy(`client.${field}`, orderDirection);
      });
    }

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
