import { TimelineService } from './timeline.service';
import { LoadEventPageDto, TimelineQueryDto } from './dto';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@core/auth/decorators/current-user.decorator';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@core/auth/types/auth.types';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

@ApiTags('timeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loads/:loadId/events')
export class TimelineController {
    constructor(private readonly timelineService: TimelineService) {}

    @Get()
    @ApiOperation({ summary: 'Load timeline, newest first' })
    @ApiEnvelope(LoadEventPageDto)
    list(
        @CurrentUser() user: AuthUser,
        @Param('loadId') loadId: string,
        @Query() query: TimelineQueryDto,
    ) {
        return this.timelineService.list(user, loadId, query);
    }
}
