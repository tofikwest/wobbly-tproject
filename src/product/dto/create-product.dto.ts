import { IsNumber, IsString } from 'class-validator';

export class CreateProductDTO {
  @IsString()
  title: string;

  @IsNumber()
  price: number;

  @IsString()
  description: string;

  @IsString()
  categoryName: string;
}
