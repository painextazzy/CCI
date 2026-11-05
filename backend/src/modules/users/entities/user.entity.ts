import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  CCI_STAFF = 'CCI_STAFF',
  COMPANY = 'COMPANY',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password?: string;

  @Column({ type: 'varchar', length: 64, nullable: true, select: false })
  passwordResetOtpHash?: string | null;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  passwordResetOtpExpiresAt?: Date | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMPANY })
  role: UserRole;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date | null;

  // ✅ CORRECTION ICI
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string | null;

  @OneToOne(() => Company, (company) => company.user, {
    cascade: ['insert', 'update'],
  })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
