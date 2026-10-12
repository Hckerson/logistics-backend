import { UserRepo } from './user.repo';
import { LoadRepo } from './load.repo';
import { Global, Module } from '@nestjs/common';
import { DocumentRepo } from './document.repo';
import { FacilityRepo } from './facility.repo';
import { PositionRepo } from './position.repo';
import { LoadEventRepo } from './load-event.repo';
import { NotificationRepo } from './notification.repo';
import { OrganizationRepo } from './organization.repo';
import { TrackingLinkRepo } from './tracking-link.repo';

const repos = [
    UserRepo,
    LoadRepo,
    PositionRepo,
    LoadEventRepo,
    TrackingLinkRepo,
    DocumentRepo,
    NotificationRepo,
    FacilityRepo,
    OrganizationRepo,
];

@Global()
@Module({
    providers: repos,
    exports: repos,
})
export class RepoModule {}
