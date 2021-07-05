import {createToken} from "chevrotain";

export const spaceToken = createToken({name: "SPACE", pattern: /\s+/, line_breaks: true});
