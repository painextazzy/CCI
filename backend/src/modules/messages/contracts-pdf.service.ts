import { Injectable, Logger } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  PDFDocument,
  PageSizes,
  StandardFonts,
  rgb,
  type PDFImage,
  type PDFFont,
  type PDFPage,
} from 'pdf-lib';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { Contract } from './entities/contract.entity';

const PAGE_MARGIN = 48;
const BODY_COLOR = rgb(0.12, 0.17, 0.16);
const MUTED_COLOR = rgb(0.39, 0.44, 0.42);
const LINE_COLOR = rgb(0.83, 0.88, 0.85);

export function formatContractAmount(amount: string): string {
  return new Intl.NumberFormat('fr-FR')
    .format(BigInt(amount))
    .replace(/[\s\u00a0\u202f]/g, ',');
}

@Injectable()
export class ContractsPdfService {
  private readonly logger = new Logger(ContractsPdfService.name);

  async generate(contract: Contract): Promise<Buffer> {
    const document = await PDFDocument.create();
    document.setTitle(`${contract.title} - ${contract.reference}`);
    document.setSubject('Contrat de partenariat commercial accepté');
    document.setAuthor('CCI B2B');
    document.setCreationDate(contract.acceptedAt);
    document.setModificationDate(contract.acceptedAt);

    const regular = await document.embedFont(StandardFonts.Helvetica);
    const bold = await document.embedFont(StandardFonts.HelveticaBold);
    const cciLogo = await this.embedImage(
      document,
      await readFile(join(__dirname, 'assets', 'cci-logo.png')),
    );
    const [senderLogo, receiverLogo] = await Promise.all([
      this.embedCompanyLogo(document, contract.senderCompanyLogoUrl),
      this.embedCompanyLogo(document, contract.receiverCompanyLogoUrl),
    ]);
    const contractQrCode = await document.embedPng(
      await QRCode.toBuffer(contract.reference, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 160,
      }),
    );
    const confidentialStampPng = await sharp(
      await readFile(join(__dirname, 'assets', 'confidential-stamp.svg')),
    )
      .png()
      .toBuffer();
    const confidentialStamp = await document.embedPng(confidentialStampPng);
    const pages: PDFPage[] = [];
    let page = this.addPage(document, pages);
    let y = page.getHeight() - PAGE_MARGIN - 8;

    this.drawImage(page, cciLogo, PAGE_MARGIN, y - 40, 66, 48);
    if (senderLogo) {
      this.drawImage(page, senderLogo, PAGE_MARGIN + 84, y - 41, 112, 42);
    }
    if (receiverLogo) {
      this.drawImage(page, receiverLogo, PAGE_MARGIN + 200, y - 41, 112, 42);
    }
    this.drawImage(page, confidentialStamp, PAGE_MARGIN + 350, y - 13, 94, 44);

    y -= 88;
    this.drawCenteredText(
      page,
      bold,
      'CONTRAT DE PARTENARIAT COMMERCIAL /',
      y,
      14,
    );
    y -= 21;
    this.drawCenteredText(page, bold, 'PARTNERSHIP CONTRACT', y, 14);
    y -= 38;
    this.drawCenteredText(page, bold, `N° : ${contract.reference}`, y, 12);
    y -= 46;

    ({ page, y } = this.drawParagraph(
      document,
      pages,
      page,
      regular,
      y,
      `Première partie ${contract.senderCompanyName}, dont le siège social est situé à ${contract.senderAddress}, représentée par ${contract.senderRepresentative}, en sa qualité de ${contract.senderRepresentativeRole}, dûment habilitée à l'effet des présentes.`,
      10,
    ));
    ({ page, y } = this.ensureSpace(document, pages, page, y, 18));
    this.drawRightText(page, bold, "d'une part,", y - 2);
    y -= 33;
    this.drawCenteredText(page, bold, 'et', y, 10);
    y -= 30;
    ({ page, y } = this.drawParagraph(
      document,
      pages,
      page,
      regular,
      y,
      `Deuxième partie ${contract.receiverCompanyName}, dont le siège social est situé à ${contract.receiverAddress}, représentée par ${contract.receiverSignerName}, en sa qualité de ${contract.receiverRepresentativeRole}, dûment habilitée à l'effet des présentes.`,
      10,
    ));
    ({ page, y } = this.ensureSpace(document, pages, page, y, 18));
    this.drawRightText(page, bold, "d'autre part,", y - 2);
    y -= 38;

