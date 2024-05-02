import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()    
    @IsOptional()
    slug?: string;

    @IsInt()
    //Nota: la diferencia entre este y el number es que IsInt no acepta decimales
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({ each: true })
    //Nota: el each: true quiere decir que cada elemento en el arreglo debe cumplir con ser un string
    @IsArray()
    sizes: string[];

    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];
}   
