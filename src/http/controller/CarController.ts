import { Request, Response } from 'express';
import CarsRepository from '../../domain/repositories/CarsRepository';
import CreateCarService from '../../application/services/Car/CreateCarService';
import ShowCarService from '../../application/services/Car/ShowCarService';
import UpdateCarService from '../../application/services/Car/UpdateCarService';
import DeleteCarService from '../../application/services/Car/DeleteCarService';

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

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { plate, brand, model, km, year, price, status, items } = req.body;

      const carsRepository = new CarsRepository();

      const updateCar = new UpdateCarService(carsRepository);

      const car = await updateCar.execute(id, { plate, brand, model, km, year, price, status, items });

      return res.json(car);
    }
    catch (err) {
      if (err instanceof Error)
        return res.json({ error: err.message });

      return res.json({ error: 'Um erro inesperado aconteceu.' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try{  
      const id = req.params.id;

      const carsRepository = new CarsRepository();

      const deleteCar = new DeleteCarService(carsRepository);

      await deleteCar.execute(id);

      return res.sendStatus(204);
    }
    catch (err) {
      if (err instanceof Error)
        return res.json({ error: err.message });

      return res.json({ error: 'Um erro inesperado aconteceu.' });
    }
  }
}

module.exports = new CarController();
