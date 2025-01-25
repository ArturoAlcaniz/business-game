import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis'; // Importa createClient
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server; // Asegúrate de que el servidor esté inicializado

  private pubClient: ReturnType<typeof createClient>; // Cambia el tipo
  private subClient: ReturnType<typeof createClient>; // Cambia el tipo

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {
    // Configura los clientes de Redis
    this.pubClient = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` }); // Usa createClient
    this.subClient = this.pubClient.duplicate();

    // Conecta los clientes de Redis
    this.pubClient.connect();
    this.subClient.connect();

    // Configura el adaptador de Redis después de que el servidor esté inicializado
    this.server?.adapter(createAdapter(this.pubClient, this.subClient));
  }

  afterInit() {
    // Asegúrate de que el adaptador se configure después de que el servidor esté listo
    this.server.adapter(createAdapter(this.pubClient, this.subClient));
  }

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

  @UseGuards(AuthGuard('jwt'))
  @SubscribeMessage('sendMessage')
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

  @UseGuards(AuthGuard('jwt'))
  @SubscribeMessage('getMessages')
  async handleGetMessages(@ConnectedSocket() client: Socket): Promise<void> {
    const messages = await this.chatService.getLastMessages();
    client.emit('lastMessages', messages);
  }
}