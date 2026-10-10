import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST', 'smtp-relay.brevo.com'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendCompanyApprovalEmail(toEmail: string, companyName: string) {
    const sender = this.configService.get<string>('MAIL_FROM');

    try {
      await this.transporter.sendMail({
        from: `"CCI Haute Matsiatra" <${sender}>`,
        to: toEmail,
        subject: 'Validation de votre entreprise',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Félicitations !</h2>
            <p>Votre entreprise <strong>${companyName}</strong> a été approuvée avec succès sur notre plateforme.</p>
            <p>Vous pouvez dès à présent vous connecter et profiter de nos services.</p>
            <br/>
            <p>Cordialement,<br/>L'équipe</p>
          </div>
        `,
      });
      this.logger.log(`E-mail d'approbation envoyé avec succès à ${toEmail}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'e-mail à ${toEmail}`, error);
      throw error;
    }
  }

  async sendCompanyRejectionEmail(toEmail: string, companyName: string, reason: string) {
    const sender = this.configService.get<string>('MAIL_FROM');

    try {
      await this.transporter.sendMail({
        from: `"CCI Haute Matsiatra" <${sender}>`,
        to: toEmail,
        subject: 'Mise à jour concernant votre demande d\'inscription',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Suivi de votre inscription</h2>
            <p>Nous regrettons de vous informer que la demande pour votre entreprise <strong>${companyName}</strong> n'a pas pu être acceptée.</p>
            <p><strong>Motif :</strong> ${reason}</p>
            <br/>
            <p>Cordialement,<br/>L'équipe</p>
          </div>
        `,
      });
      this.logger.log(`E-mail de refus envoyé avec succès à ${toEmail}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'e-mail de refus à ${toEmail}`, error);
      throw error;
    }
  }
}