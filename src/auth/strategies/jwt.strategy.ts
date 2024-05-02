import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

export class JwtStrategy extends PassportStrategy(Strategy) {
    
    //PassportStrategy revisa el jwt en base a la clave y si no ha expirado

    //La estrategía te dice si el token es valido

    async validate (payload: JwtPayload): Promise<User> {
        //Cuando se tenga un jwt vigente y coincidiendo firma con payload recibimos el payload y validamos
        const { email } = payload;
        
        return;
    }
}