import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

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

    console.log({ validRoles });

    /*Hay que estar pendiente de lo que regresa, si regresa false entonces la respuesta es 403 forbidden */
    return true;
  }
}
