import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { IsArray, IsString, IsOptional, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BannerItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  subtitulo?: string;

  @IsString()
  imagem_url: string;

  @IsString()
  acao: string;

  @IsNumber()
  ordem: number;

  @IsBoolean()
  ativo: boolean;
}

export class UpdateBannersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BannerItemDto)
  banners: BannerItemDto[];
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
    try {
      // Usar SQL puro para limpar a tabela ignorando verificações complexas do TypeORM
      // DELETE não sofre a restrição de TRUNCATE no Supabase
      await this.bannerRepository.query('DELETE FROM banners');
      
      const novosBanners = dto.banners.map(b => {
        // Remover ID antigo para forçar o banco a gerar um novo UUID limpo no INSERT
        const { id, ...rest } = b;
        return this.bannerRepository.create(rest);
      });
      
      return await this.bannerRepository.save(novosBanners);
    } catch (error: any) {
      this.logger.error(`Erro ao salvar banners: ${error.message}`);
      throw new InternalServerErrorException(`Erro no DB: ${error.message}`);
    }
  }
}
