import { CarsRepository } from '../../../domain/repositories/CarsRepository';

export class DeleteCarService {
  private CarsRepository: CarsRepository;

  constructor(CarsRepository: CarsRepository) {
    this.CarsRepository = CarsRepository;
  }

  public async execute(id: string): Promise<void> {
    // TODO: Um carro não deve ser excluído se estiver em algum pedido aberto
    const car = await this.CarsRepository.findById(id);

    if (!car)
      throw new Error("Carro não encontrado.");

    await this.CarsRepository.remove(car);
  }
}

export default DeleteCarService;
