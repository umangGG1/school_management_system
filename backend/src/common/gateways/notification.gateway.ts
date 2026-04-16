import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.FRONTEND_URL ?? true,
    credentials: true,
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  /**
   * Client sends { schoolId, userId } after connecting to join their rooms.
   * Frontend: socket.emit('join', { schoolId: '...', userId: '...' })
   */
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { schoolId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.schoolId) client.join(`school:${data.schoolId}`);
    if (data.userId)   client.join(`user:${data.userId}`);
    return { event: 'joined', data: { schoolId: data.schoolId, userId: data.userId } };
  }

  // ── Emit helpers ──────────────────────────────────────────────────────────

  /** Broadcast to every connected client in a school. */
  emitToSchool(schoolId: string, event: string, payload: unknown) {
    this.server.to(`school:${schoolId}`).emit(event, payload);
  }

  /** Send to a single user (all their open tabs/devices). */
  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
