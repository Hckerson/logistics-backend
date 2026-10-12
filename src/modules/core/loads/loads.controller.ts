import { LoadsService } from './loads.service';
import { LoadTransitionsService } from './load-transitions.service';
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
    LoadCountDto,
    LoadDto,
    LoadListQueryDto,
    LoadPageDto,
    LoadTransitionDto,
} from './dto';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

@ApiTags('loads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loads')
export class LoadsController {
    constructor(
        private readonly loadsService: LoadsService,
        private readonly transitions: LoadTransitionsService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Loads the caller may see, newest first' })
    @ApiEnvelope(LoadPageDto)
    findAll(@CurrentUser() user: AuthUser, @Query() query: LoadListQueryDto) {
        return this.loadsService.list(user, query);
    }

    @Get('counts')
    @ApiOperation({ summary: 'Load counts per status for the caller' })
    @ApiEnvelope(LoadCountDto, { isArray: true })
    counts(@CurrentUser() user: AuthUser) {
        return this.loadsService.counts(user);
    }

    @Get(':loadId')
    @ApiOperation({ summary: 'One load, shaped for the caller role' })
    @ApiEnvelope(LoadDto)
    @ApiResponse({ status: 404, description: 'Load not found' })
    findOne(@CurrentUser() user: AuthUser, @Param('loadId') loadId: string) {
        return this.loadsService.findOne(user, loadId);
    }

    @Post(':loadId/transitions')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Move a load to its next status' })
    @ApiEnvelope(LoadDto)
    @ApiResponse({ status: 409, description: 'Move not open' })
    @ApiResponse({ status: 412, description: 'Load changed since read' })
    transition(
        @CurrentUser() user: AuthUser,
        @Param('loadId') loadId: string,
        @Body() dto: LoadTransitionDto,
    ) {
        return this.transitions.transition(user, loadId, dto);
    }
}
