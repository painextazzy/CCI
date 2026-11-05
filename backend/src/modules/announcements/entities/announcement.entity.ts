// src/announcements/entities/announcement.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';

export enum AnnouncementType {
  OFFRE = 'OFFRE',
  DEMANDE = 'DEMANDE',
}

export enum AnnouncementStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
}

@Entity('announcements')
@Index('idx_announcements_feed', ['status', 'type', 'createdAt'])
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AnnouncementType })
  type: AnnouncementType;

  @Column()
  title: string;

  @Column()
  category: string;

  @Column('text')
  description: string;

  @Column({ name: 'specific_location', nullable: true })
  specificLocation: string;

  @Column({
    type: 'enum',
    enum: AnnouncementStatus,
    default: AnnouncementStatus.OPEN,
  })
  status: AnnouncementStatus;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  // Relation Company (TypeORM se charge de créer la colonne company_id en base)
  @ManyToOne(() => Company, (company) => company.announcements, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // Relation User (Optionnel, pour savoir quel utilisateur précis a cliqué)
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: User;

  isContracted?: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}