import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
  ){}

  async runSeed() {
    this.productService.deleteAllProducts();
    return 'This action runs the seed';
  }

  private async insertNewProducts() {
    return true;
  }
}
