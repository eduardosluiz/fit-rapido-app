import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalController } from './legal.controller';
import { LegalService } from './legal.service';
import { Consentimento } from './entities/consentimento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consentimento])],
  controllers: [LegalController],
  providers: [LegalService],
  exports: [LegalService],
})
export class LegalModule {}

