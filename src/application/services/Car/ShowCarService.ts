import { CarsRepository } from '../../../domain/repositories/CarsRepository';

export interface IShowCar {
  id: string;
  plate: string;
  brand: string;
  model: string;
  km: number;
  year: number;
  price: number;
  status: string;
  items: String[];
  createdAt: Date;
}

export class ShowCarService {
  private CarsRepository: CarsRepository;

  constructor(CarsRepository: CarsRepository) {
    this.CarsRepository = CarsRepository;
  }

  public async execute(id: string): Promise<IShowCar> {
    const car = await this.CarsRepository.findById(id);

    if (!car)
      throw new Error("Carro não encontrado.");

    const { items, deletedAt, ...info_car } = car;

    const ret_car: IShowCar = { ...info_car, items: items.map(item => item.name) };

    return ret_car;
  }
}

export default ShowCarService;
