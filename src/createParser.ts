import {CSTParser} from "./parser/CST/CSTParser";
import {ICST} from "./_types/CST/ICST";
import {IASTBase} from "./_types/AST/IASTBase";
import {IParser} from "./_types/IParser";
import {IParserConfig} from "./_types/IParserConfig";
import {createASTParser} from "./parser/AST/createASTParser";

/**
 * Creates a parser from the given config
 * @param config The config of the parser
 * @returns A function that can be used to parse a input string
 */
export function createParser<C extends IParserConfig>(
    config: C
): IParser<C extends IParserConfig<infer T> ? T : never> {
    const cstParser = new CSTParser(config);
    const parseAST = createASTParser(config);

    return (text: string) => {
        let cst: ICST | undefined;
        const getCST = (): ICST => {
            if (!cst) cst = cstParser.parse(text);
            return cst;
        };

        let ast: IASTBase | undefined;
        const getAST = (): IASTBase => {
            if (!ast) ast = parseAST(getCST());
            return ast;
        };

        return {
            parseRaw: getCST,
            parse: getAST,
        } as any;
    };
}
