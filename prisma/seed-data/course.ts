import { HOUR_MS, MINUTE_MS } from '@common/enums/time';
import { TRACE_STATUSES } from '@common/enums/tracking';
import { FACILITIES } from './facilities';
import { bearingOf, milesBetween, pointBetween, type Place } from './geo';
import {
    FREIGHT,
    type LoadSpec,
    type StopSpec,
    type TrackSpec,
} from './load-spec';

export interface Course {
    stops: readonly StopSpec[];
    places: Place[];
    stopMiles: number[];
    track: TrackSpec;
    firstArrival: number;
    lastReport: number;
}

const roadMiles = (from: Place, to: Place) =>
    milesBetween(from, to) * FREIGHT.roadCircuity;

export const courseOf = (
    { track, status, stops }: LoadSpec,
    now: number,
): Course | null => {
    const [first] = stops;
    if (
        !track ||
        first.arrived === undefined ||
        !TRACE_STATUSES.includes(status)
    ) {
        return null;
    }

    const places = stops.map((stop) => FACILITIES[stop.facility]);
    const stopMiles = places
        .slice(1)
        .reduce(
            (totals, place, index) => [
                ...totals,
                totals[index] + roadMiles(places[index], place),
            ],
            [0],
        );

    return {
        stops,
        places,
        stopMiles,
        track,
        firstArrival: first.arrived,
        lastReport: now - (track.silentMinutes ?? 0) * MINUTE_MS,
    };
};

const hoursSince = (
    hoursAgo: number | undefined,
    moment: number,
    now: number,
) => (hoursAgo === undefined ? null : hoursAgo + (moment - now) / HOUR_MS);

export const progressAt = (
    { stops, stopMiles, track }: Course,
    moment: number,
    now: number,
) =>
    stops.reduce(
        (done, stop, index) => {
            const driving = hoursSince(stop.departed, moment, now);
            const waiting = hoursSince(stop.arrived, moment, now);

            if (driving !== null && driving >= 0) {
                const leg =
                    index < stops.length - 1
                        ? stopMiles[index + 1] - stopMiles[index]
                        : 0;
                return {
                    miles:
                        stopMiles[index] +
                        Math.min(
                            track.mph * driving,
                            leg * FREIGHT.progressCap,
                        ),
                    moving: leg > 0,
                };
            }
            return waiting !== null && waiting >= 0
                ? { miles: stopMiles[index], moving: false }
                : done;
        },
        { miles: 0, moving: false },
    );

export const placeAt = ({ places, stopMiles }: Course, miles: number) => {
    const leg = Math.max(
        0,
        stopMiles.findLastIndex(
            (mark, index) => mark <= miles && index < stopMiles.length - 1,
        ),
    );
    const span = stopMiles[leg + 1] - stopMiles[leg];
    const fraction = span > 0 ? (miles - stopMiles[leg]) / span : 0;

    return {
        point: pointBetween(places[leg], places[leg + 1], fraction),
        heading: bearingOf(places[leg], places[leg + 1]),
    };
};
