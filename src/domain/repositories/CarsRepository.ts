import { Repository } from 'typeorm';
import Car from '../entities/Car';
import { AppDataSource } from '../../infra/data-source';

export interface ICreateCar {
  plate: string;
  brand: string;
  model: string;
  km: number;
  year: number;
  price: number;
  status: string;
}

export class CarsRepository {
  private ormRepository: Repository<Car>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Car);
  }

  public async create({
    plate,
    brand,
    model,
    km,
    year,
    price,
    status,
  }: ICreateCar): Promise<Car> {
    const car = this.ormRepository.create({plate, brand, model, km, year, price, status});

    await this.ormRepository.save(car);

    return car;
  }

  public async save(car: Car): Promise<Car> {
    await this.ormRepository.save(car);

    return car;
  }

  public async findById(id: string): Promise<Car | null> {
    return this.ormRepository.findOne({ where: { id } });
  }
}

export default CarsRepository;
