import { Repository } from 'typeorm';
import Car from '../entities/Car';
import { AppDataSource } from '../../infra/data-source';
import { CreateCarDTO } from '../../http/dtos/CreateCar.dto';

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
    items,
  }: CreateCarDTO): Promise<Car> {
    const car_items = items.map(item => { return { name: item } });
    
    const car = this.ormRepository.create({ plate, brand, model, km, year, price, status, items: car_items });

    await this.ormRepository.save(car);

    return car;
  }

  public async save(car: Car): Promise<Car> {
    await this.ormRepository.save(car);

    return car;
  }

  public async remove(car: Car): Promise<void> {
    car.deletedAt = new Date();
    car.status = "excluído";
    await this.ormRepository.save(car);
  }

  public async findById(id: string): Promise<Car | null> {
    return this.ormRepository.findOne({ where: { id }, relations: ['items'] });
  }

  public async findByPlate(plate: string): Promise<Car | null> {
    return this.ormRepository.findOne({ where: { plate }, relations: ['items'] });
  }

  public async findAll(page: number, limit: number) { // TODO: interface for return value
    const skip = (page - 1) * limit;
    const [ cars, count ] = await this.ormRepository.createQueryBuilder().skip(skip).take(limit).getManyAndCount();

    return {
      per_page: limit,
      total: count,
      current_page: page,
      data: cars
    }
  }
}

export default CarsRepository;
