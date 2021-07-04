import {
    ConsumeMethodOpts,
    DSLMethodOpts,
    DSLMethodOptsWithErr,
    GrammarAction,
    IOrAlt,
    IToken,
    OrMethodOpts,
    SubruleMethodOpts,
    TokenType,
} from "chevrotain";
import {ICST} from "./CST/ICST";
import {IFeatureSupport} from "./IFeatureSupport";

export type IParserOps = {
    /**
     *
     * A Parsing DSL method use to consume a single Token.
     * In EBNF terms this is equivalent to a Terminal.
     *
     * A Token will be consumed, IFF the next token in the token vector matches <tokType>.
     * otherwise the parser may attempt to perform error recovery (if enabled).
     *
     * The index in the method name indicates the unique occurrence of a terminal consumption
     * inside a the top level rule. What this means is that if a terminal appears
     * more than once in a single rule, each appearance must have a **different** index.
     *
     * For example:
     * ```
     *   this.RULE("qualifiedName", () => {
     *   this.consume(1, Identifier);
     *     this.MANY(() => {
     *       this.CONSUME1(Dot);
     *       // here we use CONSUME2 because the terminal
     *       // 'Identifier' has already appeared previously in the
     *       // the rule 'parseQualifiedName'
     *       this.consume(2, Identifier);
     *     });
     *   })
     * ```
     *
     * - See more details on the [unique suffixes requirement](http://chevrotain.io/docs/FAQ.html#NUMERICAL_SUFFIXES).
     *
     * @param idx - The index of the consume (every call should have a unique index)
     * @param tokType - The Type of the token to be consumed.
     * @param options - optional properties to modify the behavior of CONSUME.
     */
    consume(
        idx: number,
        tokType: TokenType,
        options?: ConsumeMethodOpts | undefined
    ): IToken;

    /**
     * Parsing DSL Method that Indicates an Optional production.
     * in EBNF notation this is equivalent to: "[...]".
     *
     * Note that there are two syntax forms:
     * - Passing the grammar action directly:
     *   ```
     *     this.option(1, () => {
     *       this.consume(1, Digit)}
     *     );
     *   ```
     *
     * - using an "options" object:
     *   ```
     *     this.option(1, {
     *       GATE:predicateFunc,
     *       DEF: () => {
     *         this.consume(1, Digit)
     *     }});
     *   ```
     *
     * The optional 'GATE' property in "options" object form can be used to add constraints
     * to invoking the grammar action.
     *
     * As in CONSUME the index in the method name indicates the occurrence
     * of the optional production in it's top rule.
     *
     * @param idx - The index of the option (every call should have a unique index)
     * @param  actionORMethodDef - The grammar action to optionally invoke once
     *                             or an "OPTIONS" object describing the grammar action and optional properties.
     */
    option<OUT>(
        idx: number,
        actionORMethodDef: GrammarAction<OUT> | DSLMethodOpts<OUT>
    ): OUT;

    /**
     * Parsing DSL method that indicates a choice between a set of alternatives must be made.
     * This is equivalent to an EBNF alternation (A | B | C | D ...), except
     * that the alternatives are ordered like in a PEG grammar.
     * This means that the **first** matching alternative is always chosen.
     *
     * There are several forms for the inner alternatives array:
     *
     * - Passing alternatives array directly:
     *   ```
     *     this.or(1, [
     *       { ALT:() => { this.consume(1, One) }},
     *       { ALT:() => { this.consume(1, Two) }},
     *       { ALT:() => { this.consume(1, Three) }}
     *     ])
     *   ```
     *
     * - Passing alternative array directly with predicates (GATE):
     *   ```
     *     this.or(1, [
     *       { GATE: predicateFunc1, ALT:() => { this.consume(1, One) }},
     *       { GATE: predicateFuncX, ALT:() => { this.consume(1, Two) }},
     *       { GATE: predicateFuncX, ALT:() => { this.consume(1, Three) }}
     *     ])
     *   ```
     *
     * - These syntax forms can also be mixed:
     *   ```
     *     this.or(1, [
     *       {
     *         GATE: predicateFunc1,
     *         ALT:() => { this.consume(1, One) }
     *       },
     *       { ALT:() => { this.consume(1, Two) }},
     *       { ALT:() => { this.consume(1, Three) }}
     *     ])
     *   ```
     *
     * - Additionally an "options" object may be used:
     *   ```
     *     this.or(1, {
     *       DEF:[
     *         { ALT:() => { this.consume(1, One) }},
     *         { ALT:() => { this.consume(1, Two) }},
     *         { ALT:() => { this.consume(1, Three) }}
     *       ],
     *       // OPTIONAL property
     *       ERR_MSG: "A Number"
     *     })
     *   ```
     *
     * The 'predicateFuncX' in the long form can be used to add constraints to choosing the alternative.
     *
     * As in CONSUME the index in the method name indicates the occurrence
     * of the alternation production in it's top rule.
     *
     * @param idx - The index of the or (every call should have a unique index)
     * @param altsOrOpts - A set of alternatives or an "OPTIONS" object describing the alternatives and optional properties.
     *
     * @returns The result of invoking the chosen alternative.
     */
    or<T = any>(idx: number, altsOrOpts: IOrAlt<T>[] | OrMethodOpts<T>): T;

    /**
     * Parsing DSL method, that indicates a repetition of zero or more.
     * This is equivalent to EBNF repetition {...}.
     *
     * Note that there are two syntax forms:
     * - Passing the grammar action directly:
     *   ```
     *     this.many(1, () => {
     *       this.consume(1, Comma)
     *       this.consume(1, Digit)
     *      })
     *   ```
     *
     * - using an "options" object:
     *   ```
     *     this.MANY(1, {
     *       GATE: predicateFunc,
     *       DEF: () => {
     *              this.consume(1, Comma)
     *              this.consume(1, Digit)
     *            }
     *     });
     *   ```
     *
     * The optional 'GATE' property in "options" object form can be used to add constraints
     * to invoking the grammar action.
     *
     * As in CONSUME the index in the method name indicates the occurrence
     * of the repetition production in it's top rule.
     *
     * @param idx - The index of the many (every call should have a unique index)
     * @param actionORMethodDef - The grammar action to optionally invoke multiple times
     *                             or an "OPTIONS" object describing the grammar action and optional properties.
     *
     */
    many(idx: number, actionORMethodDef: GrammarAction<any> | DSLMethodOpts<any>): void;

    /**
     * Convenience method, same as MANY but the repetition is of one or more.
     * failing to match at least one repetition will result in a parsing error and
     * cause a parsing error.
     *
     * @see many
     *
     * @param idx - The index of the atLeastOne (every call should have a unique index)
     * @param actionORMethodDef  - The grammar action to optionally invoke multiple times
     *                             or an "OPTIONS" object describing the grammar action and optional properties.
     *
     */
    atLeastOne(
        idx: number,
        actionORMethodDef: GrammarAction<any> | DSLMethodOptsWithErr<any>
    ): void;

    /**
     * The Parsing DSL Method is used by one rule to call another.
     * It is equivalent to a non-Terminal in EBNF notation.
     *
     * This may seem redundant as it does not actually do much.
     * However using it is **mandatory** for all sub rule invocations.
     *
     * Calling another rule without wrapping in SUBRULE(...)
     * will cause errors/mistakes in the Parser's self analysis phase,
     * which will lead to errors in error recovery/automatic lookahead calculation
     * and any other functionality relying on the Parser's self analysis
     * output.
     *
     * As in CONSUME the index in the method name indicates the occurrence
     * of the sub rule invocation in its rule.
     *
     * @param idx - The index of the subrule (every call should have a unique index)
     *
     */
    subrule(
        idx: number,
        ruleToCall: (idx: number) => ICST,
        options?: SubruleMethodOpts
    ): ICST;

    /**
     * Calls the given support rule
     * @param idx The index of the support rule (every call should have a unique index)
     * @param ruleToCall The feature support to call
     * @param options Additional options
     * @returns The created concrete syntax tree
     */
    supportRule(
        idx: number,
        ruleToCall: IFeatureSupport,
        options?: SubruleMethodOpts
    ): ICST;

    /**
     * The top level expression rule
     */
    expression: (idx: number) => ICST;
};