    ({ page, y } = this.drawParagraph(
      document,
      pages,
      page,
      bold,
      y,
      `Objet du partenariat : ${contract.title}`,
      10,
    ));
    ({ page, y } = this.drawParagraph(
      document,
      pages,
      page,
      regular,
      y - 2,
      contract.description,
      9,
    ));
    ({ page, y } = this.drawParagraph(
      document,
      pages,
      page,
      regular,
      y - 3,
      `Montant convenu : ${this.safeText(formatContractAmount(contract.amount))} Ar. Période : ${this.formatDate(contract.startDate)} au ${this.formatDate(contract.endDate)}.`,
      9,
    ));
    ({ page, y } = this.ensureSpace(document, pages, page, y - 18, 190));
    y -= 18;

    this.drawRightText(
      page,
      regular,
      `Fait le ${this.formatDate(contract.acceptedAt)}.`,
      y,
    );
    y -= 42;
    const signatureWidth = (page.getWidth() - PAGE_MARGIN * 2 - 36) / 2;
    this.drawSignatureBlock(
      page,
      bold,
      PAGE_MARGIN,
      y,
      signatureWidth,
      contract.senderCompanyName,
      contract.senderRepresentative,
    );
    this.drawSignatureBlock(
      page,
      bold,
      PAGE_MARGIN + signatureWidth + 36,
      y,
      signatureWidth,
      contract.receiverCompanyName,
      contract.receiverSignerName,
    );

    for (const [index, currentPage] of pages.entries()) {
      currentPage.drawLine({
        start: { x: PAGE_MARGIN, y: 43 },
        end: { x: currentPage.getWidth() - PAGE_MARGIN, y: 43 },
        thickness: 0.6,
        color: LINE_COLOR,
      });
      currentPage.drawText(
        `${contract.reference}  |  Page ${index + 1}/${pages.length}`,
        {
          x: PAGE_MARGIN,
          y: 17,
          size: 8,
          font: regular,
          color: MUTED_COLOR,
        },
      );
      currentPage.drawText('Scanner pour vérifier le contrat', {
        x: PAGE_MARGIN,
        y: 7,
        size: 7,
        font: regular,
        color: MUTED_COLOR,
      });
      this.drawImage(
        currentPage,
        contractQrCode,
        currentPage.getWidth() - PAGE_MARGIN - 34,
        3,
        34,
        34,
      );
    }

