import { TrackingHealth } from '@common/enums/tracking';
import { MINUTE_MS } from '@common/enums/time';
import { deliveredAtOf, downsample, healthOf, roundTo } from './tracking';

const minutesAgo = (minutes: number) =>
    new Date(Date.now() - minutes * MINUTE_MS);

describe('healthOf', () => {
    it('is fresh under an hour, stale from sixty minutes, an exception from ninety', () => {
        expect(healthOf(minutesAgo(30))).toBe(TrackingHealth.FRESH);
        expect(healthOf(minutesAgo(61))).toBe(TrackingHealth.STALE);
        expect(healthOf(minutesAgo(91))).toBe(TrackingHealth.EXCEPTION);
    });
});

describe('downsample', () => {
    it('keeps short tracks whole and always ends on the latest point', () => {
        const points = Array.from({ length: 1000 }, (_, index) => index);
        const kept = downsample(points, 288);

        expect(downsample([1, 2, 3], 288)).toEqual([1, 2, 3]);
        expect(kept.length).toBeLessThanOrEqual(289);
        expect(kept.at(-1)).toBe(999);
    });
});

describe('deliveredAtOf', () => {
    it('answers the last departure only once every stop is departed', () => {
        const departed = minutesAgo(5);

        expect(
            deliveredAtOf([{ departedAt: departed }, { departedAt: null }]),
        ).toBeNull();
        expect(
            deliveredAtOf([
                { departedAt: minutesAgo(90) },
                { departedAt: departed },
            ]),
        ).toBe(departed);
    });
});

describe('roundTo', () => {
    it('rounds public coordinates to city level', () => {
        expect(roundTo(41.87811, 1)).toBe(41.9);
    });
});
