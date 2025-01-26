import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };

    const today = new Date();

    if (user.lastLoginDate && String(user.lastLoginDate) === new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toISOString().split('T')[0]) {
      // Si se conectó ayer, incrementa el contador
      user.consecutiveLoginDays += 1;
    } else if (!user.lastLoginDate || (user.lastLoginDate && String(user.lastLoginDate) !== new Date().toISOString().split('T')[0])) {
      // Si no se conectó ayer ni hoy, reinicia el contador
      user.consecutiveLoginDays = 1;
    }

    // Guarda los cambios en la base de datos
    await this.userService.updateUser(user.id, {
      consecutiveLoginDays: user.consecutiveLoginDays,
      lastLoginDate: new Date(),
    });
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: User): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    return this.userService.create(user);
  }

  decode(token: any) {
    return this.jwtService.verify(token, { secret: 'secretKey' }); // Asegúrate de usar la misma clave secreta
  }
}