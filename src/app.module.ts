import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@core/auth/auth.module';
import { UsersModule } from '@core/users/users.module';
import { StatsModule } from '@core/stats/stats.module';
import { LoadsModule } from '@core/loads/loads.module';
import { HealthModule } from '@core/health/health.module';
import { SearchModule } from '@core/search/search.module';
import { TimelineModule } from '@core/timeline/timeline.module';
import { TrackingModule } from '@core/tracking/tracking.module';
import { PositionsModule } from '@core/positions/positions.module';
import { DocumentsModule } from '@core/documents/documents.module';
import { NotificationsModule } from '@core/notifications/notifications.module';
import { RepoModule } from '@common/repos/repo.module';
import { PrismaModule } from '@common/database/prisma.module';
import { validateEnv } from '@common/config/env.validation';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        PrismaModule,
        RepoModule,
        AuthModule,
        UsersModule,
        HealthModule,
        StatsModule,
        LoadsModule,
        PositionsModule,
        TimelineModule,
        TrackingModule,
        DocumentsModule,
        NotificationsModule,
        SearchModule,
    ],
})
export class AppModule {}
