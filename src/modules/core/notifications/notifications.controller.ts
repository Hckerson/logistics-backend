import { PageQueryDto } from '@common/dto';
import { NotificationsService } from './notifications.service';
import { NotificationPageDto, UnreadCountDto } from './dto';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@core/auth/decorators/current-user.decorator';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@core/auth/types/auth.types';
import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notifications: NotificationsService) {}

    @Get()
    @ApiOperation({ summary: 'The caller notifications, newest first' })
    @ApiEnvelope(NotificationPageDto)
    list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
        return this.notifications.list(user, query);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Unread notification count for the badge' })
    @ApiEnvelope(UnreadCountDto)
    unreadCount(@CurrentUser() user: AuthUser) {
        return this.notifications.unreadCount(user);
    }

    @Post('read-all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark every notification read' })
    @ApiEnvelope(UnreadCountDto)
    markAllRead(@CurrentUser() user: AuthUser) {
        return this.notifications.markAllRead(user);
    }

    @Post(':notificationId/read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark one notification read' })
    @ApiEnvelope(UnreadCountDto)
    markRead(
        @CurrentUser() user: AuthUser,
        @Param('notificationId') notificationId: string,
    ) {
        return this.notifications.markRead(user, notificationId);
    }
}
