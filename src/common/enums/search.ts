export enum QuickFindType {
    LOAD = 'load',
    FACILITY = 'facility',
    MEMBER = 'member',
    ORGANIZATION = 'organization',
}

export const QUICK_FIND = { min: 2, max: 200, groupLimit: 5 } as const;
