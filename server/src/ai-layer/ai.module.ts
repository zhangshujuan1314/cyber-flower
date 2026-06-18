import { Module, Global } from '@nestjs/common';
import { LlmService } from './llm.service';
import { ImageGenService } from './image-gen.service';
import { ContentSafetyService } from './content-safety.service';
import { EmotionEngine } from './emotion-engine';
import { MemoryService } from './memory.service';
import { GreetingService } from './greeting.service';
import { CosService } from '../shared/cos/cos.service';

@Global()
@Module({
  providers: [
    LlmService, ImageGenService, ContentSafetyService,
    EmotionEngine, MemoryService, GreetingService, CosService,
  ],
  exports: [
    LlmService, ImageGenService, ContentSafetyService,
    EmotionEngine, MemoryService, GreetingService, CosService,
  ],
})
export class AiModule {}
