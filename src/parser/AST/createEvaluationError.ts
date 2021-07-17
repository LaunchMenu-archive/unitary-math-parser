import {IEvaluationError} from "../../_types/evaluation/IEvaluationError";
import {IEvaluationErrorObject} from "../../_types/evaluation/IEvaluationErrorObject";
import {getSyntaxPointerMessage} from "../getSyntaxPointerMessage";
import {IEvaluationErrorConfig} from "../_types/IEvaluationErrorConfig";
import {createEvaluationErrorObject} from "./createEvaluationErrorsObject";
import {EvaluationContext} from "./EvaluationContext";
import {inputTextContextIdentifier} from "./inputTextContextIdentifier";

/**
 * Creates a new evaluation error
 * @param config The config to create the message from
 * @param context The evaluation context to get the input string from
 * @returns The created error object
 */
export function createEvaluationError<T extends object>(
    {type, message, multilineMessage, source, extra}: IEvaluationErrorConfig<T>,
    context: EvaluationContext
): IEvaluationErrorObject<IEvaluationError & T> {
    const range = source.range;
    return createEvaluationErrorObject([
        {
            type,
            message: message(range.start),
            multilineMessage: multilineMessage(
                getSyntaxPointerMessage(
                    context.get(inputTextContextIdentifier),
                    range.start,
                    range.end
                )
            ),
            source,
            ...extra,
        } as IEvaluationError & T,
    ]);
}
