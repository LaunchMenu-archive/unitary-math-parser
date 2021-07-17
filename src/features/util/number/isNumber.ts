import {createTypeValidator} from "../../../parser/createTypeValidator";
import {IUnitaryNumber} from "../../../_types/evaluation/number/IUnitaryNumber";

/**
 * A validator to check whether the given value is of the number type
 */
export const isNumber = createTypeValidator(
    "number",
    (value: object): value is IUnitaryNumber => "unit" in value && "value" in value
);
