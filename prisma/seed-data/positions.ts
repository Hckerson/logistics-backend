import { HOUR_MS, MINUTE_MS } from '@common/enums/time';
import { TRACK_WINDOW_HOURS } from '@common/enums/tracking';
import { Prisma } from '../../generated/prisma/client';
import { shiftHours } from './clock';
import { courseOf, placeAt, progressAt, type Course } from './course';
import { FACILITIES } from './facilities';
import { nearest } from './geo';
import { FREIGHT, type LoadSpec } from './load-spec';

type EtaFields = Pick<
    Prisma.LoadUncheckedCreateInput,
    'etaAt' | 'etaConfidence' | 'etaLate' | 'milesRemaining'
>;

const REPORT_MS = FREIGHT.reportEveryMinutes * MINUTE_MS;
const CITIES = Object.values(FACILITIES);

const positionAt = (
    course: Course,
    moment: number,
    now: number,
): Prisma.PositionCreateManyLoadInput => {
    const { miles, moving } = progressAt(course, moment, now);
    const { point, heading } = placeAt(course, miles);

    return {
        ...point,
        heading,
        speedMph: moving ? course.track.mph : 0,
        city: nearest(CITIES, point).city,
        source: course.track.source,
        recordedAt: new Date(moment),
        receivedAt: new Date(moment),
    };
};

export const positionsOf = (
    spec: LoadSpec,
    now: number,
): Prisma.PositionCreateManyLoadInput[] => {
    const course = courseOf(spec, now);
    if (!course) return [];

    const { firstArrival, lastReport } = course;
    const since = shiftHours(now, -Math.min(TRACK_WINDOW_HOURS, firstArrival));
    const count = Math.max(0, Math.floor((lastReport - since) / REPORT_MS) + 1);

    return Array.from({ length: count }, (_, index) =>
        positionAt(course, lastReport - (count - 1 - index) * REPORT_MS, now),
    );
};

export const etaOf = (spec: LoadSpec, now: number): EtaFields => {
    const course = courseOf(spec, now);
    const next = spec.stops.findIndex((stop) => stop.arrived === undefined);
    if (!course || next <= 0) return {};

    const { lastReport, stopMiles, track } = course;
    const { miles, moving } = progressAt(course, lastReport, now);
    const etaAt =
        (moving ? lastReport : now) +
        ((stopMiles[next] - miles) / track.mph) * HOUR_MS;
    const windowEnd = shiftHours(
        now,
        spec.stops[next].opensIn + FREIGHT.windowHours,
    );

    return {
        etaAt: new Date(etaAt),
        etaConfidence: track.confidence,
        etaLate: etaAt > windowEnd,
        milesRemaining: Math.round(stopMiles[stopMiles.length - 1] - miles),
    };
};
