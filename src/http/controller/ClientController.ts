import { Request, Response } from 'express';
import CreateClientService from '../../application/services/client/CreateClientService';
import { v4 as uuidv4 } from 'uuid';
import ReadClientService from '../../application/services/client/ReadClientService';

class ClientController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const createClientService = new CreateClientService();
      const { name, birthday, cpf, email, phone } = req.body;
      const id = uuidv4();
      const clientData = { id, name, birthday, cpf, email, phone };
      const client = await createClientService.execute(clientData);

      if (!client) {
        return res.status(400).json({ message: 'Client creation failed' });
      }

      return res.status(200).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const readClientService = new ReadClientService();
      const { id } = req.params;
      console.log(req.params);
      const client = await readClientService.execute({ id });
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      return res.status(200).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

module.exports = new ClientController();
