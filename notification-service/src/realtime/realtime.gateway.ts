import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { notificationType } from 'src/notification.schema';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ cors: true })
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;
  private clientId: string;

  constructor(private userService: UserService) {}

  async handleConnection(client: Socket, ...args: unknown[]) {
    console.log(`connection stablished`);

    console.log(client.id);
    this.clientId = client.id;

    const userId = client.handshake.auth.userId;
    const socketId = client.id;

    await this.userService.updateSocketId(userId, socketId);
  }

  handleDisconnect(client: Socket) {
    console.log(`connection discount`);
    // console.log(client);
  }

  sendNotification(socketId: string, content: notificationType) {
    try {
      this.server.to([socketId]).emit('notification', content);
    } catch (error) {
      console.log(error);
    }
  }
  get socketId() {
    return this.clientId;
  }
}
