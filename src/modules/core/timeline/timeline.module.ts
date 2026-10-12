import { Module } from '@nestjs/common';
import { LoadsModule } from '@core/loads/loads.module';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';

@Module({
    imports: [LoadsModule],
    controllers: [TimelineController],
    providers: [TimelineService],
})
export class TimelineModule {}
