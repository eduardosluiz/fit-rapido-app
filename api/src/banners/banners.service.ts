import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';

export class UpdateBannersDto {
  banners: {
    id?: string;
    titulo: string;
    subtitulo?: string;
    imagem_url: string;
    acao: string;
    ordem: number;
    ativo: boolean;
  }[];
}

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
  ) {}

  async findAll() {
    return this.bannerRepository.find({
      order: { ordem: 'ASC' }
    });
  }

  async findAllAtivos() {
    return this.bannerRepository.find({
      where: { ativo: true },
      order: { ordem: 'ASC' }
    });
  }

  async bulkUpdate(dto: UpdateBannersDto) {
    // Para simplificar, vamos remover todos os banners existentes e criar os novos.
    // Assim garantimos exatamente os 3 configurados no admin.
    await this.bannerRepository.clear();
    
    const novosBanners = dto.banners.map(b => this.bannerRepository.create(b));
    return this.bannerRepository.save(novosBanners);
  }
}
