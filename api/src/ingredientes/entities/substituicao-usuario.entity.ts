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
import { Ingrediente } from './ingrediente.entity';

@Entity('substituicoes_usuario')
export class SubstituicaoUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column()
  usuario_id: string;

  @ManyToOne(() => Receita)
  @JoinColumn({ name: 'receita_id' })
  receita: Receita;

  @Column()
  receita_id: string;

  @ManyToOne(() => Ingrediente)
  @JoinColumn({ name: 'ingrediente_original_id' })
  ingrediente_original: Ingrediente;

  @Column()
  ingrediente_original_id: string;

  @ManyToOne(() => Ingrediente)
  @JoinColumn({ name: 'ingrediente_substituto_id' })
  ingrediente_substituto: Ingrediente;

  @Column()
  ingrediente_substituto_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantidade: number;

  @Column({ default: 'g' })
  unidade: string;

  @CreateDateColumn()
  created_at: Date;
}

