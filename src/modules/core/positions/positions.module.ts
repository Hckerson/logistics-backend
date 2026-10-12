import { Module } from '@nestjs/common';
import { LoadsModule } from '@core/loads/loads.module';
import { PositionsService } from './positions.service';
import { CheckCallsService } from './check-calls.service';
import { PositionsController } from './positions.controller';

@Module({
    imports: [LoadsModule],
    controllers: [PositionsController],
    providers: [PositionsService, CheckCallsService],
})
export class PositionsModule {}
