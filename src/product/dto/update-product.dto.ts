import { IsNumber, IsString } from 'class-validator';

export class UpdateProductDTO {
  @IsString()
  title: string;

  @IsNumber()
  price: number;

  @IsString()
  description: string;

  @IsString()
  categoryName: string;
}
