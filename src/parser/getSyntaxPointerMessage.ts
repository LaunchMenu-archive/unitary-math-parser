/**
 * Retrieves a string that visualizes the problematic index
 * @param text The text to point in
 * @param start The index to point at
 * @param maxPadding The maximum number of characters to see at either side of the pointed at index
 * @returns The string that points at the index
 */
export function getSyntaxPointerMessage(
    text: string,
    start: number,
    end: number = start + 1,
    maxPadding: number = 10
): string {
    const length = end - start;
    const textStart = Math.max(0, start - maxPadding);
    const textEnd = Math.min(start + length + maxPadding, text.length);
    return `${textStart > 0 ? "…" : ""}${text.substring(textStart, textEnd)}${
        textEnd < text.length ? "…" : ""
    }\n${" ".repeat(start - textStart + (textStart > 0 ? 1 : 0)) + "^".repeat(length)}`;
}
