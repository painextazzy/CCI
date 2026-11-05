import { CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('site_visits')
export class SiteVisit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  visitedAt: Date;
}
