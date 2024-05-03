import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
//import { Auth } from 'src/auth/decorators';
//import { ValidRoles } from 'src/auth/interfaces/valid-roles';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  //@Auth(ValidRoles.admin)
  /*IMPORTANTE: hay que tener el cuenta que el decorador
  auth usa el AuthGuard() está conectado a passport
  y passport es un módulo por lo que todo se encuentra encapsulado
  y hay que hacer la importación en el seed del modulo de auth*/
  executeSeed() {
    return this.seedService.runSeed();
  }
}
