import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { LocalAuthGuard } from '../auth/local-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(LocalAuthGuard)
  @Post('send')
  async sendMessage(@Body('content') content: string, @Request() req) {
    return this.chatService.sendMessage(req.user.id, content);
  }

  @UseGuards(LocalAuthGuard)
  @Get('messages')
  async getLastMessages() {
    return this.chatService.getLastMessages();
  }
}