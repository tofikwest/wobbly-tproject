import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Product } from './entity/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entity/category.entity';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;
  let categoryRepository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
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
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(productRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDTO = {
        title: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        categoryName: 'Test Category',
      };

      const category = new Category();
      category.id = 1;
      category.name = 'Test Category';

      const product = new Product();
      product.id = 1;
      product.title = 'Test Product';
      product.description = 'Test Description';
      product.price = 99.99;
      product.category = category;

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValueOnce(category);
      jest.spyOn(productRepository, 'create').mockReturnValueOnce(product);
      jest.spyOn(productRepository, 'save').mockResolvedValueOnce(product);

      const result = await service.create(createProductDto);

      expect(result).toEqual(product);
    });

    it('should throw an error if an exception occurs', async () => {
      const createProductDto: CreateProductDTO = {
        title: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        categoryName: 'Test Category',
      };

      jest
        .spyOn(productRepository, 'findOne')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(service.create(createProductDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products: Product[] = [
        {
          id: 1,
          title: 'Test Product 1',
          description: 'Test Description 1',
          price: 99.99,
          category: new Category(),
        },
        {
          id: 2,
          title: 'Test Product 2',
          description: 'Test Description 2',
          price: 199.99,
          category: new Category(),
        },
      ];

      jest.spyOn(productRepository, 'find').mockResolvedValueOnce(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a product if it exists', async () => {
      const productId = 1;
      const product: Product = {
        id: productId,
        title: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: new Category(),
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(product);

      const result = await service.findOne(productId);

      expect(result).toEqual(product);
    });

    it('should return a 404 error if the product does not exist', async () => {
      const productId = 1;

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.findOne(productId);

      expect(result).toEqual({
        message: 'Product not found',
        statusCode: 404,
      });
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDTO = {
        title: 'Updated Product',
        description: 'Updated Description',
        price: 199.99,
        categoryName: 'Updated Category',
      };

      const existingProduct: Product = {
        id: productId,
        title: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: new Category(),
      };

      const updatedCategory = new Category();
      updatedCategory.id = 2;
      updatedCategory.name = 'Updated Category';

      const updatedProduct: Product = {
        id: productId,
        ...updateProductDto,
        category: updatedCategory,
      };

      jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValueOnce(existingProduct);
      jest
        .spyOn(categoryRepository, 'findOne')
        .mockResolvedValueOnce(updatedCategory);
      jest
        .spyOn(productRepository, 'merge')
        .mockReturnValueOnce(updatedProduct);
      jest
        .spyOn(productRepository, 'save')
        .mockResolvedValueOnce(updatedProduct);

      const result = await service.update(productId, updateProductDto);

      expect(result).toEqual(updatedProduct);
    });

    it('should return a 404 error if the product does not exist', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDTO = {
        title: 'Updated Product',
        description: 'Updated Description',
        price: 199.99,
        categoryName: 'Updated Category',
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.update(productId, updateProductDto);

      expect(result).toEqual({
        message: 'Product not found',
        statusCode: 404,
      });
    });

    it('should throw an error if an exception occurs', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDTO = {
        title: 'Updated Product',
        description: 'Updated Description',
        price: 199.99,
        categoryName: 'Updated Category',
      };

      jest
        .spyOn(productRepository, 'findOne')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('replace', () => {
    it('should replace an existing product', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDTO = {
        title: 'Replaced Product',
        description: 'Replaced Description',
        price: 299.99,
        categoryName: 'Replaced Category',
      };

      const existingProduct: Product = {
        id: productId,
        title: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: new Category(),
      };

      const replacedCategory = new Category();
      replacedCategory.id = 3;
      replacedCategory.name = 'Replaced Category';

      const replacedProduct: Product = {
        id: productId,
        ...updateProductDto,
        category: replacedCategory,
      };

      jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValueOnce(existingProduct);
      jest
        .spyOn(categoryRepository, 'findOne')
        .mockResolvedValueOnce(replacedCategory);
      jest
        .spyOn(productRepository, 'create')
        .mockReturnValueOnce(replacedProduct);
      jest
        .spyOn(productRepository, 'save')
        .mockResolvedValueOnce(replacedProduct);

      const result = await service.replace(productId, updateProductDto);

      expect(result).toEqual(replacedProduct);
    });

    it('should return a 404 error if the product does not exist', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDTO = {
        title: 'Replaced Product',
        description: 'Replaced Description',
        price: 299.99,
        categoryName: 'Replaced Category',
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.replace(productId, updateProductDto);

      expect(result).toEqual({
        message: 'Product not found',
        statusCode: 404,
      });
    });

    it('should throw an error if an exception occurs', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDTO = {
        title: 'Replaced Product',
        description: 'Replaced Description',
        price: 299.99,
        categoryName: 'Replaced Category',
      };

      jest
        .spyOn(productRepository, 'findOne')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(
        service.replace(productId, updateProductDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('should delete an existing product', async () => {
      const productId = 1;
      const product: Product = {
        id: productId,
        title: 'Test Product',
        description: 'Test Description',
        price: 99,
        category: new Category(),
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(product);
      jest.spyOn(productRepository, 'delete').mockResolvedValueOnce(undefined);

      const result = await service.delete(productId);

      expect(result).toEqual({
        message: 'Product deleted successfully',
        statusCode: 200,
      });
      expect(productRepository.delete).toHaveBeenCalledWith(productId);
    });

    it('should return a 404 error if the product does not exist', async () => {
      const productId = 1;

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.delete(productId);

      expect(result).toEqual({
        message: 'Product not found',
        statusCode: 404,
      });
      expect(productRepository.delete).not.toHaveBeenCalled();
    });
  });
});
