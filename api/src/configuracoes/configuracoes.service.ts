import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracao } from './entities/configuracao.entity';

@Injectable()
export class ConfiguracoesService {
  constructor(
    @InjectRepository(Configuracao)
    private configuracoesRepository: Repository<Configuracao>,
  ) {}

  async getValue(chave: string): Promise<string | null> {
    const config = await this.configuracoesRepository.findOne({ where: { chave } });
    return config ? config.valor : null;
  }

  async setValue(chave: string, valor: string): Promise<Configuracao> {
    let config = await this.configuracoesRepository.findOne({ where: { chave } });
    
    if (config) {
      config.valor = valor;
    } else {
      config = this.configuracoesRepository.create({ chave, valor });
    }
    
    return this.configuracoesRepository.save(config);
  }
}
