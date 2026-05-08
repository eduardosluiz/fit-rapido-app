import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SubscriptionPeriod } from './subscription-period.entity';

@Entity('subscription_discounts')
@Index(['periodo'], { unique: true })
export class SubscriptionDiscount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  periodo: SubscriptionPeriod; // quarterly, semestral, annual

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  desconto_percentual: number; // Ex: 10.00, 15.00, 20.00

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

