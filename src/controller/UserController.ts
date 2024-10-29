import { Request, Response } from 'express';

class UserController {
  async index(req: Request, res: Response) {
    return res.status(200).json('API rodando!');
  }
}

module.exports = new UserController();
