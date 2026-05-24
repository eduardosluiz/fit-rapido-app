import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Treino } from '../treinos/entities/treino.entity';
import { Receita } from '../receitas/entities/receita.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Treino)
    private treinoRepository: Repository<Treino>,
    @InjectRepository(Receita)
    private receitaRepository: Repository<Receita>,
  ) {}

  async getDashboardStats() {
    const [totalUsers, activeUsers, totalReceitas, totalTreinos] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { ativo: true } }),
      this.receitaRepository.count(),
      this.treinoRepository.count(),
    ]);

    return {
      usuarios_totais: totalUsers,
      usuarios_ativos: activeUsers,
      receitas_totais: totalReceitas,
      treinos_totais: totalTreinos,
    };
  }
}
