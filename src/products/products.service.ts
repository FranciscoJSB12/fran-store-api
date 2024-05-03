import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>, 
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource
  ){}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user, 
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (err) {
      this.handleDBExceptions(err);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      /*Acá en relations indicamos la relación que nos interesa llenar*/
      relations: {
        //Bucamos el nombre que le definimos en el entity
        images: true
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images.map(image => image.url)
    }));
  }

  async findOne(term: string) {

    let product: Product;

    if(isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      //product = await this.productRepository.findOneBy({ slug: term })
      //'prod' es un alias para la tabla de producto, estamos en productRepository entonces decimo prod(la tabla principal)
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      //La sintaxis de =:title o =:slug quiere decir que sea igual a los argumentos que les vamos a dar al where
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
            title: term.toUpperCase(),
            slug: term.toLowerCase()})
        .leftJoinAndSelect('prod.images', 'prodImages')
      //Este leftJoinAndSelect hace falta porque se está usando query builder
      //'prod.images' es simplemente el punto donde queremos hacer el left join
      //prodImages es un alias para hacer otro join
        .getOne();
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

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map(image => image.url),
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    
    const { images, ...toUpdate } = updateProductDto;

    /*IMPORTANTE: de esta forma le decimos a typeorm
    que busque un producto por el ID y cargue las propiedades que estén en updateProductDto, esto
    actualiza, solo hace la preparación para ello.
    */
    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product) {
      throw new NotFoundException(`Product with id: ${id}not found`);
    }

    /*query runner: lo utilizaremos para hacer una transacción(una query), este necesita
    de un commit para realizar la misma*/
    const queryRunner = this.dataSource.createQueryRunner();

    //Primero nos conectamos a la base de datos
    await queryRunner.connect();

    //Iniciamos la transacción, todo lo que se haga con el query runner se va a añadir
    //a las transacciones
    await queryRunner.startTransaction();

    try {

      if(images) {
        await queryRunner.manager.delete(ProductImage, { product: id });
        //Esta instrucción se traduce como elimina todas las productImages con columna productId sea igual a id
        //La lógica que estamos aplicando es que si nos mandan imagenes, borramos las anteriores
        product.images = images.map(image => this.productImageRepository.create({ url: image }))
        //IMPORTANTE: En la línea product.images no estamos impactando la base de datos
      }

      product.user = user;
      
      await queryRunner.manager.save(product);
      //await queryRunner.manager.save(product); esta línea aún no impacta la base de datos

      //await this.productRepository.save(product); ya no hace falta esta línea por queryRunner

      await queryRunner.commitTransaction();
      //await queryRunner.commitTransaction(); Esta línea es super importante, hay que hacer el commit

      await queryRunner.release();
      //await queryRunner.release(); Esta línea libera al queryRunner

      return this.findOnePlain(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(err);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  //CUIDADO: deleteAllProduct es una función que va a barrer la base de datos entera
  async deleteAllProducts () {
    const query = this.productRepository.createQueryBuilder('product');
    //const query = this.productImageRepository.createQueryBuilder('product'); ese 'product' significa que le estamos poniendo un alias llamado product
    try {
      return await query.delete().where({}).execute();
      /*return await query.delete(); crea un delete de todos los registros en products y ese
      where({}) así sin condición va a ser que seleccione todos los productos*/
    } catch (err) {
      this.handleDBExceptions(err);
    }
  }

  private handleDBExceptions(err: any) {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }

    this.logger.error(err);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
