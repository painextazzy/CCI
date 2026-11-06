import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {}

  private async sendEmail(
    toEmail: string,
    subject: string,
    html: string,
    successMessage: string,
  ): Promise<void> {
    try {
      const apiKey = this.configService.get<string>('MAILJET_API_KEY');
      const apiSecret = this.configService.get<string>('MAILJET_API_SECRET');
      const sender = this.configService.get<string>('MAIL_FROM');

      if (!apiKey || !apiSecret || !sender) {
        throw new Error(
          'MAILJET_API_KEY, MAILJET_API_SECRET et MAIL_FROM doivent être configurés.',
        );
      }

      const response = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Messages: [
            {
              From: { Email: sender, Name: 'CCI Haute Matsiatra' },
              To: [{ Email: toEmail }],
              Subject: subject,
              HTMLPart: html,
            },
          ],
        }),
      });

      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(
          `Erreur API Mailjet (${response.status}): ${responseBody}`,
        );
      }

      this.logger.log(successMessage);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'e-mail à ${toEmail}`, error);
      throw error;
    }
  }

  async sendCompanyApprovalEmail(toEmail: string, companyName: string) {
    await this.sendEmail(
      toEmail,
      'Validation de votre entreprise',
      `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Félicitations !</h2>
            <p>Votre entreprise <strong>${escapeHtml(companyName)}</strong> a été approuvée avec succès sur notre plateforme.</p>
            <p>Vous pouvez dès à présent vous connecter et profiter de nos services.</p>
            <br/>
            <p>Cordialement,<br/>L'équipe</p>
          </div>
        `,
      `E-mail d'approbation envoyé avec succès à ${toEmail}`,
    );
  }

  async sendCompanyRejectionEmail(toEmail: string, companyName: string, reason: string) {
    await this.sendEmail(
      toEmail,
      'Mise à jour concernant votre demande d\'inscription',
      `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Suivi de votre inscription</h2>
            <p>Nous regrettons de vous informer que la demande pour votre entreprise <strong>${escapeHtml(companyName)}</strong> n'a pas pu être acceptée.</p>
            <p><strong>Motif :</strong> ${escapeHtml(reason)}</p>
            <br/>
            <p>Cordialement,<br/>L'équipe</p>
          </div>
        `,
      `E-mail de refus envoyé avec succès à ${toEmail}`,
    );
  }

  async sendPasswordResetOtp(toEmail: string, code: string) {
    await this.sendEmail(
      toEmail,
      'Code de réinitialisation de votre mot de passe',
      `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Voici votre code de confirmation :</p>
            <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">${escapeHtml(code)}</p>
            <p>Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
            <br/>
            <p>Cordialement,<br/>L'équipe CCI Haute Matsiatra</p>
          </div>
        `,
      `E-mail de réinitialisation envoyé à ${toEmail}`,
    );
  }
}