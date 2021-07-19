import {createEvaluationContextIdentifier} from "../../parser/AST/createEvaluationContextIdentifier";
import {IUnitContextConfig} from "./_types/IUnitContextConfig";

/** A context to store unit configuration */
export const unitConfigContextIdentifier = createEvaluationContextIdentifier(
    "unit config",
    () => ({} as IUnitContextConfig)
);
