import { Module } from '@nestjs/common';
import { LoadsModule } from '@core/loads/loads.module';
import { TrackingTokenService } from './tracking-token.service';
import { TrackingLinksService } from './tracking-links.service';
import { PublicTrackingService } from './public-tracking.service';
import { TrackingLinksController } from './tracking-links.controller';
import { PublicTrackingController } from './public-tracking.controller';

@Module({
    imports: [LoadsModule],
    controllers: [TrackingLinksController, PublicTrackingController],
    providers: [
        TrackingTokenService,
        TrackingLinksService,
        PublicTrackingService,
    ],
})
export class TrackingModule {}
