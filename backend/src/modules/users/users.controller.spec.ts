import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { Company } from '../companies/entities/company.entity';

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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMPANY })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // Relation bidirectionnelle vers Company (nullable car ADMIN / CCI_STAFF n'ont pas d'entreprise)
  @OneToOne(() => Company, (company) => company.user, { nullable: true })
  company?: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}