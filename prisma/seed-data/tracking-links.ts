import { randomUUID } from 'node:crypto';
import { Prisma } from '../../generated/prisma/client';
import { dateAgo, dateAgoOrNull } from './clock';
import { SEED_USERS, type UserKey } from './users';

interface LinkSeed {
    load: string;
    by: UserKey;
    ageHours: number;
    revokedHoursAgo?: number;
}

export const TRACKING_LINKS: readonly LinkSeed[] = [
    { load: 'HL-7K2M9QXA', by: 'usr_dispatch', ageHours: 8 },
    { load: 'HL-4MC9RD7K', by: 'usr_dispatch', ageHours: 9 },
    { load: 'HL-2GL4YN7S', by: 'usr_dispatch', ageHours: 60 },
    { load: 'HL-5RT8VK3M', by: 'usr_dispatch', ageHours: 230 },
    {
        load: 'HL-3RW8TNPE',
        by: 'usr_dispatch',
        ageHours: 20,
        revokedHoursAgo: 18,
    },
];

export const trackingLinkInput = (link: LinkSeed, now: number) =>
    ({
        id: randomUUID(),
        loadId: link.load,
        createdById: SEED_USERS[link.by].id,
        createdAt: dateAgo(now, link.ageHours),
        revokedAt: dateAgoOrNull(now, link.revokedHoursAgo),
    }) satisfies Prisma.TrackingLinkCreateManyInput;
