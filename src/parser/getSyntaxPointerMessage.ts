/**
 * Retrieves a string that visualizes the problematic index
 * @param text The text to point in
 * @param index The index to point at
 * @param maxPadding The maximum number of characters to see at either side of the pointed at index
 * @returns The string that points at the index
 */
export function getSyntaxPointerMessage(
    text: string,
    index: number,
    maxPadding: number = 10
): string {
    const start = Math.max(0, index - maxPadding);
    const end = Math.min(index + maxPadding, text.length);
    return `${start > 0 ? "…" : ""}${text.substring(start, end)}${
        end < text.length ? "…" : ""
    }\n${" ".repeat(index - start + (start > 0 ? 1 : 0)) + "^"}`;
}
