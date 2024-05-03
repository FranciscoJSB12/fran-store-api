import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';

//Este es el nombre de la metadata
export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => {
    /*Lo que está ocurriendo aquí es que los args son recibidos
    como un arreglo, luego ese arreglo lo establece en la
    metadata con el SetMetadata*/
    
    return SetMetadata(META_ROLES, args);
};
