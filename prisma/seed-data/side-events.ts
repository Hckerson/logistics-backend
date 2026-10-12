import { MINUTE_MS } from '@common/enums/time';
import { TRACKING_EXCEPTION_MINUTES } from '@common/enums/tracking';
import { LoadEventType, ScanStatus } from '../../generated/prisma/client';
import { shiftHours } from './clock';
import { DOCUMENTS } from './documents';
import { OPS, SYSTEM, event, member, type LoadEventSeed } from './event-actors';
import type { LoadSpec } from './load-spec';
import { TRACKING_LINKS } from './tracking-links';

const CHECK_CALL = {
    load: 'HL-3RW8TNPE',
    minutesAgo: 6,
    note: 'Driver app quiet since Indio',
} as const;

const linkEventsOf = (loadId: string, now: number) =>
    TRACKING_LINKS.filter((link) => link.load === loadId).flatMap((link) => [
        event(
            LoadEventType.trackingLinkCreated,
            shiftHours(now, -link.ageHours),
            member(link.by),
        ),
        ...(link.revokedHoursAgo === undefined
            ? []
            : [
                  event(
                      LoadEventType.trackingLinkRevoked,
                      shiftHours(now, -link.revokedHoursAgo),
                      member(link.by),
                  ),
              ]),
    ]);

const documentEventsOf = (loadId: string, now: number) =>
    DOCUMENTS.filter(
        (document) =>
            document.load === loadId &&
            document.scanStatus !== ScanStatus.rejected,
    ).map((document) =>
        event(
            LoadEventType.documentUploaded,
            shiftHours(now, -document.ageHours),
            member(document.by),
        ),
    );

const staleEventsOf = ({ track }: LoadSpec, now: number) => {
    const minutesAgo = (track?.silentMinutes ?? 0) - TRACKING_EXCEPTION_MINUTES;

    return minutesAgo >= 0
        ? [
              event(
                  LoadEventType.trackingStale,
                  now - minutesAgo * MINUTE_MS,
                  SYSTEM,
              ),
          ]
        : [];
};

const checkCallEventsOf = (loadId: string, now: number) =>
    loadId === CHECK_CALL.load
        ? [
              event(
                  LoadEventType.checkCallRequested,
                  now - CHECK_CALL.minutesAgo * MINUTE_MS,
                  OPS,
                  { note: CHECK_CALL.note },
              ),
          ]
        : [];

export const sideEventsOf = (spec: LoadSpec, now: number): LoadEventSeed[] => [
    ...linkEventsOf(spec.id, now),
    ...documentEventsOf(spec.id, now),
    ...staleEventsOf(spec, now),
    ...checkCallEventsOf(spec.id, now),
];
