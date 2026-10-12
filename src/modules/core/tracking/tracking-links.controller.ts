import { ReasonDto } from '@common/dto';
import { TrackingLinkDto } from './dto';
import { TrackingLinksService } from './tracking-links.service';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@core/auth/decorators/current-user.decorator';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '@core/auth/types/auth.types';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

@ApiTags('tracking-links')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TrackingLinksController {
    constructor(private readonly links: TrackingLinksService) {}

    @Get('loads/:loadId/tracking-links')
    @ApiOperation({ summary: 'Tracking links shared for a load' })
    @ApiEnvelope(TrackingLinkDto, { isArray: true })
    list(@CurrentUser() user: AuthUser, @Param('loadId') loadId: string) {
        return this.links.list(user, loadId);
    }

    @Post('loads/:loadId/tracking-links')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Share a tracking link, reusing the active one' })
    @ApiEnvelope(TrackingLinkDto)
    @ApiResponse({ status: 409, description: 'Links closed after delivery' })
    create(
        @CurrentUser() user: AuthUser,
        @Param('loadId') loadId: string,
        @Body() dto: ReasonDto,
    ) {
        return this.links.create(user, loadId, dto);
    }

    @Post('tracking-links/:linkId/revoke')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Revoke a tracking link at once' })
    @ApiEnvelope(TrackingLinkDto)
    revoke(
        @CurrentUser() user: AuthUser,
        @Param('linkId') linkId: string,
        @Body() dto: ReasonDto,
    ) {
        return this.links.revoke(user, linkId, dto);
    }
}
