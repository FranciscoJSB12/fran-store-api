import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Type(() => Number) // es equivalente a enableImplicitConversions: true
    //Por defecto los dto no transforman la data
    //No obstante, sí existe forma de transformarla
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type(() => Number) //enableImplicitConversion: true
    offset?: number;
}