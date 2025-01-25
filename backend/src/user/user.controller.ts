import { Controller, Post, UseGuards, Request } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard) // Ejemplo de endpoint protegido
  @Post('add-daily-money')
  async addDailyMoney(@Request() req) {
    return this.userService.addDailyMoney(req.user.id);
  }
}