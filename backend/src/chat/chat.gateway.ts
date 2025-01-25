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
  import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
  
  @WebSocketGateway({ cors: true })
  export class ChatGateway {
    
    @WebSocketServer()
    server: Server;
  
    constructor(
        private readonly chatService: ChatService,
        private readonly authService: AuthService,
    ) {}
    
    handleConnection(client: Socket) {
        const token = client.handshake.auth.token; // Obtén el token de autenticación
        if (!token) {
          client.disconnect(true); // Desconecta al cliente si no hay token
          return;
        }
    
        try {
          const payload = this.authService.decode(token); // Decodifica el token
          client.data.user = payload; // Almacena el payload en client.data
        } catch (error) {
          client.disconnect(true); // Desconecta al cliente si el token es inválido
        }
    }

    @UseGuards(AuthGuard("jwt")) // Ejemplo de endpoint protegido
    @SubscribeMessage("sendMessage")
    async handleMessage(
        @MessageBody() content: string,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const payload = client.data.user; // Asumiendo que el payload del token se almacena aquí

        const username = payload.username; // O el campo donde esté el userId
    
        const message = await this.chatService.sendMessage(username, content);
    
        // Emitir el nuevo mensaje a todos los usuarios
        this.server.emit('newMessage', message);
    
        // Enviar notificación a todos los usuarios excepto el remitente
        this.server.emit('newNotification', {
            message: `Nuevo mensaje de ${message.user.username}`,
            userId: message.user.id,
        });
    }
  
    @UseGuards(AuthGuard('jwt')) // Ejemplo de endpoint protegido
    @SubscribeMessage('getMessages')
    async handleGetMessages(@ConnectedSocket() client: Socket): Promise<void> {
      const messages = await this.chatService.getLastMessages();
      client.emit('lastMessages', messages);
    }
  }