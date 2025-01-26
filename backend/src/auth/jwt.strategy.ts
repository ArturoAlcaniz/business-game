import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extrae el token del handshake de WebSocket
        (request: any) => {
          if (request.handshake?.auth?.token) {
            return request.handshake.auth.token;
          }
          return null;
        },
        // Extrae el token del encabezado de autorización (Bearer token)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: 'secretKey', // Asegúrate de usar la misma clave secreta que en el AuthModule
    });
  }

  async validate(payload: any) {
    return this.userService.findOne(payload.username); // Valida el usuario
  }
}