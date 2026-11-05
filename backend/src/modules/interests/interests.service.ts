import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { Interest, InterestStatus } from './entities/interest.entity';
import { Announcement } from '../announcements/entities/announcement.entity';
import { Company } from '../companies/entities/company.entity';
import { Contract, ContractStatus } from '../messages/entities/contract.entity';
import { InterestsGateway } from './interests.gateway';

const interestRelations = {
  senderCompany: { user: true },
  receiverCompany: { user: true },
  announcement: true,
} satisfies FindOptionsRelations<Interest>;

const interestSelect = {
  id: true,
  status: true,
  message: true,
  createdAt: true,
  updatedAt: true,
  senderCompany: {
    id: true,
    companyName: true,
    logoUrl: true,
    sector: true,
    user: { avatarUrl: true, lastLoginAt: true },
  },
  receiverCompany: {
    id: true,
    companyName: true,
    logoUrl: true,
    sector: true,
    user: { avatarUrl: true, lastLoginAt: true },
  },
  announcement: { id: true, title: true, category: true },
} satisfies FindOptionsSelect<Interest>;

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>,
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>, // 👈 Injection indispensable pour valider les relations entreprises
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly interestsGateway: InterestsGateway,
  ) {}

  async expressInterest(
    announcementId: string,
    senderCompanyId: string,
    message?: string,
  ) {
    // 1. Récupérer l'annonce en chargeant explicitement sa relation 'company'
    const announcement = await this.announcementRepository.findOne({
      where: { id: announcementId },
      relations: { company: true },
    });

    if (!announcement) {
      throw new NotFoundException("L'annonce demandée n'existe pas.");
    }

    if (!announcement.company) {
      throw new BadRequestException(
        "Cette annonce n'est rattachée à aucune entreprise.",
      );
    }

    if (announcement.company.id === senderCompanyId) {
      throw new BadRequestException(
        'Vous ne pouvez pas manifester votre intérêt pour votre propre annonce.',
      );
    }

    // 2. Vérifier et récupérer l'entreprise expéditrice
    const senderCompany = await this.companyRepository.findOne({
      where: { id: senderCompanyId },
    });

    if (!senderCompany) {
      throw new NotFoundException("L'entreprise expéditrice est introuvable.");
    }

    const acceptedContract = await this.contractRepository.findOne({
      where: {
        status: ContractStatus.ACCEPTED,
        proposalMessage: {
          interest: { announcement: { id: announcementId } },
        },
      },
    });
    if (acceptedContract) {
      throw new ConflictException(
        'Cette annonce est déjà liée à un contrat.',
      );
    }

    // 3. Vérifier si un intérêt existe déjà pour éviter les doublons
    const existing = await this.interestRepository.findOne({
      where: {
        announcement: { id: announcementId },
        senderCompany: { id: senderCompanyId },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Vous avez déjà manifesté votre intérêt pour cette annonce.',
      );
    }

    // 4. Créer l'entité en lui passant les objets entiers (et non de simples IDs)
    const interest = this.interestRepository.create({
      announcement,
      senderCompany,
      receiverCompany: announcement.company,
      message:
        message || `Intérêt manifesté pour l'annonce : ${announcement.title}`,
      status: InterestStatus.PENDING,
    });

    const savedInterest = await this.interestRepository.save(interest);

    // 5. Recharger l'intérêt avec toutes ses relations pour le WebSocket
    const fullInterest = await this.interestRepository.findOne({
      where: { id: savedInterest.id },
      relations: interestRelations,
      select: interestSelect,
    });

    if (!fullInterest) {
      throw new InternalServerErrorException(
        "La demande d'intérêt a été enregistrée mais n'a pas pu être rechargée.",
      );
    }

    // 📡 Notification Temps Réel WebSocket vers le destinataire
    this.interestsGateway.notifyNewInterest(
      fullInterest.receiverCompany.id,
      fullInterest,
    );

    return fullInterest;
  }

  async getReceivedInterests(companyId: string) {
    return this.interestRepository.find({
      where: { receiverCompany: { id: companyId } },
      relations: interestRelations,
      select: interestSelect,
      order: { createdAt: 'DESC' },
    });
  }

  async getSentInterests(companyId: string) {
    return this.interestRepository.find({
      where: { senderCompany: { id: companyId } },
      relations: interestRelations,
      select: interestSelect,
      order: { createdAt: 'DESC' },
    });
  }

  async respondToInterest(
    interestId: string,
    receiverCompanyId: string,
    action: 'accept' | 'reject',
  ) {
    const interest = await this.interestRepository.findOne({
      where: { id: interestId, receiverCompany: { id: receiverCompanyId } },
      relations: interestRelations,
      select: interestSelect,
    });

    if (!interest) {
      throw new NotFoundException('Demande non trouvée ou accès non autorisé.');
    }

    interest.status =
      action === 'accept' ? InterestStatus.ACCEPTED : InterestStatus.REJECTED;

    const updatedInterest = await this.interestRepository.save(interest);

    // 📡 Notification en temps réel à l'expéditeur de la demande
    this.interestsGateway.notifyStatusUpdate(
      interest.senderCompany.id,
      updatedInterest,
    );

    return updatedInterest;
  }
}
