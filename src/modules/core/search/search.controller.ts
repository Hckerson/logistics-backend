import { SearchService } from './search.service';
import { QuickFindDto, QuickFindQueryDto } from './dto';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@core/auth/decorators/current-user.decorator';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@core/auth/types/auth.types';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
    constructor(private readonly search: SearchService) {}

    @Get()
    @ApiOperation({
        summary: 'Quick find across loads, facilities and members',
    })
    @ApiEnvelope(QuickFindDto)
    find(@CurrentUser() user: AuthUser, @Query() query: QuickFindQueryDto) {
        return this.search.find(user, query);
    }
}
