import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Message } from './entities/message.entity';
import { Interest } from '../interests/entities/interest.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Contract, ContractStatus } from './entities/contract.entity';
import { ContractsPdfService } from './contracts-pdf.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly contractsPdfService: ContractsPdfService,
  ) {}

  async assertCompanyCanAccessInterest(
    interestId: string,
    companyId: string,
  ): Promise<void> {
    const interest = await this.interestRepository.findOne({
      where: { id: interestId },
      relations: { senderCompany: true, receiverCompany: true },
    });

    if (!interest) {
      throw new NotFoundException('Discussion introuvable.');
    }

    if (
      interest.senderCompany?.id !== companyId &&
      interest.receiverCompany?.id !== companyId
    ) {
      throw new UnauthorizedException(
        'Accès non autorisé à cette conversation privée.',
      );
    }
  }

  async getUnreadMessageCount(companyId: string): Promise<number> {
    return this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.interest', 'interest')
      .innerJoin('message.sender', 'sender')
      .where('message.isRead = :isRead', { isRead: false })
      .andWhere('sender.id != :companyId', { companyId })
      .andWhere(
        '(interest.sender_company_id = :companyId OR interest.receiver_company_id = :companyId)',
        { companyId },
      )
      .getCount();
  }

  async markMessagesRead(
    interestId: string,
    companyId: string,
  ): Promise<{
    markedReadCount: number;
    markedMessageIds: string[];
    senderCompanyId: string;
  }> {
    const interest = await this.interestRepository.findOne({
      where: { id: interestId },
      relations: { senderCompany: true, receiverCompany: true },
    });

    if (!interest) {
      throw new NotFoundException('Discussion introuvable.');
    }
    if (
      interest.senderCompany?.id !== companyId &&
      interest.receiverCompany?.id !== companyId
    ) {
      throw new UnauthorizedException(
        'Accès non autorisé à cette conversation privée.',
      );
    }

    const result = await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('interest_id = :interestId', { interestId })
      .andWhere('sender_id != :companyId', { companyId })
      .andWhere('is_read = false')
      .returning('id')
      .execute();

    return {
      markedReadCount: result.affected ?? 0,
      markedMessageIds: (result.raw as { id: string }[]).map(({ id }) => id),
      senderCompanyId:
        interest.senderCompany.id === companyId
          ? interest.receiverCompany.id
          : interest.senderCompany.id,
    };
  }

  async getMessagesByInterest(
    interestId: string,
    companyId: string,
  ): Promise<Message[]> {
    const interest = await this.interestRepository.findOne({
      where: { id: interestId },
      relations: { senderCompany: true, receiverCompany: true },
    });

    if (!interest) {
      throw new NotFoundException('Discussion introuvable.');
    }

    const senderCompanyId = interest.senderCompany?.id;
    const receiverCompanyId = interest.receiverCompany?.id;

    if (senderCompanyId !== companyId && receiverCompanyId !== companyId) {
      throw new UnauthorizedException(
        'Accès non autorisé à cette conversation privée.',
      );
    }

    const messages = await this.messageRepository.find({
      where: { interest: { id: interestId } },
      relations: { sender: true, acceptedContract: true },
      select: {
        id: true,
        content: true,
        isRead: true,
        isSystemNotification: true,
        timelinePositionAt: true,
        createdAt: true,
        acceptedContract: {
          id: true,
          reference: true,
          status: true,
          acceptedAt: true,
          receiverSignerName: true,
        },
        attachmentUrl: true,
        attachmentName: true,
        attachmentMimeType: true,
        sender: { id: true, companyName: true, logoUrl: true },
      },
    });
    return messages.sort(
      (left, right) =>
        (left.timelinePositionAt?.getTime() ?? left.createdAt.getTime()) -
          (right.timelinePositionAt?.getTime() ?? right.createdAt.getTime()) ||
        left.createdAt.getTime() - right.createdAt.getTime(),
    );
  }

  async updateMessage(
    messageId: string,
    companyId: string,
    content: string,
  ): Promise<{
    message: Message;
    notificationMessage: Message;
    interestId: string;
    recipientCompanyId: string;
  }> {
    if (!content?.trim()) {
      throw new BadRequestException('Le message ne peut pas être vide.');
    }
    if (content.length > 10_000) {
      throw new BadRequestException(
        'Le message ne peut pas dépasser 10 000 caractères.',
      );
    }

    const message = await this.getOwnedMessage(messageId, companyId);
    if (message.acceptedContract) {
      throw new BadRequestException(
        'Une proposition acceptée ne peut plus être modifiée.',
      );
    }
    if (message.attachmentUrl) {
      throw new BadRequestException(
        'Les pièces jointes ne peuvent pas être modifiées.',
      );
    }

    message.content = content.trim();
    const notificationMessage =
      await this.messageRepository.manager.transaction(async (manager) => {
        const lockedMessage = await manager.findOne(Message, {
          where: { id: messageId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!lockedMessage) {
          throw new NotFoundException('Message introuvable.');
        }
        const acceptedContract = await manager
          .getRepository(Contract)
          .findOne({ where: { proposalMessage: { id: messageId } } });
        if (acceptedContract) {
          throw new BadRequestException(
            'Une proposition acceptée ne peut plus être modifiée.',
          );
        }
        await manager.save(Message, message);
        return manager.save(
          Message,
          manager.create(Message, {
            content: `Message modifié par ${message.sender.companyName}.`,
            isRead: true,
            isSystemNotification: true,
            interest: { id: message.interest.id },
            sender: { id: companyId },
          }),
        );
      });

    const updatedMessage = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: { sender: true },
      select: {
        id: true,
        content: true,
        isRead: true,
        isSystemNotification: true,
        createdAt: true,
        attachmentUrl: true,
        attachmentName: true,
        attachmentMimeType: true,
        sender: { id: true, companyName: true, logoUrl: true },
      },
    });
    if (!updatedMessage) {
      throw new NotFoundException(
        'Le message a été modifié mais ne peut pas être rechargé.',
      );
    }

    const interest = message.interest;
    return {
      message: updatedMessage,
      notificationMessage,
      interestId: interest.id,
      recipientCompanyId:
        interest.senderCompany.id === companyId
          ? interest.receiverCompany.id
          : interest.senderCompany.id,
    };
  }

  async deleteMessage(
    messageId: string,
    companyId: string,
  ): Promise<{
    interestId: string;
    recipientCompanyId: string;
    notificationMessage: Message;
  }> {
    const message = await this.getOwnedMessage(messageId, companyId);
    const interest = message.interest;
    if (message.acceptedContract) {
      throw new BadRequestException(
        'Une proposition acceptée ne peut pas être supprimée.',
      );
    }

    const notificationMessage =
      await this.messageRepository.manager.transaction(async (manager) => {
        const lockedMessage = await manager.findOne(Message, {
          where: { id: messageId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!lockedMessage) {
          throw new NotFoundException('Message introuvable.');
        }
        const acceptedContract = await manager
          .getRepository(Contract)
          .findOne({ where: { proposalMessage: { id: messageId } } });
        if (acceptedContract) {
          throw new BadRequestException(
            'Une proposition acceptée ne peut pas être supprimée.',
          );
        }
        await manager.remove(Message, message);
        return manager.save(
          Message,
          manager.create(Message, {
            content: `Message supprimé par ${message.sender.companyName}.`,
            isRead: true,
            isSystemNotification: true,
            timelinePositionAt: message.createdAt,
            interest: { id: interest.id },
            sender: { id: companyId },
          }),
        );
      });

    return {
      interestId: interest.id,
      recipientCompanyId:
        interest.senderCompany.id === companyId
          ? interest.receiverCompany.id
          : interest.senderCompany.id,
      notificationMessage,
    };
  }

  private async getOwnedMessage(
    messageId: string,
    companyId: string,
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: {
        sender: true,
        interest: { senderCompany: true, receiverCompany: true },
        acceptedContract: true,
      },
    });
    if (!message) {
      throw new NotFoundException('Message introuvable.');
    }
    if (message.sender.id !== companyId) {
      throw new UnauthorizedException(
        'Vous ne pouvez modifier ou supprimer que vos propres messages.',
      );
    }
    if (message.isSystemNotification) {
      throw new BadRequestException(
        'Les notifications système ne peuvent pas être modifiées ou supprimées.',
      );
    }
    return message;
  }

  async acceptContract(
    messageId: string,
    receiverCompanyId: string,
    signerNameInput: unknown,
  ): Promise<{
    contract: Pick<
      Contract,
      'id' | 'reference' | 'status' | 'acceptedAt' | 'receiverSignerName'
    >;
    message: Message;
    interestId: string;
    senderCompanyId: string;
    receiverCompanyId: string;
  }> {
    const signerName =
      typeof signerNameInput === 'string' ? signerNameInput.trim() : '';
    if (!signerName || signerName.length > 120) {
      throw new BadRequestException(
        'Le nom du représentant doit comporter entre 1 et 120 caractères.',
      );
    }

    return this.messageRepository.manager.transaction(async (manager) => {
      const lockedMessage = await manager.findOne(Message, {
        where: { id: messageId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!lockedMessage) {
        throw new NotFoundException('Proposition introuvable.');
      }

      const message = await manager.findOne(Message, {
        where: { id: messageId },
        relations: {
          sender: true,
          interest: { senderCompany: true, receiverCompany: true },
          acceptedContract: true,
        },
      });
      if (!message) {
        throw new NotFoundException('Proposition introuvable.');
      }

      const interest = message.interest;
      const sender = message.sender;
      const receiver =
        interest.senderCompany?.id === sender.id
          ? interest.receiverCompany
          : interest.senderCompany;
      if (
        !receiver ||
        sender.id === receiverCompanyId ||
        receiver.id !== receiverCompanyId
      ) {
        throw new ForbiddenException(
          'Seule l’entreprise destinataire peut accepter cette proposition.',
        );
      }

      if (message.acceptedContract) {
        return {
          contract: {
            id: message.acceptedContract.id,
            reference: message.acceptedContract.reference,
            status: message.acceptedContract.status,
            acceptedAt: message.acceptedContract.acceptedAt,
            receiverSignerName: message.acceptedContract.receiverSignerName,
          },
          message,
          interestId: interest.id,
          senderCompanyId: interest.senderCompany.id,
          receiverCompanyId: interest.receiverCompany.id,
        };
      }

      const proposal = this.parseContractProposal(message.content);
      const acceptedAt = new Date();
      const contract = manager.getRepository(Contract).create({
        reference: `CCI-${acceptedAt.getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        status: ContractStatus.ACCEPTED,
        ...proposal,
        senderCompanyName: sender.companyName,
        senderNif: sender.nif,
        senderStat: sender.stat,
        senderAddress: sender.address,
        senderRepresentative: sender.managerName,
        senderRepresentativeRole: sender.managerRole,
        senderCompanyLogoUrl: sender.logoUrl,
        receiverCompanyName: receiver.companyName,
        receiverNif: receiver.nif,
        receiverStat: receiver.stat,
        receiverAddress: receiver.address,
        receiverRepresentative: receiver.managerName,
        receiverRepresentativeRole: receiver.managerRole,
        receiverCompanyLogoUrl: receiver.logoUrl,
        receiverSignerName: signerName,
        acceptedAt,
        proposalMessage: { id: message.id },
        interest: { id: interest.id },
        senderCompany: { id: sender.id },
        receiverCompany: { id: receiver.id },
        pdfData: Buffer.alloc(0),
        pdfVersion: 5,
      });
      contract.pdfData = await this.contractsPdfService.generate(contract);
      const savedContract = await manager.save(Contract, contract);

      const updatedMessage = await manager.findOne(Message, {
        where: { id: messageId },
        relations: { sender: true, acceptedContract: true },
      });
      if (!updatedMessage) {
        throw new InternalServerErrorException(
          'Le contrat a été créé mais la proposition ne peut pas être rechargée.',
        );
      }

      return {
        contract: {
          id: savedContract.id,
          reference: savedContract.reference,
          status: savedContract.status,
          acceptedAt: savedContract.acceptedAt,
          receiverSignerName: savedContract.receiverSignerName,
        },
        message: updatedMessage,
        interestId: interest.id,
        senderCompanyId: sender.id,
        receiverCompanyId: receiver.id,
      };
    });
  }

  async getContractPdf(
    contractId: string,
    companyId: string,
  ): Promise<{ reference: string; pdfData: Buffer }> {
    const contract = await this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.senderCompany', 'senderCompany')
      .leftJoinAndSelect('contract.receiverCompany', 'receiverCompany')
      .addSelect('contract.pdfData')
      .where('contract.id = :contractId', { contractId })
      .getOne();

    if (!contract) {
      throw new NotFoundException('Contrat introuvable.');
    }
    if (
      contract.senderCompany?.id !== companyId &&
      contract.receiverCompany?.id !== companyId
    ) {
      throw new UnauthorizedException(
        'Vous ne pouvez pas télécharger le contrat d’une autre entreprise.',
      );
    }
    if (contract.pdfVersion !== 5) {
      contract.senderCompanyLogoUrl =
        contract.senderCompanyLogoUrl ??
        contract.senderCompany?.logoUrl ??
        null;
      contract.receiverCompanyLogoUrl =
        contract.receiverCompanyLogoUrl ??
        contract.receiverCompany?.logoUrl ??
        null;
      contract.pdfData = await this.contractsPdfService.generate(contract);
      contract.pdfVersion = 5;
      await this.contractRepository.save(contract);
    }
    if (!contract.pdfData?.length) {
      throw new InternalServerErrorException(
        'Le document du contrat est indisponible.',
      );
    }
    return { reference: contract.reference, pdfData: contract.pdfData };
  }

  async getContractsForCompany(companyId: string) {
    const contracts = await this.contractRepository.find({
      where: [
        { senderCompany: { id: companyId } },
        { receiverCompany: { id: companyId } },
      ],
      relations: { senderCompany: true, receiverCompany: true },
      select: {
        id: true,
        reference: true,
        status: true,
        title: true,
        description: true,
        amount: true,
        startDate: true,
        endDate: true,
        senderCompanyName: true,
        senderRepresentative: true,
        receiverCompanyName: true,
        receiverSignerName: true,
        acceptedAt: true,
        createdAt: true,
        senderCompany: {
          id: true,
          companyName: true,
          logoUrl: true,
          sector: true,
          sectorOther: true,
          companyType: true,
          address: true,
          phone: true,
          website: true,
          user: { avatarUrl: true },
        },
        receiverCompany: {
          id: true,
          companyName: true,
          logoUrl: true,
          sector: true,
          sectorOther: true,
          companyType: true,
          address: true,
          phone: true,
          website: true,
          user: { avatarUrl: true },
        },
        senderCompanyLogoUrl: true,
        receiverCompanyLogoUrl: true,
      },
      order: { acceptedAt: 'DESC' },
    });

    return contracts.map((contract) => ({
      id: contract.id,
      reference: contract.reference,
      status: contract.status,
      title: contract.title,
      description: contract.description,
      amount: contract.amount,
      startDate: contract.startDate,
      endDate: contract.endDate,
      senderCompanyName: contract.senderCompanyName,
      senderCompanyLogoUrl:
        contract.senderCompanyLogoUrl ?? contract.senderCompany.logoUrl ?? null,
      senderCompany: {
        id: contract.senderCompany.id,
        name: contract.senderCompany.companyName,
        logoUrl: contract.senderCompany.logoUrl,
        avatarUrl: contract.senderCompany.user?.avatarUrl ?? null,
        sector:
          contract.senderCompany.sector === 'AUTRE'
            ? (contract.senderCompany.sectorOther ?? 'Autre secteur')
            : contract.senderCompany.sector,
        companyType: contract.senderCompany.companyType,
        address: contract.senderCompany.address,
        phone: contract.senderCompany.phone,
        website: contract.senderCompany.website,
      },
      senderRepresentative: contract.senderRepresentative,
      receiverCompanyName: contract.receiverCompanyName,
      receiverCompanyLogoUrl:
        contract.receiverCompanyLogoUrl ??
        contract.receiverCompany.logoUrl ??
        null,
      receiverCompany: {
        id: contract.receiverCompany.id,
        name: contract.receiverCompany.companyName,
        logoUrl: contract.receiverCompany.logoUrl,
        avatarUrl: contract.receiverCompany.user?.avatarUrl ?? null,
        sector:
          contract.receiverCompany.sector === 'AUTRE'
            ? (contract.receiverCompany.sectorOther ?? 'Autre secteur')
            : contract.receiverCompany.sector,
        companyType: contract.receiverCompany.companyType,
        address: contract.receiverCompany.address,
        phone: contract.receiverCompany.phone,
        website: contract.receiverCompany.website,
      },
      receiverSignerName: contract.receiverSignerName,
      senderCompanyId: contract.senderCompany.id,
      receiverCompanyId: contract.receiverCompany.id,
      acceptedAt: contract.acceptedAt,
      createdAt: contract.createdAt,
    }));
  }

  private parseContractProposal(content: string): {
    title: string;
    description: string;
    amount: string;
    startDate: string;
    endDate: string;
  } {
    const lines = content.split('\n');
    const title = lines
      .find((line) => line.startsWith('Proposition de contrat : '))
      ?.slice('Proposition de contrat : '.length)
      .trim();
    const encodedDescription = lines
      .find((line) => line.startsWith('Description encodée : '))
      ?.slice('Description encodée : '.length);
    const plainDescription = lines
      .find((line) => line.startsWith('Description : '))
      ?.slice('Description : '.length);
    let description = plainDescription;
    if (encodedDescription !== undefined) {
      try {
        description = decodeURIComponent(encodedDescription);
      } catch {
        throw new BadRequestException(
          'La description de la proposition est invalide.',
        );
      }
    }
    const rawAmount = lines
      .find((line) => line.startsWith('Montant : '))
      ?.slice('Montant : '.length);
    const amount = rawAmount?.replace(/[^\d]/g, '');
    const period = lines
      .find((line) => line.startsWith('Période : '))
      ?.slice('Période : '.length)
      .split(' au ');
    const validDate = (value: string | undefined) => {
      if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
      );
    };

    if (
      !title ||
      title.length > 255 ||
      !description?.trim() ||
      description.length > 10_000 ||
      !amount ||
      amount.length > 20 ||
      BigInt(amount) <= 0n ||
      !period ||
      period.length !== 2 ||
      !validDate(period[0]) ||
      !validDate(period[1]) ||
      period[0] > period[1]
    ) {
      throw new BadRequestException(
        'Les informations de la proposition de contrat sont invalides.',
      );
    }
    return {
      title,
      description: description.trim(),
      amount,
      startDate: period[0],
      endDate: period[1],
    };
  }

  async createMessage(
    interestId: string,
    senderCompanyId: string,
    content: string,
  ): Promise<{ message: Message; recipientCompanyId: string }> {
    if (!content?.trim()) {
      throw new BadRequestException('Le message ne peut pas être vide.');
    }
    if (content.length > 10_000) {
      throw new BadRequestException(
        'Le message ne peut pas dépasser 10 000 caractères.',
      );
    }

    const interest = await this.interestRepository.findOne({
      where: { id: interestId },
      relations: { senderCompany: true, receiverCompany: true },
    });

    if (!interest) {
      throw new NotFoundException('Discussion introuvable.');
    }

    if (
      interest.senderCompany?.id !== senderCompanyId &&
      interest.receiverCompany?.id !== senderCompanyId
    ) {
      throw new UnauthorizedException(
        'Vous ne pouvez pas envoyer de message dans cette conversation.',
      );
    }
    const recipientCompanyId =
      interest.senderCompany.id === senderCompanyId
        ? interest.receiverCompany.id
        : interest.senderCompany.id;

    const newMessage = this.messageRepository.create({
      content: content.trim(),
      interest,
      sender: { id: senderCompanyId },
    });

    const saved = await this.messageRepository.save(newMessage);

    const message = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: { sender: true },
      select: {
        id: true,
        content: true,
        isRead: true,
        createdAt: true,
        attachmentUrl: true,
        attachmentName: true,
        attachmentMimeType: true,
        sender: { id: true, companyName: true, logoUrl: true },
      },
    });

    if (!message) {
      throw new NotFoundException(
        'Le message a été enregistré mais ne peut pas être rechargé.',
      );
    }

    return { message, recipientCompanyId };
  }

  async createAttachmentMessage(
    interestId: string,
    senderCompanyId: string,
    file: Express.Multer.File,
  ): Promise<{ message: Message; recipientCompanyId: string }> {
    if (!file?.buffer) {
      throw new BadRequestException('Veuillez sélectionner un fichier.');
    }

    const interest = await this.interestRepository.findOne({
      where: { id: interestId },
      relations: { senderCompany: true, receiverCompany: true },
    });
    if (!interest) {
      throw new NotFoundException('Discussion introuvable.');
    }
    if (
      interest.senderCompany?.id !== senderCompanyId &&
      interest.receiverCompany?.id !== senderCompanyId
    ) {
      throw new UnauthorizedException(
        'Vous ne pouvez pas envoyer de fichier dans cette conversation.',
      );
    }

    const recipientCompanyId =
      interest.senderCompany.id === senderCompanyId
        ? interest.receiverCompany.id
        : interest.senderCompany.id;

    let uploaded;
    try {
      uploaded = await this.cloudinaryService.uploadFile(
        file,
        `cci_messages/${interestId}`,
      );
    } catch (error) {
      this.logger.error(
        'Échec de l’upload Cloudinary.',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Le fichier n’a pas pu être envoyé. Vérifiez votre fichier et réessayez.',
      );
    }

    const saved = await this.messageRepository.save(
      this.messageRepository.create({
        content: file.originalname,
        attachmentUrl: uploaded.secure_url,
        attachmentName: file.originalname,
        attachmentMimeType: file.mimetype,
        interest,
        sender: { id: senderCompanyId },
      }),
    );

    const message = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: { sender: true },
      select: {
        id: true,
        content: true,
        isRead: true,
        createdAt: true,
        attachmentUrl: true,
        attachmentName: true,
        attachmentMimeType: true,
        sender: { id: true, companyName: true, logoUrl: true },
      },
    });
    if (!message) {
      throw new InternalServerErrorException(
        'Le fichier a été envoyé mais le message n’a pas pu être chargé.',
      );
    }
    return { message, recipientCompanyId };
  }
}
