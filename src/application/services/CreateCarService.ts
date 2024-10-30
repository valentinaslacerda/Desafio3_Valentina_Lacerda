import { CarsRepository, ICreateCar } from '../../domain/repositories/CarsRepository';
import Car from '../../domain/entities/Car';

export class CreateCarService {
  private CarsRepository: CarsRepository;

  constructor(CarsRepository: CarsRepository) {
    this.CarsRepository = CarsRepository;
  }

  public async execute({
    plate,
    brand,
    model,
    km,
    year,
    price,
    status,
  }: ICreateCar): Promise<Car> {
    const car = this.CarsRepository.create({
      plate,
      brand,
      model,
      km,
      year,
      price,
      status,
    });

    return car;
  }
}

export default CreateCarService;
