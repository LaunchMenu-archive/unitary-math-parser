import {ICST} from "./ICST";
import {IRuleData} from "./IRuleData";

/**
 * The data that rules can use for their parsing
 */
export type IFeatureRuleData = {
    /** The rule of the next precedence level to use */
    nextRule: (idxInCallingRule?: number) => ICST;
    /** The rule that's currently executed */
    currentRule: (idxInCallingRule?: number) => ICST;
} & IRuleData;
