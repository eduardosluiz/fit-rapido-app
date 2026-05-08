import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum TipoConsentimento {
  TERMS = 'terms',
  PRIVACY = 'privacy',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
}

@Entity('consentimentos')
@Index(['usuario_id', 'tipo'])
export class Consentimento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuario_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({
    type: 'enum',
    enum: TipoConsentimento,
  })
  tipo: TipoConsentimento;

  @Column({ default: true })
  aceito: boolean;

  @Column({ type: 'text', nullable: true })
  versao: string; // Versão dos termos aceitos

  @Column({ type: 'timestamp', name: 'data_aceite' })
  data_aceite: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

