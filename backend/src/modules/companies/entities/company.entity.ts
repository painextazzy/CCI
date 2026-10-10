import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CompanyType {
  HAUTE_MATSIATRA = 'HAUTE_MATSIATRA',
  OTHER_REGION = 'OTHER_REGION',
  INTERNATIONAL = 'INTERNATIONAL',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('companies')
@Index(['nif'], { unique: true })
@Index(['verificationStatus'])
@Index(['sector'])
@Index(['sector', 'verificationStatus'])
@Index(['createdAt']) // Index pour les tris chronologiques (plus récents / plus anciens)
@Index(['verificationStatus', 'createdAt']) // Index composé pour filtrer par statut ET trier par date
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true }) // Index unique sur la clé étrangère pour accélérer les jointures avec User
  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.company, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: CompanyType })
  companyType: CompanyType;

  @Column()
  companyName: string;

  @Column({ unique: true })
  nif: string;

  @Column()
  stat: string;

  @Column()
  address: string;

  @Column()
  managerName: string;

  @Column()
  managerRole: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  kbisUrl: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column()
  sector: string;

  @Column({ nullable: true })
  sectorOther: string;

  @Column({ type: 'text' })
  needsDescription: string;

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  verificationStatus: VerificationStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ default: false })
  agreedTerms: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}