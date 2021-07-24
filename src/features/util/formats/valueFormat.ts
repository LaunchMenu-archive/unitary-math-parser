import {createDataType} from "../../../parser/dataTypes/createDataType";
import {IValueFormat} from "./_types/IValueFormat";

/** The format data type to represent value formats */
export const valueFormat = createDataType<IValueFormat>("format");