    return Buffer.from(await document.save());
  }

  private addPage(document: PDFDocument, pages: PDFPage[]): PDFPage {
    const page = document.addPage(PageSizes.A4);
    pages.push(page);
    return page;
  }

  private async embedCompanyLogo(
    document: PDFDocument,
    logoUrl: string | null | undefined,
  ): Promise<PDFImage | null> {
    if (!logoUrl) return null;

    try {
      const url = new URL(logoUrl);
      if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com') {
        throw new Error('URL de logo non autorisée.');
      }
      url.pathname = url.pathname.replace(
        /\/image\/upload\//,
        '/image/upload/f_png/',
      );
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5_000),
        redirect: 'error',
      });
      if (!response.ok) {
        throw new Error(
          `Cloudinary a répondu avec le statut ${response.status}.`,
        );
      }
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        throw new Error('Cloudinary n’a pas renvoyé une image.');
      }
      const imageBytes = Buffer.from(await response.arrayBuffer());
      if (imageBytes.length > 4 * 1024 * 1024) {
        throw new Error('Le logo dépasse la taille maximale de 4 Mo.');
      }
      return await this.embedImage(document, imageBytes);
    } catch (error) {
      this.logger.warn(
        `Logo entreprise ignoré (${logoUrl}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private async embedImage(
    document: PDFDocument,
    imageBytes: Uint8Array,
  ): Promise<PDFImage> {
    if (
      imageBytes.length >= 8 &&
      imageBytes[0] === 0x89 &&
      imageBytes[1] === 0x50 &&
      imageBytes[2] === 0x4e &&
      imageBytes[3] === 0x47
    ) {
      return document.embedPng(imageBytes);
    }
    if (
      imageBytes.length >= 3 &&
      imageBytes[0] === 0xff &&
      imageBytes[1] === 0xd8 &&
      imageBytes[2] === 0xff
    ) {
      return document.embedJpg(imageBytes);
    }
    throw new Error('Le format du logo doit être PNG ou JPEG.');
  }

  private drawImage(
    page: PDFPage,
    image: PDFImage,
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number,
  ) {
    const { width, height } = image.scaleToFit(maxWidth, maxHeight);
    page.drawImage(image, {
      x: x + (maxWidth - width) / 2,
      y: y + (maxHeight - height) / 2,
      width,
      height,
    });
  }

  private drawCenteredText(
    page: PDFPage,
    font: PDFFont,
    text: string,
    y: number,
    size: number,
  ) {
    const safeText = this.safeText(text);
    const width = font.widthOfTextAtSize(safeText, size);
    page.drawText(safeText, {
      x: (page.getWidth() - width) / 2,
      y,
      size,
      font,
      color: BODY_COLOR,
    });
  }

  private drawRightText(page: PDFPage, font: PDFFont, text: string, y: number) {
    const size = 9;
    const safeText = this.safeText(text);
    const width = font.widthOfTextAtSize(safeText, size);
    page.drawText(safeText, {
      x: page.getWidth() - PAGE_MARGIN - width,
      y,
      size,
      font,
      color: BODY_COLOR,
    });
  }

  private drawSignatureBlock(
    page: PDFPage,
    bold: PDFFont,
    x: number,
    y: number,
    width: number,
    companyName: string,
    signerName: string,
  ) {
    const centerText = (
      text: string,
      top: number,
      font: PDFFont,
      size: number,
    ) => {
      const safeText = this.safeText(text);
      const textWidth = font.widthOfTextAtSize(safeText, size);
      page.drawText(safeText, {
        x: x + Math.max(0, (width - textWidth) / 2),
        y: top,
        size,
        font,
        color: BODY_COLOR,
        maxWidth: width,
      });
    };

    centerText(companyName, y, bold, 9);
    centerText(signerName, y - 17, bold, 8);
    page.drawLine({
      start: { x: x + 18, y: y - 67 },
      end: { x: x + width - 18, y: y - 67 },
      thickness: 0.7,
      color: MUTED_COLOR,
    });
  }

  private ensureSpace(
    document: PDFDocument,
    pages: PDFPage[],
    page: PDFPage,
    y: number,
    required: number,
  ): { page: PDFPage; y: number } {
    if (y - required >= 48) return { page, y };
    const nextPage = this.addPage(document, pages);
    return { page: nextPage, y: nextPage.getHeight() - PAGE_MARGIN };
  }

  private drawParagraph(
    document: PDFDocument,
    pages: PDFPage[],
    initialPage: PDFPage,
    font: PDFFont,
    initialY: number,
    text: string,
    size = 10,
  ): { page: PDFPage; y: number } {
    text = this.safeText(text);
    const maxWidth = initialPage.getWidth() - PAGE_MARGIN * 2;
    const lineHeight = size + 4;
    const lines: string[] = [];
    for (const paragraph of text.split(/\r?\n/)) {
      let line = '';
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          line = candidate;
          continue;
        }

        if (line) lines.push(line);
        line = '';
        for (const character of word) {
          if (
            line &&
            font.widthOfTextAtSize(line + character, size) > maxWidth
          ) {
            lines.push(line);
            line = character;
          } else {
            line += character;
          }
        }
      }
      lines.push(line);
    }

    let page = initialPage;
    let y = initialY;
    for (const currentLine of lines) {
      ({ page, y } = this.ensureSpace(document, pages, page, y, lineHeight));
      page.drawText(currentLine, {
        x: PAGE_MARGIN,
        y: y - lineHeight,
        size,
        font,
        color: BODY_COLOR,
      });
      y -= lineHeight;
    }
    return { page, y };
  }

  private formatDate(value: string | Date): string {
    const date =
      typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T12:00:00`)
        : new Date(value);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  }

  private safeText(value: string): string {
    const normalized = value
      .normalize('NFC')
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, '-')
      .replace(/…/g, '...')
      .replace(/€/g, 'EUR');
    let result = '';
    for (const character of normalized) {
      result += (character.codePointAt(0) ?? 0) <= 0xff ? character : '?';
    }
    return result;
  }
}
