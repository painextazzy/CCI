import {
  Ack,
  ConnectedSocket,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { HttpException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Interest } from '../interests/entities/interest.entity';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin:
      process.env.CLIENT_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000',
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessagesGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>,
  ) {}

  publishMessage(
    interestId: string,
    recipientCompanyId: string,
    message: Message,
  ) {
    this.server.to(`interest_${interestId}`).emit('newMessage', message);
    this.server
      .to(`company_${recipientCompanyId}`)
      .emit('newMessageNotification', { interestId, message });
  }

  publishContractAccepted(interestId: string, message: Message) {
    this.server.to(`interest_${interestId}`).emit('contractAccepted', {
      interestId,
      message,
    });
  }

  publishMessageUpdate(
    interestId: string,
    recipientCompanyId: string,
    message: Message,
    notificationMessage: Message,
  ) {
    this.server
      .to(`interest_${interestId}`)
      .to(`company_${recipientCompanyId}`)
      .to(`company_${message.sender.id}`)
      .emit('messageUpdated', {
        interestId,
        message,
        notificationMessage,
      });
  }

  publishMessageDeletion(
    interestId: string,
    recipientCompanyId: string,
    messageId: string,
    notificationMessage: Message,
  ) {
    this.server
      .to(`interest_${interestId}`)
      .to(`company_${recipientCompanyId}`)
      .to(`company_${notificationMessage.sender.id}`)
      .emit('messageDeleted', {
        interestId,
        messageId,
        notificationMessage,
      });
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (typeof token !== 'string' || !token) {
      client.disconnect(true);
      return;
    }

    let userId: string;
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      userId = payload.sub;
    } catch {
      client.disconnect(true);
      return;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { company: true },
    });

    if (!user?.isActive || !user.company) {
      client.disconnect(true);
      return;
    }

    client.data.companyId = user.company.id;
    await client.join(`company_${user.company.id}`);
    await this.publishPresence(user.company.id, true, user.lastLoginAt ?? null);
  }

  async handleDisconnect(client: Socket) {
    const companyId = client.data.companyId;
    if (typeof companyId !== 'string') return;

    const remainingSockets = await this.server
      .in(`company_${companyId}`)
      .fetchSockets();
    if (remainingSockets.length > 0) return;

    const user = await this.userRepository.findOne({
      where: { company: { id: companyId } },
      select: { id: true, lastLoginAt: true },
    });
    await this.publishPresence(companyId, false, user?.lastLoginAt ?? null);
  }

  private async publishPresence(
    companyId: string,
    isOnline: boolean,
    lastLoginAt: Date | null,
  ) {
    const interests = await this.interestRepository.find({
      where: [
        { senderCompany: { id: companyId } },
        { receiverCompany: { id: companyId } },
      ],
      select: { id: true },
    });
    const event = isOnline ? 'companyOnline' : 'companyOffline';
    for (const interest of interests) {
      this.server.to(`interest_${interest.id}`).emit(event, {
        companyId,
        lastLoginAt,
      });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { interestId: string },
    @ConnectedSocket() client: Socket,
    @Ack()
    acknowledge?: (response: {
      ok: boolean;
      partnerCompanyId?: string;
      partnerIsOnline?: boolean;
      partnerLastLoginAt?: Date | null;
      error?: string;
    }) => void,
  ) {
    const companyId = client.data.companyId;
    if (typeof companyId !== 'string' || !data?.interestId) {
      acknowledge?.({ ok: false, error: 'Session ou conversation invalide.' });
      return;
    }

    try {
      await this.messagesService.assertCompanyCanAccessInterest(
        data.interestId,
        companyId,
      );
      await client.join(`interest_${data.interestId}`);
      const interest = await this.interestRepository.findOne({
        where: { id: data.interestId },
        relations: { senderCompany: true, receiverCompany: true },
      });
      if (!interest) {
        acknowledge?.({ ok: false, error: 'Discussion introuvable.' });
        return;
      }
      const partnerCompanyId =
        interest.senderCompany.id === companyId
          ? interest.receiverCompany.id
          : interest.senderCompany.id;
      const partner = await this.userRepository.findOne({
        where: { company: { id: partnerCompanyId } },
        select: { id: true, lastLoginAt: true },
      });
      const partnerSockets = await this.server
        .in(`company_${partnerCompanyId}`)
        .fetchSockets();
      acknowledge?.({
        ok: true,
        partnerCompanyId,
        partnerIsOnline: partnerSockets.length > 0,
        partnerLastLoginAt: partner?.lastLoginAt ?? null,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        acknowledge?.({ ok: false, error: error.message });
        return;
      }
      this.logger.error(
        'Échec de la jonction à une conversation.',
        error instanceof Error ? error.stack : String(error),
      );
      acknowledge?.({
        ok: false,
        error: 'Une erreur est survenue. Veuillez réessayer.',
      });
    }
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @MessageBody() data: { interestId: string },
    @ConnectedSocket() client: Socket,
    @Ack()
    acknowledge?: (response: {
      ok: boolean;
      markedReadCount?: number;
      error?: string;
    }) => void,
  ) {
    const companyId = client.data.companyId;
    if (typeof companyId !== 'string' || !data?.interestId) {
      acknowledge?.({ ok: false, error: 'Session ou conversation invalide.' });
      return;
    }

    try {
      const { markedReadCount, markedMessageIds, senderCompanyId } =
        await this.messagesService.markMessagesRead(data.interestId, companyId);
      if (markedReadCount > 0) {
        this.server.to(`company_${senderCompanyId}`).emit('messagesRead', {
          interestId: data.interestId,
          messageIds: markedMessageIds,
        });
      }
      acknowledge?.({ ok: true, markedReadCount });
    } catch (error) {
      if (error instanceof HttpException) {
        acknowledge?.({ ok: false, error: error.message });
        return;
      }
      this.logger.error(
        'Échec du marquage des messages comme lus.',
        error instanceof Error ? error.stack : String(error),
      );
      acknowledge?.({
        ok: false,
        error: 'Impossible de mettre à jour le statut de lecture.',
      });
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { interestId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`interest_${data.interestId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      interestId: string;
      content: string;
    },
    @ConnectedSocket() client: Socket,
    @Ack()
    acknowledge?: (response: { ok: boolean; error?: string }) => void,
  ) {
    const companyId = client.data.companyId;
    if (
      typeof companyId !== 'string' ||
      !data?.interestId ||
      typeof data.content !== 'string'
    ) {
      acknowledge?.({ ok: false, error: 'Session ou message invalide.' });
      return;
    }

    try {
      const { message, recipientCompanyId } =
        await this.messagesService.createMessage(
          data.interestId,
          companyId,
          data.content,
        );

      this.publishMessage(data.interestId, recipientCompanyId, message);
      acknowledge?.({ ok: true });
    } catch (error) {
      if (error instanceof HttpException) {
        acknowledge?.({ ok: false, error: error.message });
        return;
      }
      this.logger.error(
        'Échec de l’envoi du message.',
        error instanceof Error ? error.stack : String(error),
      );
      acknowledge?.({
        ok: false,
        error: 'Le message n’a pas pu être envoyé. Veuillez réessayer.',
      });
    }
  }
}
