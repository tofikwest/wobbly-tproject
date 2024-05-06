import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDTO } from './dto/create-product.dto';
import { Category } from './entity/category.entity';
import { UpdateProductDTO } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(product: CreateProductDTO): Promise<any> {
    try {
      const existProduct = await this.productRepository.findOne({
        where: { title: product.title },
      });

      if (existProduct) {
        return {
          message: 'Product already exist',
          statusCode: 400,
        };
      }

      let category: Category;
      const existCategory = await this.categoryRepository.findOne({
        where: { name: product.categoryName },
      });

      if (existCategory) {
        category = existCategory;
      } else {
        const newCategory = this.categoryRepository.create({
          name: product.categoryName,
        });
        category = await this.categoryRepository.save(newCategory);
      }

      const newProduct = this.productRepository.create({
        title: product.title,
        description: product.description,
        price: product.price,
        category: category,
      });

      const savedProduct = await this.productRepository.save(newProduct);
      return savedProduct;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ['category'],
    });
  }

  async findOne(id: number): Promise<any> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      return {
        message: 'Product not found',
        statusCode: 404,
      };
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDTO): Promise<any> {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['category'],
      });

      if (!product) {
        return {
          message: 'Product not found',
          statusCode: 404,
        };
      }

      let category: Category;
      const existCategory = await this.categoryRepository.findOne({
        where: { name: updateProductDto.categoryName },
      });

      if (existCategory) {
        category = existCategory;
      } else {
        const newCategory = this.categoryRepository.create({
          name: updateProductDto.categoryName,
        });
        category = await this.categoryRepository.save(newCategory);
      }

      const updatedProduct = this.productRepository.merge(product, {
        ...updateProductDto,
        category,
      });

      return await this.productRepository.save(updatedProduct);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async replace(id: number, updateProductDto: UpdateProductDTO): Promise<any> {
    try {
      let product = await this.productRepository.findOne({
        where: { id },
        relations: ['category'],
      });

      if (!product) {
        return {
          message: 'Product not found',
          statusCode: 404,
        };
      }

      let category: Category;
      const existCategory = await this.categoryRepository.findOne({
        where: { name: updateProductDto.categoryName },
      });

      if (existCategory) {
        category = existCategory;
      } else {
        const newCategory = this.categoryRepository.create({
          name: updateProductDto.categoryName,
        });
        category = await this.categoryRepository.save(newCategory);
      }

      product = this.productRepository.create({
        ...updateProductDto,
        id: product.id,
        category,
      });

      return await this.productRepository.save(product);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async delete(id: number): Promise<any> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });

      if (!product) {
        return {
          message: 'Product not found',
          statusCode: 404,
        };
      }

      await this.productRepository.delete(id);

      return {
        message: 'Product deleted successfully',
        statusCode: 200,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
