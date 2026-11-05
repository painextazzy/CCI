import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';
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

  async suspend(id: string): Promise<void> {
    const user = await this.findById(id);
    if (
      user.role !== UserRole.COMPANY ||
      user.company?.verificationStatus !== VerificationStatus.APPROVED
    ) {
      throw new NotFoundException('Membre introuvable');
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }

  // 👇 NOUVELLE MÉTHODE : réactiver un membre
  async activate(id: string): Promise<void> {
    const user = await this.findById(id);
    if (
      user.role !== UserRole.COMPANY ||
      user.company?.verificationStatus !== VerificationStatus.APPROVED
    ) {
      throw new NotFoundException('Membre introuvable');
    }

    user.isActive = true;
    await this.userRepository.save(user);
  }

  async createAdmin(dto: CreateAdminDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Un compte existe déjà avec cet e-mail.');
    }

    const user = this.userRepository.create({
      email,
      password: await bcrypt.hash(dto.password, 10),
      role: UserRole.ADMIN,
      isActive: true,
    });
    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      isActive: savedUser.isActive,
    };
  }
}
