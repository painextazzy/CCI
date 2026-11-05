import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Interest } from '../../interests/entities/interest.entity';
import { Message } from './message.entity';

export enum ContractStatus {
  ACCEPTED = 'ACCEPTED',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.ACCEPTED,
  })
  status: ContractStatus;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'numeric', precision: 20, scale: 0 })
  amount: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column()
  senderCompanyName: string;

  @Column()
  senderNif: string;

  @Column()
  senderStat: string;

  @Column()
  senderAddress: string;

  @Column()
  senderRepresentative: string;

  @Column()
  senderRepresentativeRole: string;

  @Column({ type: 'text', nullable: true })
  senderCompanyLogoUrl: string | null;

  @Column()
  receiverCompanyName: string;

  @Column()
  receiverNif: string;

  @Column()
  receiverStat: string;

  @Column()
  receiverAddress: string;

  @Column()
  receiverRepresentative: string;

  @Column()
  receiverRepresentativeRole: string;

  @Column({ type: 'text', nullable: true })
  receiverCompanyLogoUrl: string | null;

  @Column()
  receiverSignerName: string;

  @Column({ type: 'timestamp' })
  acceptedAt: Date;

  @Column({ type: 'bytea', select: false })
  pdfData: Buffer;

  @Column({ type: 'integer', nullable: true })
  pdfVersion: number | null;

  @OneToOne(() => Message, (message) => message.acceptedContract, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'proposal_message_id' })
  proposalMessage: Message;

  @ManyToOne(() => Interest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interest_id' })
  interest: Interest;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'sender_company_id' })
  senderCompany: Company;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'receiver_company_id' })
  receiverCompany: Company;

  @CreateDateColumn()
  createdAt: Date;
}
