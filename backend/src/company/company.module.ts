import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { EmploymentRequest } from './employment-request.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { User } from 'src/user/user.entity';
import { MailService } from 'src/utils/mail.service';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, EmploymentRequest]), // Registramos las entidades
    QueueModule
  ],
  providers: [CompanyService, MailService], // Registramos el servicio
  controllers: [CompanyController], // Registramos el controlador
  exports: [CompanyService], // Exportamos el servicio para que otros módulos puedan usarlo
})
export class CompanyModule {}