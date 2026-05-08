import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { SupabaseService } from '../common/supabase.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, SupabaseService],
})
export class UploadModule {}
