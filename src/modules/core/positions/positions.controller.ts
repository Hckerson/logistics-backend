import { PositionsService } from './positions.service';
import { CheckCallsService } from './check-calls.service';
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
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
    CheckCallDto,
    CheckCallResponseDto,
    LoadPositionsDto,
    MapPositionDto,
} from './dto';

@ApiTags('positions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PositionsController {
    constructor(
        private readonly positionsService: PositionsService,
        private readonly checkCalls: CheckCallsService,
    ) {}

    @Get('loads/:loadId/positions')
    @ApiOperation({ summary: 'Latest position, 24 h track, ETA and health' })
    @ApiEnvelope(LoadPositionsDto)
    forLoad(@CurrentUser() user: AuthUser, @Param('loadId') loadId: string) {
        return this.positionsService.forLoad(user, loadId);
    }

    @Post('loads/:loadId/check-calls')
    @ApiOperation({ summary: 'Ask the carrier for a position update' })
    @ApiEnvelope(CheckCallResponseDto, { status: 201 })
    @ApiResponse({ status: 409, description: 'Check call not open' })
    checkCall(
        @CurrentUser() user: AuthUser,
        @Param('loadId') loadId: string,
        @Body() dto: CheckCallDto,
    ) {
        return this.checkCalls.request(user, loadId, dto);
    }

    @Get('positions/latest')
    @ApiOperation({ summary: 'Latest position of every tracked load in scope' })
    @ApiEnvelope(MapPositionDto, { isArray: true })
    latest(@CurrentUser() user: AuthUser) {
        return this.positionsService.latestForMap(user);
    }
}
