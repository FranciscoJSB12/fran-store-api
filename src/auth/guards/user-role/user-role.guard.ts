import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  /*Aquí con el reflector es donde vamos a 
  obtener la metada*/
  constructor(
    private readonly reflector: Reflector
  ){}
  
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get('roles', context.getHandler());

    if(!validRoles || validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();

    const user = req.user as User;

    if(!user) throw new BadRequestException('User not found');
    /*IMPORTANTE, el AuthGuard() que está en el controlador es el que establce el usuario en los
    headers */

    for (const role of user.roles) {
      if(validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(`User ${user.fullName} needs a valid role: [${validRoles}]`);

    /*Hay que estar pendiente de lo que regresa, si regresa false entonces la respuesta es 403 forbidden */
  }
}
