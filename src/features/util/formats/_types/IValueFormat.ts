import {EvaluationContext} from "../../../../parser/AST/EvaluationContext";
import {IDataType} from "../../../../parser/dataTypes/_types/IDataType";

/** A format for values */
export type IValueFormat<D = any> = {
    /** The data type that the format is dor */
    dataType: IDataType<D>;
    /** The identifier for the value format */
    identifier: Symbol;
    /** The name of this format */
    name: string;
    /**
     * Encodes the given value in this format
     * @param value The value to encode
     * @param context The evaluation context that data can be extracted from
     * @returns The encoded values
     */
    encode(value: D, context?: EvaluationContext): string;
    /**
     * Decodes the given value in this format
     * @param value The value in this format to decode
     * @param context The evaluation context that data can be extracted from
     * @returns The value in the common format, or parsing error information
     */
    decode(value: string, context?: EvaluationContext): IFormatDecodeResult<D>;
};

export type IFormatDecodeResult<D> = {value: D} | IFormatDecodeError;

export type IFormatDecodeError = {
    index: number;
    errorType: string;
    errorMessage: string;
    unexpectedChar?: string;
};
