import { HOUR_MS } from '@common/enums/time';

export const shiftHours = (moment: number, hours: number): number =>
    moment + hours * HOUR_MS;

export const dateIn = (now: number, hours: number): Date =>
    new Date(shiftHours(now, hours));

export const dateAgo = (now: number, hours: number): Date =>
    dateIn(now, -hours);

export const dateAgoOrNull = (now: number, hours?: number): Date | null =>
    hours === undefined ? null : dateAgo(now, hours);
