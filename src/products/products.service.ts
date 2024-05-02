import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>, 
  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);

      await this.productRepository.save(product);

      return product;
    } catch (err) {
      this.handleDBExceptions(err);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(term: string) {

    let product: Product;

    if(isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      //product = await this.productRepository.findOneBy({ slug: term })
      const queryBuilder = this.productRepository.createQueryBuilder();
      //La sintaxis de =:title o =:slug quiere decir que sea igual a los argumentos que les vamos a dar al where
      product = await queryBuilder.where('UPPER(title) =:title or slug =:slug', {
        title: term.toUpperCase(),
        slug: term.toLowerCase()
      }).getOne();
      //IMPORTANTE: UPPER(title) es una función de progress para llevar ese campo a mayúsculas
      /*Es una función para hacer un query
      se debería crear un indice propio en la base de datos
      para asegurarse que se busca el upper del
      titulo porque ahí no está usando el indice*/
    }
    
    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    /*IMPORTANTE: de esta forma le decimos a typeorm
    que busque un producto por el ID y cargue las propiedades que estén en updateProductDto, esto
    actualiza, solo hace la preparación para ello.
    */
    const product = await this.productRepository.preload({ id: id, ...updateProductDto });

    if (!product) {
      throw new NotFoundException(`Product with id: ${id}not found`);
    }

    try {
      await this.productRepository.save(product);
      return product;
    } catch (err) {
      this.handleDBExceptions(err);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDBExceptions(err: any) {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }

    this.logger.error(err);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
