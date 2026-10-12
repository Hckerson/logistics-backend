import {
    ActorType,
    EventSource,
    LoadEventType,
    Prisma,
} from '../../generated/prisma/client';
import { SEED_USERS, type UserKey } from './users';

export type LoadEventSeed = Prisma.LoadEventCreateManyLoadInput;

export type Actor = Pick<LoadEventSeed, 'actorType' | 'actorId' | 'source'>;

export const member = (
    user?: UserKey,
    source: EventSource = EventSource.web,
): Actor => ({
    actorType: ActorType.member,
    actorId: user ? SEED_USERS[user].id : null,
    source,
});

export const SHIPPER = member('usr_dispatch');

export const SYSTEM: Actor = {
    actorType: ActorType.system,
    actorId: null,
    source: EventSource.system,
};

export const OPS: Actor = {
    actorType: ActorType.staff,
    actorId: SEED_USERS.usr_ops.id,
    source: EventSource.operations,
};

export const event = (
    type: LoadEventType,
    at: number,
    actor: Actor,
    fields: Partial<LoadEventSeed> = {},
): LoadEventSeed => ({ type, occurredAt: new Date(at), ...actor, ...fields });
