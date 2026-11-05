import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { Contract, ContractStatus } from './entities/contract.entity';
import {
  ContractsPdfService,
  formatContractAmount,
} from './contracts-pdf.service';

function createContract(description: string) {
  return Object.assign(new Contract(), {
    reference: 'CCI-2026-AB12CD34',
    status: ContractStatus.ACCEPTED,
    title: 'Fourniture de produits',
    description,
    amount: '5000000',
    startDate: '2026-11-23',
    endDate: '2027-10-10',
    senderCompanyName: 'Entreprise émettrice',
    senderNif: '123456',
    senderStat: '654321',
    senderAddress: 'Antananarivo',
    senderRepresentative: 'Jean Rakoto',
    senderRepresentativeRole: 'Gérant',
    receiverCompanyName: 'Entreprise receveuse',
    receiverNif: '789012',
    receiverStat: '210987',
    receiverAddress: 'Fianarantsoa',
    receiverRepresentative: 'Marie Rabe',
    receiverRepresentativeRole: 'Directrice',
    receiverSignerName: 'Marie Rabe',
    acceptedAt: new Date('2026-10-18T09:30:00.000Z'),
  });
}

describe('ContractsPdfService', () => {
  const service = new ContractsPdfService();

  it('formats grouped prices with commas, not replacement characters', () => {
    expect(formatContractAmount('5000000')).toBe('5,000,000');
  });

  it('generates a readable PDF with contract details', async () => {
    const pdf = await service.generate(createContract('Livraison mensuelle.'));
    const document = await PDFDocument.load(pdf);

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(document.getPageCount()).toBe(1);
    expect(document.getTitle()).toContain('CCI-2026-AB12CD34');
  });

  it('continues long contract descriptions onto additional pages', async () => {
    const longDescription = `${'Conditions de livraison et de paiement. '.repeat(300)}`;
    const pdf = await service.generate(createContract(longDescription));
    const document = await PDFDocument.load(pdf);

    expect(document.getPageCount()).toBeGreaterThan(1);
  });

  it('embeds company logos from their stored Cloudinary URLs', async () => {
    const logo = await readFile(join(__dirname, 'assets', 'cci-logo.png'));
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response(Buffer.from(logo), {
          headers: { 'content-type': 'image/png' },
        }),
    );

    try {
      const contract = Object.assign(createContract('Livraison mensuelle.'), {
        senderCompanyLogoUrl:
          'https://res.cloudinary.com/cci/image/upload/sender.png',
        receiverCompanyLogoUrl:
          'https://res.cloudinary.com/cci/image/upload/receiver.png',
      });
      const pdf = await service.generate(contract);
      const embeddedImages = pdf.toString('latin1').match(/\/Subtype \/Image/g);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0][0]).toBeInstanceOf(URL);
      expect((fetchMock.mock.calls[0][0] as URL).pathname).toContain(
        '/image/upload/f_png/',
      );
      expect(embeddedImages?.length).toBeGreaterThanOrEqual(5);
    } finally {
      fetchMock.mockRestore();
    }
  });
});
