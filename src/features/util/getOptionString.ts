/**
 * Retrieves a string of options
 * @param options The options
 * @returns The string of nicely summed options
 */
export function getOptionString(options: string[]): string {
    const firstOptions = options.slice(0, options.length - 2);
    const lastOptions = options.slice(options.length - 2);
    return [...firstOptions, lastOptions.join(" or ")].join(", ");
}
