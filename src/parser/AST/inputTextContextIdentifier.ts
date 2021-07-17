import {createEvaluationContextIdentifier} from "./createEvaluationContextIdentifier";

/** A context to store the input text that's being evaluated */
export const inputTextContextIdentifier = createEvaluationContextIdentifier(
    "input text",
    () => ""
);
