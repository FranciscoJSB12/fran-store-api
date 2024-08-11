import { Response } from 'express';
import { BadRequestException, Controller, Res, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findProductImage (
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {
    
    const path = this.filesService.getStaticProductImage(imageName);
    
    //El uso de res proveniente de express se salta interceptores definidos de forma global
    //Se debe usar con precaución
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  //SEGUNDO: hace falta usar el interceptor (useInterceptors)
  //TERCERO: hay que pasarle el fileInterceptor
  //CUARTO: en fileInterceptor se pasa la llave del body que se manda con el archivo (file en este caso)
  uploadProductImage(
    //PRIMERO: usamos este decorador(uploadedFile), luego hace falta el interceptor
    @UploadedFile() file: Express.Multer.File) {
      
      if(!file) {
        throw new BadRequestException('Make sure that the file is an image');
      }

      const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

      return {
        secureUrl
      };
  }
}
