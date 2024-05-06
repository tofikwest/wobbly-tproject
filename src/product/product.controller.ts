import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts() {
    try {
      return await this.productService.findAll();
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get(':id')
  async getProductById(id: number) {
    try {
      return await this.productService.findOne(id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post()
  async createProduct(@Body() createProductDTO: CreateProductDTO) {
    try {
      return await this.productService.create(createProductDTO);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Patch(':id')
  async updateProduct(id: number, @Body() update: UpdateProductDTO) {
    try {
      return await this.productService.update(id, update);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Put(':id')
  async replaceProduct(id: number, @Body() createProductDTO: CreateProductDTO) {
    try {
      return await this.productService.replace(id, createProductDTO);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete(':id')
  async deleteProduct(id: number) {
    try {
      return await this.productService.delete(id);
    } catch (error) {
      return { error: error.message };
    }
  }
}
