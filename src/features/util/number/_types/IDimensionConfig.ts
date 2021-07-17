import {IUnit} from "../../../../_types/evaluation/number/IUnit";

export type IDimensionConfig = {
    /** The name of the dimension */
    name: string;
    /** The sort priority of the dimension (higher => further to the left) */
    priority: number;
    /** The unit data */
    unit: {
        /** The name of the unit */
        name: string;
        /** The aliases of the unit */
        alias?: string[];
        /** An equivalent unit (with other - equivalent - dimensions) */
        equivalent?: IUnit;
    };
};
