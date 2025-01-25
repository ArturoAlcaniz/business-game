import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { ChatService } from './chat.service';
  import { UseGuards } from '@nestjs/common';
  import { LocalAuthGuard } from '../auth/local-auth.guard';
  
  @WebSocketGateway({ cors: true })
  export class ChatGateway {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly chatService: ChatService) {}
  
    @UseGuards(LocalAuthGuard)
    @SubscribeMessage('sendMessage')
    async handleMessage(
      @MessageBody() content: string,
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      const userId = client.handshake.headers.userId;
      const message = await this.chatService.sendMessage(Number(userId), content);
  
      // Emitir el nuevo mensaje a todos los usuarios
      this.server.emit('newMessage', message);
  
      // Enviar notificación a todos los usuarios excepto al remitente
      this.server.emit('newNotification', {
        message: `Nuevo mensaje de ${message.user.username}`,
        userId: message.user.id,
      });
    }
  
    @UseGuards(LocalAuthGuard)
    @SubscribeMessage('getMessages')
    async handleGetMessages(@ConnectedSocket() client: Socket): Promise<void> {
      const messages = await this.chatService.getLastMessages();
      client.emit('lastMessages', messages);
    }
  }