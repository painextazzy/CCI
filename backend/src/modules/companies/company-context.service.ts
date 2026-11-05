import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyContextService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async getForUser(userId: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { userId },
    });

    if (!company) {
      throw new ForbiddenException(
        'Ce compte utilisateur n’est associé à aucune entreprise.',
      );
    }

    return company;
  }
}
