import { Request, Response } from 'express';
import CreateCarService from '../../application/services/CreateCarService';
import CarsRepository from '../../domain/repositories/CarsRepository';

class CarController {
  async index(req: Request, res: Response) : Promise<Response> {
    return res.status(200).json('API rodando!');
  }

  async create(req: Request, res: Response) : Promise<Response> {
    const { plate, brand, model, km, year, price, status } = req.body;

    const carsRepository = new CarsRepository();

    const createCar = new CreateCarService(carsRepository);

    const car = await createCar.execute({
      plate, brand, model, km, year, price, status
    });

    return res.json(car);
  }
}

module.exports = new CarController();
