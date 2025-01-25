import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Registramos la entidad User
  providers: [UserService], // Registramos el servicio
  controllers: [UserController], // Registramos el controlador
  exports: [UserService], // Exportamos el servicio para que otros módulos puedan usarlo
})
export class UserModule {}