import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { VerificationStatus } from '../companies/entities/company.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.company', 'company')
      .where('user.role = :role', { role: UserRole.COMPANY })
      .andWhere('company.verificationStatus = :verificationStatus', {
        verificationStatus: VerificationStatus.APPROVED,
      })
      .orderBy('company.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return user;
  }
}