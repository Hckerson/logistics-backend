import { PublicTrackingDto } from './dto';
import { PublicTrackingService } from './public-tracking.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Header, Param } from '@nestjs/common';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';
import { PUBLIC_TRACKING_HEADERS } from '@common/enums/tracking';

@ApiTags('tracking')
@Controller('tracking')
export class PublicTrackingController {
    constructor(private readonly tracking: PublicTrackingService) {}

    @Get(':token')
    @Header('Cache-Control', PUBLIC_TRACKING_HEADERS.cacheControl)
    @Header('X-Robots-Tag', PUBLIC_TRACKING_HEADERS.robots)
    @ApiOperation({ summary: 'Public, city-level tracking for a signed token' })
    @ApiEnvelope(PublicTrackingDto)
    @ApiResponse({
        status: 404,
        description: 'Unknown, tampered or revoked token',
    })
    find(@Param('token') token: string) {
        return this.tracking.find(token);
    }
}
