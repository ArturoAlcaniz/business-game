import { Controller, Post, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard) // Ejemplo de endpoint protegido
  @Post('update-study-level')
  async updateStudyLevel(@Request() req) {
    return this.userService.updateStudyLevel(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-daily-money')
  async addDailyMoney(@Request() req) {
    try {
      return await this.userService.addDailyMoney(req.user.id);
    } catch (error) {
      throw new BadRequestException(error.message); // Devuelve un error 400 si ya recibió dinero hoy
    }
  }
}