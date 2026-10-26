/** Length in characters as people count them (a Chinese character or an emoji counts as one). */
export function charCount(text: string): number {
  return Array.from(text).length;
}

/** Case-insensitive "contains" for simple searches. An empty query matches everything. */
export function matchesQuery(query: string, ...fields: string[]): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  return fields.some((field) => field.toLocaleLowerCase().includes(needle));
}
