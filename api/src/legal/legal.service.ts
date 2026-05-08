import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consentimento, TipoConsentimento } from './entities/consentimento.entity';
import { CreateConsentimentoDto } from './dto/legal.dto';

@Injectable()
export class LegalService {
  constructor(
    @InjectRepository(Consentimento)
    private consentimentoRepository: Repository<Consentimento>,
  ) {}

  async createConsentimento(usuarioId: string, dto: CreateConsentimentoDto): Promise<Consentimento> {
    const consentimento = this.consentimentoRepository.create({
      usuario_id: usuarioId,
      tipo: dto.tipo,
      aceito: dto.aceito,
      versao: dto.versao || '1.0',
      data_aceite: new Date(),
    });

    return this.consentimentoRepository.save(consentimento);
  }

  async getConsentimentos(usuarioId: string): Promise<Consentimento[]> {
    return this.consentimentoRepository.find({
      where: { usuario_id: usuarioId },
      order: { created_at: 'DESC' },
    });
  }

  async hasConsentimento(usuarioId: string, tipo: TipoConsentimento): Promise<boolean> {
    const consentimento = await this.consentimentoRepository.findOne({
      where: {
        usuario_id: usuarioId,
        tipo,
        aceito: true,
      },
      order: { created_at: 'DESC' },
    });

    return !!consentimento;
  }

  getPrivacyPolicy(): string {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const filePath = path.join(__dirname, 'documents', 'privacy-policy.md');
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
    } catch (error) {
      console.error('Erro ao ler arquivo de política de privacidade:', error);
    }
    
    // Fallback para conteúdo básico se arquivo não existir
    return `# Política de Privacidade - Fit & Rápido\n\n**Última atualização**: ${new Date().toLocaleDateString('pt-BR')}\n\nConsulte a versão completa em: privacidade@fitrapido.com.br`;
  }

  getTermsOfService(): string {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const filePath = path.join(__dirname, 'documents', 'terms-of-service.md');
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
    } catch (error) {
      console.error('Erro ao ler arquivo de termos de uso:', error);
    }
    
    // Fallback para conteúdo básico se arquivo não existir
    return `# Termos de Uso - Fit & Rápido\n\n**Última atualização**: ${new Date().toLocaleDateString('pt-BR')}\n\nConsulte a versão completa em: suporte@fitrapido.com.br`;
  }
}

