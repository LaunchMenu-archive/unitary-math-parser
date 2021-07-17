import {ITypeValidator} from "./ITypeValidator";

/** An object of type validators */
export type ITypeValidatorObject = {[K: string]: ITypeValidatorData};

type ITypeValidatorData =
    | ITypeValidatorObject
    | Array<ITypeValidatorData>
    | ITypeValidator<any>;
