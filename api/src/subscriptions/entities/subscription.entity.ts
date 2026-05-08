import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User, SubscriptionTier } from '../../auth/entities/user.entity';
import { SubscriptionPeriod } from './subscription-period.entity';

export enum SubscriptionStatus {
  ATIVA = 'ativa',
  EXPIRADA = 'expirada',
  CANCELADA = 'cancelada',
}

@Entity('subscriptions')
@Index(['usuario_id', 'status'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
  })
  plano: SubscriptionTier; // free/premium/premium_fit

  @Column({
    type: 'enum',
    enum: SubscriptionPeriod,
    nullable: true,
  })
  periodo: SubscriptionPeriod; // monthly/quarterly/semestral/annual

  @Column({ type: 'timestamp', name: 'data_inicio' })
  data_inicio: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'data_fim' })
  data_fim: Date; // null = assinatura ativa

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ATIVA,
  })
  status: SubscriptionStatus;

  @Column({ type: 'text', nullable: true, name: 'receipt_ios' })
  receipt_ios: string; // Receipt da Apple

  @Column({ type: 'text', nullable: true, name: 'receipt_android' })
  receipt_android: string; // Purchase token do Google

  @Column({ nullable: true, name: 'transaction_id' })
  transaction_id: string; // ID da transação

  @Column({ nullable: true, name: 'original_transaction_id' })
  original_transaction_id: string; // Para renovações

  @Column({ type: 'text', nullable: true })
  plataforma: string; // 'ios' ou 'android'

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

