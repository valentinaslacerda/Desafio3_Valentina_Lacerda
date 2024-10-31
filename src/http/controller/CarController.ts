import { Request, Response } from 'express';
import CarsRepository from '../../domain/repositories/CarsRepository';
import CreateCarService from '../../application/services/Car/CreateCarService';
import ShowCarService from '../../application/services/Car/ShowCarService';

class CarController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { plate, brand, model, km, year, price, status, items } = req.body;

      const carsRepository = new CarsRepository();

      const createCar = new CreateCarService(carsRepository);

      const car = await createCar.execute({
        plate, brand, model, km, year, price, status, items
      });

      return res.json(car);
    }
    catch (err) {
      if (err instanceof Error)
        return res.json({ error: err.message });

      return res.json({ error: 'Um erro inesperado aconteceu.' });
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const carsRepository = new CarsRepository();

      const showCar = new ShowCarService(carsRepository);

      const car = await showCar.execute(id);

      return res.json(car);
    }
    catch (err) {
      if (err instanceof Error)
        return res.json({ error: err.message });

      return res.json({ error: 'Um erro inesperado aconteceu.' });
    }
  }
}

module.exports = new CarController();
