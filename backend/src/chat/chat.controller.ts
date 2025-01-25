import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendMessage(@Body('content') content: string, @Request() req) {
    return this.chatService.sendMessage(req.user.id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages')
  async getLastMessages() {
    return this.chatService.getLastMessages();
  }
}