export type IFactorUnitConfig = {
    /** The name of the unit */
    name: string;
    /** Possible aliases of the unit */
    alias?: string[];
    /** The factor of the unit relative to the previous unit */
    factor: number;
};
