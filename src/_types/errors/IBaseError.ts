/** The base type of any error */
export type IBaseError = {
    /** The type of error */
    type: string;
    /** The human readable error message */
    message: string;
    /** The human readable error message that uses multiple lines and should use a monospaced font */
    multilineMessage: string;
};
