const EARTH_RADIUS_MILES = 3958.8;
const FULL_TURN_DEGREES = 360;

export interface Place {
    latitude: number;
    longitude: number;
}

const radians = (degrees: number) => (degrees * Math.PI) / 180;

const degrees = (radiansValue: number) => (radiansValue * 180) / Math.PI;

export const milesBetween = (from: Place, to: Place): number => {
    const latitudeDelta = radians(to.latitude - from.latitude);
    const longitudeDelta = radians(to.longitude - from.longitude);
    const chord =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(radians(from.latitude)) *
            Math.cos(radians(to.latitude)) *
            Math.sin(longitudeDelta / 2) ** 2;

    return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(chord));
};

export const bearingOf = (from: Place, to: Place): number => {
    const fromLatitude = radians(from.latitude);
    const toLatitude = radians(to.latitude);
    const longitudeDelta = radians(to.longitude - from.longitude);
    const east = Math.sin(longitudeDelta) * Math.cos(toLatitude);
    const north =
        Math.cos(fromLatitude) * Math.sin(toLatitude) -
        Math.sin(fromLatitude) *
            Math.cos(toLatitude) *
            Math.cos(longitudeDelta);

    return (
        (Math.round(degrees(Math.atan2(east, north))) + FULL_TURN_DEGREES) %
        FULL_TURN_DEGREES
    );
};

export const pointBetween = (
    from: Place,
    to: Place,
    fraction: number,
): Place => ({
    latitude: from.latitude + (to.latitude - from.latitude) * fraction,
    longitude: from.longitude + (to.longitude - from.longitude) * fraction,
});

export const nearest = <T extends Place>(
    places: readonly T[],
    point: Place,
): T =>
    places.reduce((best, place) =>
        milesBetween(place, point) < milesBetween(best, point) ? place : best,
    );
