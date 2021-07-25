# unitary-math-parser

A parser and evaluator for simple math expressions, with support for units and simple corrections

This project was ultimately scrapped in favor of using [mathjs](https://mathjs.org/)

## Examples

-   `(5km/hour - 1meter/second + .1km/hour)*20min` = `0.5 km`
-   `150 * (100-30)%` = `105`
-   `5km + 20meter + 3dam - 5m in dam` = `504.5 decameter`
-   `0b1011 m/s + 0xF1 km/h in decimal` = ` 77.94444444444444 meter/second`

### Syntax recovery

`-4+4*2/2)+3`

will suggest possible fixes:

-   `(-4+4*2/2)+3`
-   `-(4+4*2/2)+3`
-   `-4+4*(2/2)+3`
-   `-4+4*2/2+3`

As can be seen above, it can automatically filter out suggestions where the brackets were redundant such as `-4+(4*2/2)+3`

## Usage

The library wasn't yet finished, so there won't be any proper usage examples. You can however look at the unit tests that exist, or the main entry for some test cases of usage.

## Mathjs comparison

Pros of this library:

-   General syntax error recover feature:
    -   Can recover from missing brackets, and suggest options you may have meant
-   Would've had date formats for simple date reading (feature was in the works)
-   Has `as` syntax that allows you to specify number and (in the future) date formats, E.g. `101 as binary`
-   Easily allows custom syntax to be added

Cons of this library:

-   Code was starting to be a bit messy
-   I'm no longer happy with some decisions I made early on, but also don't want to invest time to redo everything

Pros of Mathjs:

-   Well maintained (less likely to contain bugs)
-   Well known (may prove useful for certain users if they are familiar with a product that already uses it)
-   Has a good system for operation overloading to work with different (including new) data types
-   Has support for many data types out of the box
-   Has integration and derivative support

Cons of Mathjs:

-   Uses `%` for modulo, making percentage usage more difficult
-   Doesn't support custom syntax (as far as we can tell)
