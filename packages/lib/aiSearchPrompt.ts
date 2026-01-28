export interface LinkForSearch {
  id: number;
  name: string;
  url: string | null;
  description?: string | null;
  tags?: string[];
  collectionName?: string | null;
}

export const aiSearchPrompt = (
  query: string,
  links: LinkForSearch[]
) => `You are a smart bookmark search assistant. The user wants to find bookmarks matching their query.

USER QUERY: "${query}"

AVAILABLE BOOKMARKS:
${JSON.stringify(links, null, 2)}

INSTRUCTIONS:
1. Analyze the user's natural language query to understand what they're looking for.
2. Match bookmarks based on: name, URL, description, tags, and collection.
3. Consider semantic meaning, not just keyword matching.
4. Return ONLY a JSON array of matching bookmark IDs, ordered by relevance.
5. If no bookmarks match, return an empty array: []

Examples of queries and matching logic:
- "design tools" → match bookmarks about Figma, Canva, design resources
- "articles from last week" → you cannot filter by date, just match articles
- "React tutorials" → match anything related to React learning materials
- "all my dev tools" → match developer tools, IDEs, documentation sites

RESPONSE FORMAT: Return ONLY a valid JSON array of IDs. No explanation, no markdown.
Example: [1, 5, 12, 3]

MATCHED IDs:`;
