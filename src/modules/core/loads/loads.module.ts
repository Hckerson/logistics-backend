import { Module } from '@nestjs/common';
import { LoadsService } from './loads.service';
import { LoadsController } from './loads.controller';
import { LoadAccessService } from './load-access.service';
import { LoadTransitionsService } from './load-transitions.service';

@Module({
    controllers: [LoadsController],
    providers: [LoadsService, LoadTransitionsService, LoadAccessService],
    exports: [LoadAccessService],
})
export class LoadsModule {}
