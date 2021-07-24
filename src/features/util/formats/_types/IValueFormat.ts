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
     * @returns The encoded values
     */
    encode(value: D): string;
    /**
     * Decodes the given value in this format
     * @param value The value in this format to decode
     * @returns The value in the common format, or parsing error information
     */
    decode(value: string): {value: D} | {unexpectedChar: string; index: number};
};
