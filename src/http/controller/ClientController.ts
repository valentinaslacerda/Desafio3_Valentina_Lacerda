import { Request, Response } from 'express';
import CreateClientService from '../../application/services/CreateClientService';
import { v4 as uuidv4 } from 'uuid';

class ClientController {
  async create(req: Request, res: Response): Promise<Response> {
    const createClientService = new CreateClientService();
    const { name, birthday, cpf, email, phone } = req.body;
    const id = uuidv4();
    console.log(req.body);
    const clientData = { id, name, birthday, cpf, email, phone };
    const client = await createClientService.execute(clientData);

    return res.status(200).json(client);
  }
}

module.exports = new ClientController();
