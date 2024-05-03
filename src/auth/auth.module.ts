import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  //COMO ES UN PROVIDER (EL JWTSTRATEGY) LO PONGO EN LOS PROVIDERS, también lo exportamos porque se puede necesitar en otro lugar
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    //PENDIENTE: usaste ese config service en jwt strategy entonces aquí auth.module tienes que importar el ConfigModule
    TypeOrmModule.forFeature([
      User
    ]),
    PassportModule.register({ defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h' 
          }
        }
      }
    })
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '2h'
    //   }
    // })
  ],
  //LO EXPORTÉ AQUI (EL JWTSTRATEGY) por si quiero verificar el token de forma manual
  exports: [ TypeOrmModule, JwtStrategy, PassportModule, JwtModule ]
  //Exportamos JwtStrategy y el PassportModule para usar todo lo relacionado a passport fuera del módulo
})
export class AuthModule {}
