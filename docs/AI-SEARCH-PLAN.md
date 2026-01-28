# AI-Powered Search - Implementation Plan

## Overview

Add AI-powered semantic search to Booky, allowing users to search their bookmarks using natural language queries like "Give me all design tools" or "websites about React from last month".

## Phase I: Core Implementation

### Goals
- Natural language search across all user resources
- Two search modes: instant filter + AI-powered search
- Simple implementation using existing AI infrastructure

### Search Modes

| Mode | Trigger | Backend | Use Case |
|------|---------|---------|----------|
| **Instant Filter** | onChange (typing) | MeiliSearch | User knows what they're looking for |
| **AI Search** | Enter key / button | LLM (OpenRouter) | No results found, or natural language query |

### Architecture

```
User types: "design tools"
     ↓ (onChange, debounced)
     ↓
┌─────────────────────────────────┐
│ MeiliSearch instant filter      │
│ Returns matching links/tags     │
└─────────────────────────────────┘
     ↓
Results displayed (or empty)

--- If no results / user presses Enter ---

User query: "Give me all websites about design"
     ↓
┌─────────────────────────────────┐
│ POST /api/v1/ai-search          │
└─────────────────────────────────┘
     ↓
┌─────────────────────────────────┐
│ 1. Fetch ALL user links (~100)  │
│ 2. Build prompt with links JSON │
│ 3. Call LLM via OpenRouter      │
│ 4. Parse response (link IDs)    │
│ 5. Return matched items         │
└─────────────────────────────────┘
     ↓
Results grouped by category
```

### UI Components

| Component | Description |
|-----------|-------------|
| **Floating Search Bar** | Input at bottom of screen (like update notification) |
| **Search Modal** | Centered modal when bar is clicked |
| **Default State** | Shows 3 recently added links |
| **Results View** | Scrollable, grouped by: Links → Pinned → Collections → Tags |

### API Endpoint

```typescript
// POST /api/v1/ai-search
// Request
{
  query: "Give me all design tools"
}

// Response
{
  links: Link[],
  collections: Collection[],
  tags: Tag[]
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `apps/web/pages/api/v1/ai-search.ts` | API endpoint |
| `apps/web/lib/api/controllers/search/aiSearch.ts` | Core logic |
| `apps/worker/lib/prompts.ts` | Add search prompt (modify) |
| `apps/web/components/FloatingSearchBar.tsx` | Bottom bar UI |
| `apps/web/components/AISearchModal.tsx` | Modal UI |

### Dependencies to Add

```json
// apps/web/package.json
{
  "ai": "^5.0.113",
  "@openrouter/ai-sdk-provider": "1.5.4"
}
```

### Environment Variables

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=anthropic/claude-sonnet-4
```

## Phase II: Optimizations (Future)

- Vector embeddings for semantic search (if >100 links)
- Link content analysis and summarization
- Smarter caching of LLM responses
- Search history and suggestions

## App Focus Strategy

### Monorepo Structure

```
apps/
  web/      ← Next.js frontend + API routes
  worker/   ← Background jobs (archiving, indexing, AI tagging)
  mobile/   ← React Native app
packages/
  prisma/   ← Database schema
  lib/      ← Shared utilities
  router/   ← React Query hooks
  types/    ← TypeScript types
```

### Implementation Order

1. **Web app first** - Contains API routes and main UI
2. **Shared packages** - Types and utilities in `packages/`
3. **Worker** - Already has AI infrastructure, may need to expose functions
4. **Mobile** - Can reuse API endpoints, UI later

### Existing AI Infrastructure (Reusable)

Located in `apps/worker/lib/`:
- `autoTagLink.ts` - Multi-provider AI model getter (OpenRouter ready)
- `prompts.ts` - Prompt templates

We'll create shared AI utilities in `packages/lib/` that both web and worker can use.

## Notes

- Phase I targets ~100 links (simple fetch all approach)
- Reuse existing card components from dashboard
- Keep existing search bar functionality unchanged
