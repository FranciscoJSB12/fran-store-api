import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
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
