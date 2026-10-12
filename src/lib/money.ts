import { ChargeKind, ChargeStatus } from 'generated/prisma/enums';
import { SUBTRACTIVE_CHARGE_KINDS } from '@common/enums/load';

export const CURRENCY = 'USD';

export interface ChargeLine {
    kind: ChargeKind;
    amountCents: number;
    status: ChargeStatus;
}

const signed = ({ kind, amountCents }: ChargeLine): number =>
    SUBTRACTIVE_CHARGE_KINDS.includes(kind) ? -amountCents : amountCents;

export const moneyOf = (parts: ChargeLine[]) => ({
    totalCents: parts.reduce((total, part) => total + signed(part), 0),
    currency: CURRENCY,
    pending: parts.some((part) => part.status !== ChargeStatus.agreed),
    parts,
});
