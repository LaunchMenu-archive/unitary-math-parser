// Modifier from: https://stackoverflow.com/a/59647842/8521718
export type IPlainObject =
    | bigint
    | boolean
    | null
    | number
    | string
    | symbol
    | undefined
    | Array<IPlainObject>
    | {[k: string]: IPlainObject};
