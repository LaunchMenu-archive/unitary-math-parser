/**
 * Retrieves a string that visualizes the problematic index
 * @param text The text to point in
 * @param index The index to point at
 * @returns The string that points at the index
 */
export function getSyntaxPointerMessage(text: string, index: number): string {
    const maxPadding = 10;
    const start = Math.max(0, index - maxPadding);
    const end = Math.min(index + maxPadding, text.length);
    return `${text.substring(start, end)}\n${" ".repeat(index - start) + "^"}`;
}
