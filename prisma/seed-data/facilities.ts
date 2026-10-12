import { FacilityType, Prisma, StopType } from '../../generated/prisma/client';
import { CENTRAL_FACILITIES } from './facilities-central';
import { EASTERN_FACILITIES } from './facilities-eastern';
import { WESTERN_FACILITIES } from './facilities-western';
import { ORGANIZATIONS, type OrganizationKey } from './organizations';

export type FacilitySeed = Omit<
    Prisma.FacilityCreateManyInput,
    'organizationId' | 'type'
> & {
    id: string;
    organization: OrganizationKey;
};

export const FACILITIES = {
    ...EASTERN_FACILITIES,
    ...CENTRAL_FACILITIES,
    ...WESTERN_FACILITIES,
};

export type FacilityKey = keyof typeof FACILITIES;

const typeOf = (uses: ReadonlySet<StopType>): FacilityType => {
    const [only] = uses;
    return uses.size === 1 ? FacilityType[only] : FacilityType.both;
};

export const facilityInput = (
    { organization, ...facility }: FacilitySeed,
    uses: ReadonlySet<StopType>,
) =>
    ({
        ...facility,
        organizationId: ORGANIZATIONS[organization].id,
        type: typeOf(uses),
    }) satisfies Prisma.FacilityCreateManyInput;
