import { Module, forwardRef } from '@nestjs/common';
import { IAService } from './ia.service';
import { IAController } from './ia.controller';
import { ReceitasModule } from '../receitas/receitas.module';

@Module({
  imports: [forwardRef(() => ReceitasModule)],
  controllers: [IAController],
  providers: [IAService],
  exports: [IAService],
})
export class IAModule {}
