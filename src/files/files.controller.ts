import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';


@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter
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

      return {
      fileName: file.originalname,
    };
  }
}
