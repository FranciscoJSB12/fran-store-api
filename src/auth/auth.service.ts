import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.userRepository.create(createUserDto);

      await this.userRepository.save(user);

      return user;

    } catch (err) {
      this.handleDBErros(err);
    }
  }

  private handleDBErros(err: any): never {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }

    console.log(err);

    throw new InternalServerErrorException('Please check server logs');
  }
}
