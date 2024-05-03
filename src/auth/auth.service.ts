import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LogInUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';



@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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
    
      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };

    } catch (err) {
      this.handleDBErros(err);
    }
  }

  async logIn(logInUserDto: LogInUserDto) {
    const { password, email } = logInUserDto; 

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true , password: true, id: true }
    });

    if(!user) throw new UnauthorizedException('Credentials are not valid');

    if(!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid');

    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  async checkAuthStatus(user: User){
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  private getJwtToken(payload: JwtPayload) {
    //IMPORTANTE: este código es sincrono
    const token = this.jwtService.sign(payload);

    return token;
  }

  private handleDBErros(err: any): never {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }

    console.log(err);

    throw new InternalServerErrorException('Please check server logs');
  }
}
