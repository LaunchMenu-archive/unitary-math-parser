import {formatAugmentation} from "../features/util/formats/formatAugmentation";
import {IFormat} from "../features/util/formats/_types/IFormat";
import {unitAugmentation} from "../features/util/number/unitAugmentation";
import {EvaluationContext} from "../parser/AST/EvaluationContext";
import {IValue} from "../parser/dataTypes/_types/IValue";
import {getSyntaxPointerMessage} from "../parser/getSyntaxPointerMessage";
import {isError} from "../parser/isError";
import {IUnit} from "../_types/evaluation/number/IUnit";
import {getParser} from "./parser.helper";

export function expectError(
    input: string,
    errors: {message: (text: string) => string; start: number; end?: number}[]
) {
    const result = getParser().evaluate(input);
    const messages = errors.map(error =>
        getMessage(error.message, input, {start: error.start, end: error.end})
    );

    expect(isError(result)).toBe(true);
    if (isError(result))
        expect(result.errors.map(error => error.multilineMessage).sort()).toEqual(
            messages.sort()
        );
}

export function getMessage(
    error: (message: string) => string,
    text: string,
    range: number | {start: number; end?: number}
) {
    const start = typeof range == "number" ? range : range.start;
    const end = typeof range == "number" ? undefined : range.end;
    return error(getSyntaxPointerMessage(text, start, end));
}

export function expectResult(
    expression: string,
    result: number,
    unit?: IUnit,
    {
        context,
        ignoreOrder = true,
        check,
        format,
    }: {
        context?: EvaluationContext;
        ignoreOrder?: boolean;
        check?: (result: IValue<number>) => void;
        format?: IFormat;
    } = {}
) {
    const res = getParser().evaluate(expression, context);
    if (isError(res)) {
        expect(res.errors.map(error => error.message)).toBe(undefined);
        return;
    }

    check?.(res);
    expect(res.data).toBe(result);
    if (unit) {
        const resUnit = res.getAugmentation(unitAugmentation).unit;
        if (!resUnit.equals(unit, ignoreOrder)) {
            expect(resUnit + "").toEqual(unit + "");
        }
    }
    if (format) expect(res.getAugmentation(formatAugmentation)).toBe(format);
}
