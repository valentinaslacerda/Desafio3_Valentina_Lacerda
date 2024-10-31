import { Request, Response } from 'express';
import { CreateUserDto } from '../dtos/CreateUser.dto';
import { ListUserService } from '../../application/services/user/ListUserService';
import { CreateUserService } from '../../application/services/user/CreateUseService';

class UserController {
  public async index(req: Request, res: Response): Promise<Response> {
    const params = {
      name: req.query.name as string,
      email: req.query.email as string,
      isDeleted: req.query.isDeleted === 'true' ? true : undefined,
      orderBy: req.query.orderBy as 'full_name' | 'createdAt' | 'deletedAt',
      orderDirection: req.query.orderDirection as 'ASC' | 'DESC',
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 10,
    };

    try {
      const listUserService = new ListUserService();
      const { users, total, totalPages } =
        await listUserService.execute(params);

      return res.status(200).json({
        meta: {
          total,
          page: params.page,
          pageSize: params.pageSize,
          totalPages,
        },
        users,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const { full_name, email, password } = req.body as CreateUserDto;

    try {
      const createUserService = new CreateUserService();
      const user = await createUserService.execute({
        full_name,
        email,
        password,
      });

      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Um erro inesperado aconteceu.' });
    }
  }
}

module.exports = new UserController();
