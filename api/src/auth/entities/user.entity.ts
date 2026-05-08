import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PERSONAL_TRAINER = 'personal_trainer',
}

export enum SubscriptionTier {
  NONE = 'none', // Sem assinatura (deprecated, usar FREE)
  BASIC = 'basic', // Deprecated - manter para compatibilidade
  FREE = 'free', // Plano gratuito (trial ou após trial)
  PREMIUM = 'premium', // Premium receitas apenas
  PREMIUM_FIT = 'premium_fit', // Premium receitas + treinos
}

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  senha_hash: string;

  @Column()
  nome: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.NONE,
    nullable: true,
  })
  subscription_tier: SubscriptionTier;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ default: false })
  email_verificado: boolean;

  @Column({ nullable: true })
  google_id: string;

  @Column({ nullable: true })
  apple_id: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'subscription_expires_at' })
  subscription_expires_at: Date; // Data de expiração da assinatura atual

  @Column({ type: 'text', nullable: true, name: 'subscription_receipt' })
  subscription_receipt: string; // Último receipt válido

  @Column({ type: 'timestamp', nullable: true, name: 'trial_expires_at' })
  trial_expires_at: Date; // Data de expiração do trial (7 dias após cadastro)

  @Column({ type: 'text', nullable: true, name: 'dieta_atual' })
  dieta_atual: string; // Ex: 'gluten-free', 'vegan', 'keto', etc.

  @Column('text', { array: true, default: [], name: 'alergias' })
  alergias: string[]; // Array de alergias (ex: ['peanut', 'milk', 'eggs'])

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

