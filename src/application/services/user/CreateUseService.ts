import { hash } from 'bcryptjs';
import { usersRepository } from '../../../domain/repositories/UserRepository';
import { IsNull } from 'typeorm';
import { CreateUserDto } from '../../../http/dtos/CreateUser.dto';

class CreateUserService {
  async execute({ full_name, email, password }: CreateUserDto) {
    if (!email) throw new Error('Campo vazio: email');
    if (!full_name) throw new Error('Campo vazio: nome completo');
    if (!password) throw new Error('Campo vazio: senha');

    const exist_user = await usersRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
    if (exist_user) throw new Error('Usuário já existe');

    const passwordHash = await hash(password, 8);

    const newUser = usersRepository.create({
      full_name,
      email,
      password: passwordHash,
      createdAt: new Date(),
      deletedAt: null,
    });

    await usersRepository.save(newUser);

    const { password: _, ...sanitizedUser } = newUser;
    return sanitizedUser;
  }
}

export { CreateUserService };
