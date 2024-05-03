import { Controller, Post, Get, Headers, UseGuards, Body, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';
import { AuthService } from './auth.service';
import { CreateUserDto, LogInUserDto } from './dto';
import { User } from './entities/user.entity';
import { GetRawHeaders, GetUser } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  logInUser(@Body() logInUserDto: LogInUserDto) {
    return this.authService.logIn(logInUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @GetRawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders
  ) {
    return {
      ok: true,
      message: 'this is a private route',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }

  @Get('private2')
  /*El decorador @SetMetadata() sirve para adicionar
  información al controlador o método que quiero ejecutar,
  escribirlo únicamente no basta, hay que indicar que se 
  debe evaluar, para eso podemos crear un custom guard
  */
  //@SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  /*  @UseGuards(AuthGuard(), UserRoleGuard), es importante
  ver que solo se le pasa la referencia del UseRoleGuard*/
  privateRoute2(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      message: 'this is a private route2',
    }
  }

}
