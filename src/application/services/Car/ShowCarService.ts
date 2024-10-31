import { CarsRepository } from '../../../domain/repositories/CarsRepository';
import Car from '../../../domain/entities/Car';

export class ShowCarService {
  private CarsRepository: CarsRepository;

  constructor(CarsRepository: CarsRepository) {
    this.CarsRepository = CarsRepository;
  }

  public async execute(id: string): Promise<Car> {
    const car = await this.CarsRepository.findById(id);

    if (!car)
      throw new Error("Carro não encontrado.");

    return car;
  }
}

export default ShowCarService;
