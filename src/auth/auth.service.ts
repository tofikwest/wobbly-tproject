import {
  UnauthorizedException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userService: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async register(email: string, password: string): Promise<any> {
    const existingUser = await this.userService.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const generateTokens = await this.generateToken({
      email,
    });

    const newUser = this.userService.create({
      email,
      password: hashedPassword,
      refreshToken: generateTokens.refresh_token,
      accessToken: generateTokens.access_token,
    });

    const finalStagedUser = await this.userService.save(newUser);

    return {
      id: finalStagedUser.id,
      email: finalStagedUser.email,
      accessToken: finalStagedUser.accessToken,
      refreshToken: finalStagedUser.refreshToken,
    };
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.userService.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const generateTokens = await this.generateToken({
      email,
    });

    user.accessToken = generateTokens.access_token;

    const finalStagedUser = await this.userService.save(user);

    return finalStagedUser;
  }

  async generateToken({ email, id }: any): Promise<any> {
    let access_token: string | object;
    let refresh_token: string | object;

    access_token = await this.jwtService.signAsync({
      expiresIn: '1d',
    });

    refresh_token = await this.jwtService.signAsync(
      { email },
      { expiresIn: '3d' },
    );

    return { access_token, refresh_token };
  }
}
