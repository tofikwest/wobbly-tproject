import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { Category } from './entity/category.entity';
import { faker } from '@faker-js/faker';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let module: TestingModule;

  const mockCreateProductDto: CreateProductDTO = {
    title: 'Test Product',
    price: 9.99,
    description: 'Test description',
    categoryName: 'Test Category',
  };

  const mockUpdateProductDto: UpdateProductDTO = {
    title: 'Updated Product',
    price: 19.99,
    description: 'Updated description',
    categoryName: 'Updated Category',
  };

  const mockProduct: Product = {
    id: 1,
    title: 'Test Product',
    price: 9.99,
    description: 'Test description',
    category: new Category(),
  };

  const mockUpdatedProduct: Product = {
    id: 1,
    title: 'Updated Product',
    price: 19.99,
    description: 'Updated description',
    category: new Category(),
  };

  const mockDeletedProduct = {
    message: 'Product deleted successfully',
    statusCode: 200,
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn().mockResolvedValue(mockProduct),
            find: jest.fn().mockResolvedValue([mockProduct]),
            findOne: jest.fn().mockResolvedValue(mockProduct),
            save: jest.fn().mockResolvedValue(mockProduct),
            delete: jest.fn().mockResolvedValue(mockDeletedProduct),
            merge: jest.fn().mockResolvedValue(mockUpdatedProduct),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            merge: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest
              .fn()
              .mockResolvedValue({ email: 'test@example.com' }),
          },
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('GET /product', () => {
    it('should return an array of products', async () => {
      const products = await controller.getProducts();
      expect(products).toBeInstanceOf(Array);
      expect(products).toContainEqual(mockProduct);
    });

    it('should return an empty array if no products exist', async () => {
      jest.spyOn(module.get(ProductService), 'findAll').mockResolvedValue([]);
      const products = await controller.getProducts();
      expect(products).toHaveLength(0);
    });
  });

  describe('GET /product/:id', () => {
    it('should return a product by id', async () => {
      const product = await controller.getProductById(1);
      expect(product).toHaveProperty('id', 1);
    });

    it('should return 404 if product not found', async () => {
      jest
        .spyOn(module.get(ProductService), 'findOne')
        .mockResolvedValue(undefined);
      const result = await controller.getProductById(999);
      expect(result).toHaveProperty('statusCode', 404);
      expect(result).toHaveProperty('message', 'Product not found');
    });
  });

  describe('POST /product', () => {
    it('should create a new product', async () => {
      const result = await controller.createProduct(mockCreateProductDto);
      expect(result).toEqual(mockProduct);
    });

    it('should return 400 if product already exists', async () => {
      jest.spyOn(module.get(ProductService), 'create').mockResolvedValue({
        message: 'Product already exist',
        statusCode: 400,
      });

      const result = await controller.createProduct(mockCreateProductDto);
      expect(result).toHaveProperty('statusCode', 400);
      expect(result).toHaveProperty('message', 'Product already exist');
    });
  });

  describe('PATCH /product/:id', () => {
    it('should update an existing product', async () => {
      const result = await controller.updateProduct(1, mockUpdateProductDto);
      expect(result).toEqual(mockUpdatedProduct);
    });

    it('should return 404 if product not found', async () => {
      jest.spyOn(module.get(ProductService), 'update').mockResolvedValue({
        message: 'Product not found',
        statusCode: 404,
      });

      const result = await controller.updateProduct(999, mockUpdateProductDto);
      expect(result).toHaveProperty('statusCode', 404);
      expect(result).toHaveProperty('message', 'Product not found');
    });
  });

  describe('PUT /product/:id', () => {
    it('should replace an existing product', async () => {
      const result = await controller.replaceProduct(1, mockCreateProductDto);
      expect(result).toEqual(mockUpdatedProduct);
    });

    it('should return 404 if product not found', async () => {
      jest.spyOn(module.get(ProductService), 'replace').mockResolvedValue({
        message: 'Product not found',
        statusCode: 404,
      });

      const result = await controller.replaceProduct(999, mockCreateProductDto);
      expect(result).toHaveProperty('statusCode', 404);
      expect(result).toHaveProperty('message', 'Product not found');
    });
  });

  describe('DELETE /product/:id', () => {
    it('should delete an existing product', async () => {
      const result = await controller.deleteProduct(1);
      expect(result).toEqual(mockDeletedProduct);
    });

    it('should return 404 if product not found', async () => {
      jest.spyOn(module.get(ProductService), 'delete').mockResolvedValue({
        message: 'Product not found',
        statusCode: 404,
      });

      const result = await controller.deleteProduct(999);
      expect(result).toHaveProperty('statusCode', 404);
      expect(result).toHaveProperty('message', 'Product not found');
    });
  });
});
