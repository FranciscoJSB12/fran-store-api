import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LogInUserDto } from './dto';
import { User } from './entities/user.entity';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = await this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);

      delete user.password;
    
      return user;

    } catch (err) {
      this.handleDBErros(err);
    }
  }

  async logIn(logInUserDto: LogInUserDto) {
    const { password, email } = logInUserDto; 

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true , password: true }
    });

    if(!user) throw new UnauthorizedException('Credentials are not valid');

    if(!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid');

    return user;
  }

  private handleDBErros(err: any): never {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }

    console.log(err);

    throw new InternalServerErrorException('Please check server logs');
  }
}
