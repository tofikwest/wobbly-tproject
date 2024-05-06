import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/user/dto/register.dto';
import { LoginDto } from 'src/user/dto/login.dto';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    authService = new AuthService(null, null);
    controller = new AuthController(authService);
  });

  describe('login', () => {
    it('should return access token when login is successful', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const accessToken = 'mockAccessToken';

      jest.spyOn(authService, 'login').mockResolvedValue({ accessToken });

      const equalObject = {
        message: 'User logged in successfully',
        accessToken,
        statusCode: 200,
      };

      const result = await controller.login(loginDto);

      expect(result).toEqual(equalObject);
    });

    it('should return error message when login fails :: User with this email does not exist', async () => {
      const loginDto: LoginDto = {
        email: 'test55@example.com',
        password: 'password',
      };
      const errorMessage = 'User with this email does not exist';
      const notFoundException = new NotFoundException(errorMessage);

      jest.spyOn(authService, 'login').mockRejectedValue(notFoundException);

      const equalObject = {
        message: errorMessage,
        statusCode: 404,
      };

      const result = await controller.login(loginDto);

      expect(result).toEqual(equalObject);
    });

    it('should return error message when login fails :: User with wrong password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };
      const errorMessage = 'Invalid credentials';
      const unAuthorizedException = new UnauthorizedException(errorMessage);

      jest.spyOn(authService, 'login').mockRejectedValue(unAuthorizedException);

      const res = {
        message: errorMessage,
        statusCode: 401,
      };

      const result = await controller.login(loginDto);

      expect(result).toEqual(res);
    });
  });

  describe('register', () => {
    it('should return user data when registration is successful', async () => {
      const registerDto: RegisterDto = {
        email: 'newUser@example.com',
        password: 'password',
      };

      const user = {
        email: 'newUser@example.com',
        refreshToken: 'tokenRefresh',
        accessToken: 'tokenAccess',
      };

      jest.spyOn(authService, 'register').mockResolvedValue(user);

      const result = await controller.register(registerDto);

      const expectedResult = {
        message: 'User registered successfully',
        user,
        statusCode: 201,
      };

      expect(result).toEqual(expectedResult);
    });

    it('should return error message when registration fails :: User with this email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const expectedResult = {
        message: 'User with this email already exists',
        statusCode: 409,
      };

      jest.spyOn(authService, 'register').mockRejectedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
    });

    it('should return error message when registration fails :: User with this email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const expectedResult = {
        message: 'User with this email already exists',
        statusCode: 409,
      };

      jest.spyOn(authService, 'register').mockRejectedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
    });
  });
});
