import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { LocalAuthGuard } from '../auth/local-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(LocalAuthGuard)
  @Post('update-study-level')
  async updateStudyLevel(@Request() req) {
    return this.userService.updateStudyLevel(req.user.id);
  }

  @UseGuards(LocalAuthGuard)
  @Post('add-daily-money')
  async addDailyMoney(@Request() req) {
    return this.userService.addDailyMoney(req.user.id);
  }
}