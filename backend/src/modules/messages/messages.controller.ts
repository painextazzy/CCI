import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import type { Response } from 'express';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesGateway } from './messages.gateway';

const allowedMessageFileTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
]);

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  @Get('unread-count')
  async getUnreadCount(
    @Req() request: Request & { user: { company?: { id: string } | null } },
  ) {
    const companyId = request.user.company?.id;
    if (!companyId) {
      throw new BadRequestException('Entreprise non identifiée.');
    }
    return {
      count: await this.messagesService.getUnreadMessageCount(companyId),
    };
  }

  @Post(':interestId/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!allowedMessageFileTypes.has(file.mimetype)) {
          callback(
            new BadRequestException(
              'Formats acceptés : images JPEG, PNG, WebP, GIF, PDF, Word, Excel, PowerPoint, TXT et CSV.',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadAttachment(
    @Param('interestId') interestId: string,
    @Req() request: Request & { user: { company?: { id: string } | null } },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const companyId = request.user.company?.id;
    if (!companyId) {
      throw new BadRequestException('Entreprise non identifiée.');
    }
    if (!file) {
      throw new BadRequestException('Veuillez sélectionner un fichier.');
    }

    const result = await this.messagesService.createAttachmentMessage(
      interestId,
      companyId,
      file,
    );
    this.messagesGateway.publishMessage(
      interestId,
      result.recipientCompanyId,
      result.message,
    );
    return result.message;
  }

  @Patch(':messageId')
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() body: { content?: unknown },
    @Req() request: Request & { user: { company?: { id: string } | null } },
  ) {
    const companyId = request.user.company?.id;
    if (!companyId) {
      throw new BadRequestException('Entreprise non identifiée.');
    }
    if (typeof body?.content !== 'string') {
      throw new BadRequestException('Le contenu du message est invalide.');
    }

    const result = await this.messagesService.updateMessage(
      messageId,
      companyId,
      body.content,
    );
    this.messagesGateway.publishMessageUpdate(
      result.interestId,
      result.recipientCompanyId,
      result.message,
      result.notificationMessage,
    );
    return {
      message: result.message,
      notificationMessage: result.notificationMessage,
    };
  }

  @Delete(':messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Req() request: Request & { user: { company?: { id: string } | null } },
  ) {
    const companyId = request.user.company?.id;
    if (!companyId) {
      throw new BadRequestException('Entreprise non identifiée.');
    }

    const result = await this.messagesService.deleteMessage(
      messageId,
      companyId,
    );
    this.messagesGateway.publishMessageDeletion(
      result.interestId,
      result.recipientCompanyId,
      messageId,
      result.notificationMessage,
    );
    return { id: messageId, notificationMessage: result.notificationMessage };
  }

  @Post(':messageId/accept')
  async acceptContract(
    @Param('messageId') messageId: string,
    @Body() body: { signerName?: unknown },
    @Req() request: Request & { user: { company?: { id: string } | null } },
  ) {
    const companyId = request.user.company?.id;
    if (!companyId) {
      throw new BadRequestException('Entreprise non identifiée.');
    }

    const result = await this.messagesService.acceptContract(
      messageId,
      companyId,
      body?.signerName,
    );
    this.messagesGateway.publishContractAccepted(
      result.interestId,
      result.message,
    );
    return { contract: result.contract, message: result.message };
  }

  @Get('contracts/:contractId/pdf')
  async getContractPdf(
    @Param('contractId') contractId: string,
    @Req() request: Request & { user: { company?: { id: string } | null } },
    @Res() response: Response,
  ) {
    const companyId = request.user.company?.id;
    if (!companyId) {
      throw new BadRequestException('Entreprise non identifiée.');
    }

    const { reference, pdfData } = await this.messagesService.getContractPdf(
      contractId,
      companyId,
    );
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${reference}.pdf"`,
      'Content-Length': pdfData.length,
      'Cache-Control': 'private, no-store',
    });
    response.send(pdfData);
  }

  @Get('contracts')
  async getContracts(
    @Req() request: Request & { user: { company?: { id: string } | null } },
  ) {
    const companyId = request.user.company?.id;
    if (!companyId) {
      throw new BadRequestException('Entreprise non identifiée.');
    }
    return this.messagesService.getContractsForCompany(companyId);
  }

  @Get(':interestId')
  async getHistory(
    @Param('interestId') interestId: string,
    @Req() request: Request & { user: { company?: { id: string } | null } },
  ) {
    const companyId = request.user.company?.id;
    if (!companyId) {
      throw new BadRequestException('Entreprise non identifiée.');
    }
    return this.messagesService.getMessagesByInterest(interestId, companyId);
  }
}
