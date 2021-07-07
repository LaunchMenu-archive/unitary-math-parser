/** An error that represents having found an unknown character type */
export type IUnknownCharacterError = {
    /** The type of error */
    type: "unknownCharacter";
    /** The human readable error message */
    message: string;
    /** The human readable error message that uses multiple lines and should use a monospaced font */
    multilineMessage: string;
    /** The index that the unknown character was found at */
    index: number;
    /** The character that was found */
    character: string;
};
