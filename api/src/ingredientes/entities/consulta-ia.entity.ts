import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Receita } from '../../receitas/entities/receita.entity';

@Entity('consultas_ia')
export class ConsultaIA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column()
  usuario_id: string;

  @ManyToOne(() => Receita, { nullable: true })
  @JoinColumn({ name: 'receita_id' })
  receita: Receita | null;

  @Column({ nullable: true })
  receita_id: string | null;

  @Column('text')
  pergunta: string; // "Na receita de bolo de chocolate posso trocar chocolate por morango?"

  @Column('text', { nullable: true })
  resposta_ia: string; // Resposta da IA

  @Column('jsonb', { nullable: true })
  substituicao_sugerida: {
    ingrediente_original: string;
    ingrediente_substituto: string;
    quantidade_original: number;
    quantidade_substituto: number;
    unidade: string;
    razao: string; // Por que essa substituição foi sugerida
  } | null;

  @Column({ default: false })
  aplicada: boolean; // Se o usuário aplicou a substituição

  @CreateDateColumn()
  created_at: Date;
}

