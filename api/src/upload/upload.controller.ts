import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage, diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SupabaseService } from '../common/supabase.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('imagem')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './temp-uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `img-temp-${uniqueSuffix}${extname(file.originalname)}`);
        }
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Tipo de arquivo não permitido. Use JPEG, PNG ou WEBP.'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async uploadImagem(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      
      const folder = file.originalname.toLowerCase().includes('modalidade') ? 'modalidades' : 'geral';
      const path = `${folder}/img-${uniqueSuffix}${ext}`;

      // Ler do disco para Buffer para evitar erro de buffer pool/indefinido
      const fileBuffer = fs.readFileSync(file.path);

      const publicUrl = await this.supabaseService.uploadFile(
        'treinos',
        path,
        fileBuffer,
        file.mimetype,
      );

      // Deletar o arquivo temporário
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: publicUrl,
        filename: file.originalname,
      };
    } catch (error: any) {
      // Garantir deleção do temp em caso de erro
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      this.logger.error(`Upload de imagem falhou. Detalhes: ${error.message}`);
      throw new BadRequestException(`Erro no Supabase: ${error.message || 'Erro desconhecido'}`);
    }
  }

  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './temp-uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `temp-${uniqueSuffix}${extname(file.originalname)}`);
        }
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Formato de vídeo não suportado pela API.'), false);
        }
      },
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    try {
      const ext = extname(file.originalname);
      const fileName = `video-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const s3Path = `exercicios/${fileName}`;

      let contentType = file.mimetype;
      if (ext.toLowerCase() === '.mov') {
        contentType = 'video/mp4';
      }

      // Ler do disco para Buffer (minimiza retenção na memória e evita crash do parser)
      const fileBuffer = fs.readFileSync(file.path);

      const publicUrl = await this.supabaseService.uploadFile(
        'treinos',
        s3Path,
        fileBuffer,
        contentType,
      );

      // Deletar o arquivo temporário
      fs.unlinkSync(file.path);

      return {
        url: publicUrl,
        filename: fileName,
        originalName: file.originalname,
        size: file.size,
        mimetype: contentType,
      };
    } catch (error: any) {
      // Garantir deleção do temp em caso de erro
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      this.logger.error(`Upload de vídeo falhou: ${error.message}`);
      throw new BadRequestException(`Falha no armazenamento de vídeo: ${error.message}.`);
    }
  }
}
