import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      //Autoloadentities es para que cargue las entidades que vamos definiendo poco a poco
      autoLoadEntities: true,
      synchronize: true
      //En producción generalmente este valor se deja en falso (synchronize)
      //también se puede crear una variable de entorno para manejar la sincronización
    }),
    ProductsModule
  ],
})
export class AppModule {}
