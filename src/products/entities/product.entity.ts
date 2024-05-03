import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./";
import { User } from "../../auth/entities/user.entity";

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;

    @Column('float', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text',{
        unique: true
    })
    slug:string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {

    })

    @Column('text', {
        array: true
    })
    sizes: string[];

    @Column('text')
    gender: string;

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @OneToMany(
        //Esto indica que regresa un ProductImage, asegurate de que regresa la clase
        () => ProductImage,
        //Ahora se indica cómo se relaciona productImage con con product
        (productImage) => productImage.product,
        //Esta ultima permite que si se elimina un producto genera que se eliminen las imagenes asociadas 
        { cascade: true, eager: true }
        /*Este eager: true permite que cada vez que se cargue un producto en
        automatico se trae las imágenes*/
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true },
        //Ese eager: true carga la relación, de forma que cuando lo pidas te trae también el usuario que lo creó
    )
    user: User;

    //Este decorador permite que cada vez que 
    //se inserte se aplique la condición mostrada
    @BeforeInsert()
    checkInsertSlug() {
        
        if (!this.slug) {
            this.slug = this.title;
        }

        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }
}
