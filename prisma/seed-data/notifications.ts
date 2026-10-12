import { NotificationEvent, Prisma } from '../../generated/prisma/client';
import { dateAgo } from './clock';
import { SEED_USERS, type UserKey } from './users';

interface NotificationSeed {
    user: UserKey;
    event: NotificationEvent;
    load: string;
    ageHours: number;
    read: boolean;
}

export const NOTIFICATIONS: readonly NotificationSeed[] = [
    {
        user: 'usr_dispatch',
        event: NotificationEvent.trackingStale,
        load: 'HL-9DQ4ZB2M',
        ageHours: 0.3,
        read: false,
    },
    {
        user: 'usr_dispatch',
        event: NotificationEvent.etaChanged,
        load: 'HL-9DQ4ZB2M',
        ageHours: 1.1,
        read: false,
    },
    {
        user: 'usr_dispatch',
        event: NotificationEvent.loadBooked,
        load: 'HL-6NX2HV9T',
        ageHours: 16,
        read: true,
    },
    {
        user: 'usr_dispatch',
        event: NotificationEvent.invoiceDue,
        load: 'HL-5RT8VK3M',
        ageHours: 30,
        read: true,
    },
    {
        user: 'usr_carrier',
        event: NotificationEvent.checkCallRequested,
        load: 'HL-3RW8TNPE',
        ageHours: 0.1,
        read: false,
    },
    {
        user: 'usr_carrier',
        event: NotificationEvent.loadBooked,
        load: 'HL-8TB3QF6N',
        ageHours: 19,
        read: true,
    },
    {
        user: 'usr_driver',
        event: NotificationEvent.checkCallRequested,
        load: 'HL-3RW8TNPE',
        ageHours: 0.1,
        read: false,
    },
    {
        user: 'usr_ops',
        event: NotificationEvent.trackingStale,
        load: 'HL-9DQ4ZB2M',
        ageHours: 0.3,
        read: false,
    },
];

export const notificationInput = (
    { user, event, load, ageHours, read }: NotificationSeed,
    now: number,
) => {
    const createdAt = dateAgo(now, ageHours);

    return {
        userId: SEED_USERS[user].id,
        event,
        loadId: load,
        createdAt,
        readAt: read ? createdAt : null,
    } satisfies Prisma.NotificationCreateManyInput;
};
