import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Interest } from './entities/interest.entity';
import { getAllowedFrontendOrigins } from '../../config/cors';

@WebSocketGateway({
  cors: {
    origin: getAllowedFrontendOrigins(),
    credentials: true,
  },
})
export class InterestsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const cookie = client.handshake.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('cci_b2b_token='));
    if (!cookie) {
      client.disconnect(true);
      return;
    }

    let userId: string;
    try {
      const token = decodeURIComponent(
        cookie.slice('cci_b2b_token='.length),
      );
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      userId = payload.sub;
    } catch {
      console.warn('Connexion WebSocket refusée : jeton invalide ou expiré.');
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
    console.log(`Entreprise ${user.company.id} connectée aux notifications.`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client WebSocket déconnecté : ${client.id}`);
  }

  notifyNewInterest(receiverCompanyId: string, interestData: Interest) {
    this.server
      .to(`company_${receiverCompanyId}`)
      .emit('newInterestReceived', interestData);
  }

  notifyStatusUpdate(senderCompanyId: string, updatedInterest: Interest) {
    this.server
      .to(`company_${senderCompanyId}`)
      .emit('interestStatusUpdated', updatedInterest);
  }
}
