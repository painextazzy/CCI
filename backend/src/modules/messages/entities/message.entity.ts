import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Interest } from '../../interests/entities/interest.entity';
import { Contract } from './contract.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
  isSystemNotification: boolean;

  @Column({ type: 'timestamp', nullable: true })
  timelinePositionAt: Date | null;

  @Column({ type: 'text', nullable: true })
  attachmentUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachmentName: string | null;

  @Column({ type: 'varchar', length: 127, nullable: true })
  attachmentMimeType: string | null;

  @ManyToOne(() => Interest, (interest) => interest.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'interest_id' })
  interest: Interest;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: Company;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Contract, (contract) => contract.proposalMessage)
  acceptedContract?: Contract;
}
