import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from ".";

@Entity()
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        () => Product,
        (product) => product.images,
        { onDelete: 'CASCADE'}
        /*Con esto nos evitamos el error
        ERROR [ExceptionsHandler] update or delete on table "product" violates foreign key constraint "FK_40ca0cd115ef1ff35351bed8da2" on table "product_image"
        La razón es que hay una relación entre el producto y la imagen y no pueden 
        quedar imagenes huerfanas
        */
    )
    product: Product;
}