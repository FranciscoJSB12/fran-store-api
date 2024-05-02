import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { Injectable, UnauthorizedException } from "@nestjs/common";

//IMPORTANTE: jwtStrategy y todas las estrategías son providers
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    
    //PassportStrategy revisa el jwt en base a la clave y si no ha expirado

    //La estrategía te dice si el token es valido

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        //PENDIENTE: si usas ese config service aquí entonces en el auth.module tienes que importar el configModule
        configService: ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }

    async validate (payload: JwtPayload): Promise<User> {
        //Cuando se tenga un jwt vigente y coincidiendo firma con payload recibimos el payload y validamos
        const { email } = payload;

        const user = await this.userRepository.findOneBy({ email });

        if(!user) throw new UnauthorizedException('Token is not valid');

        if(!user.isActive) throw new UnauthorizedException('User is inactive, talk with an admin');

        /*IMPORTANTE: se está retornando un usuario,
        ese retorno implica que se está añadiendo al objeto request(res como como se conocía en express) ese usuario*/
        return user;
    }
}