import { LoadStatus, StopType } from 'generated/prisma/enums';
import { stopFits, stopTimesFor } from './stop-times';

const NOW = new Date('2026-10-12T12:00:00.000Z');
const EARLIER = new Date('2026-10-12T08:00:00.000Z');

const stops = (pickupDeparted: Date | null) => [
    {
        id: 'pickup',
        type: StopType.pickup,
        arrivedAt: EARLIER,
        departedAt: pickupDeparted,
    },
    { id: 'drop', type: StopType.delivery, arrivedAt: null, departedAt: null },
];

describe('stopFits', () => {
    it('reads In transit to At pickup on a two-stop load as no forward move', () => {
        expect(stopFits(LoadStatus.AtPickup, stops(EARLIER))).toBe(false);
        expect(stopFits(LoadStatus.AtDelivery, stops(EARLIER))).toBe(true);
    });

    it('lets only the last stop deliver', () => {
        expect(stopFits(LoadStatus.InTransit, stops(null))).toBe(true);
        expect(stopFits(LoadStatus.Delivered, stops(null))).toBe(false);
    });
});

describe('stopTimesFor', () => {
    it('stamps the departure on the stop the truck is leaving', () => {
        expect(
            stopTimesFor(
                LoadStatus.AtPickup,
                LoadStatus.InTransit,
                false,
                stops(null),
                NOW,
            ),
        ).toEqual({ id: 'pickup', data: { departedAt: NOW } });
    });

    it('clears the last departure when the move is undone', () => {
        expect(
            stopTimesFor(
                LoadStatus.InTransit,
                LoadStatus.AtPickup,
                true,
                stops(EARLIER),
                NOW,
            ),
        ).toEqual({ id: 'pickup', data: { departedAt: null } });
    });
});
