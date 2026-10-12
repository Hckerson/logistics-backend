import { EtaConfidence } from 'generated/prisma/enums';

interface EtaFields {
    etaAt: Date | null;
    etaConfidence: EtaConfidence | null;
    etaLate: boolean;
    milesRemaining: number | null;
}

export const etaOf = ({
    etaAt,
    etaConfidence,
    etaLate,
    milesRemaining,
}: EtaFields) =>
    etaAt && etaConfidence
        ? {
              at: etaAt,
              confidence: etaConfidence,
              late: etaLate,
              milesRemaining,
          }
        : null;
