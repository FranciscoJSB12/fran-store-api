import { Response } from 'express';
import { BadRequestException, Controller, Res, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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

      const secureUrl = `${file.filename}`;

      return {
        secureUrl
      };
  }
}
