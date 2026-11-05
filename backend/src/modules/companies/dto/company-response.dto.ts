export class CompanyResponseDto {
  id: string;
  companyName: string;
  companyType: string;
  nif: string;
  stat: string;
  managerName: string;
  phone: string;
  createdAt: string;
  verificationStatus: string;
  kbisUrl?: string;
  rejectionReason?: string;
}