import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notification_history')
export class NotificationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  usuario_id: string; // null = notificação para todos

  @Column()
  titulo: string;

  @Column('text')
  mensagem: string;

  @Column({ nullable: true })
  tipo: string; // 'receita', 'treino', 'geral', etc.

  @Column({ nullable: true })
  item_id: string; // ID do item relacionado (receita ou treino)

  @Column({ default: false })
  lida: boolean;

  @Column({ type: 'json', nullable: true })
  data: any; // Dados adicionais da notificação

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

