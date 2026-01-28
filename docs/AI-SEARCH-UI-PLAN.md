# AI Search UI Enhancement Plan

## Overview

Enhance the AI Search Modal with real-time search on typing, tabbed results by category, recent searches, and recently added items.

## Features

### 1. Real-Time Search on Change

- **Current**: User must press Enter or click Search button
- **New**: Search triggers on `onChange` with debounce (300ms)
- As user types, results appear immediately
- AI search still available via Enter/button for more complex queries

### 2. Tabbed Results Interface

Four tabs under the search input:
| Tab | Content | Badge |
|-----|---------|-------|
| **Links** | Matched bookmark links | Count (e.g., "5") |
| **Pins** | Pinned items only | Count |
| **Collections** | Matching collections | Count |
| **Tags** | Matching tags | Count |

**Behavior:**
- Tabs appear only when user starts typing (search state)
- Each tab shows a real-time count badge as results stream in
- Click a tab to view that category's results
- Default to Links tab

### 3. Results Display

- **Reuse existing components**: Use `LinkList` component (row layout)
- Results render in a scrollable list within the active tab
- Same data/styling as home page, but in compact row format

### 4. Initial State (Before Typing)

Two sections when modal opens (no search query):

#### Recent Searches Section
- Horizontal row of buttons/chips
- Each chip shows previous search term (e.g., "design skills")
- Clicking a chip:
  1. Populates the input field with that term
  2. Auto-triggers the search (no need to press Enter)
- Shows last 5 searches (stored in database, synced across devices)

#### Recently Added Section
- Horizontal row of 3 square cards
- Each card shows:
  - Website favicon/icon
  - Short name (domain or first word, before `.com`)
- Clicking navigates to that link
- Fetches 3 most recent links via API

### 5. Search History Persistence (Database)

**Why database instead of localStorage:**
- Syncs across web and mobile apps
- Per-user authentication (each user has their own history)
- Persists across devices and browsers

**Database model:**
- New `SearchHistory` table linked to `User`
- Max 10 entries per user (FIFO - oldest deleted when limit reached)
- Each entry: `{ id, userId, query, createdAt }`

## Database Migration

### New Prisma Model

```prisma
model SearchHistory {
  id        Int      @id @default(autoincrement())
  query     String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    Int
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([userId, createdAt])
}
```

### User Model Update

Add relation to User model:
```prisma
model User {
  // ... existing fields
  searchHistory SearchHistory[]
}
```

### Migration File

Create migration: `add_search_history_table`

```sql
CREATE TABLE "SearchHistory" (
    "id" SERIAL NOT NULL,
    "query" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");
CREATE INDEX "SearchHistory_userId_createdAt_idx" ON "SearchHistory"("userId", "createdAt");

ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Technical Architecture

### Files to Create/Modify

| File | Changes |
|------|---------|
| `packages/prisma/schema.prisma` | Add `SearchHistory` model + User relation |
| `apps/web/pages/api/v1/search-history/index.ts` | **NEW** - GET (list) + POST (add) |
| `apps/web/pages/api/v1/search-history/[id].ts` | **NEW** - DELETE single entry |
| `apps/web/lib/api/controllers/searchHistory.ts` | **NEW** - CRUD operations |
| `packages/router/searchHistory.ts` | **NEW** - React Query hooks |
| `apps/web/components/AISearchModal.tsx` | Major rewrite - add tabs, real-time search, initial state |
| `apps/web/components/AISearch/SearchTabs.tsx` | **NEW** - Tab component with counts |
| `apps/web/components/AISearch/RecentSearches.tsx` | **NEW** - Recent searches chips |
| `apps/web/components/AISearch/RecentlyAdded.tsx` | **NEW** - Recently added cards |
| `apps/web/components/AISearch/SearchResultsList.tsx` | **NEW** - Results list using LinkList |

### API Endpoints

#### GET /api/v1/search-history
Returns user's recent searches (max 10, newest first)

```typescript
// Response
{
  success: true,
  data: [
    { id: 1, query: "design tools", createdAt: "2025-01-28T..." },
    { id: 2, query: "react libraries", createdAt: "2025-01-27T..." }
  ]
}
```

#### POST /api/v1/search-history
Adds a new search to history (auto-limits to 10 entries)

```typescript
// Request
{ query: "design skills" }

// Response
{ success: true, data: { id: 3, query: "design skills", createdAt: "..." } }
```

#### DELETE /api/v1/search-history/:id
Deletes a specific search entry

#### DELETE /api/v1/search-history (with body)
Clears all search history for user

### React Query Hooks

```typescript
// packages/router/searchHistory.ts
export const useSearchHistory = () => {
  return useQuery({
    queryKey: ["searchHistory"],
    queryFn: () => fetch("/api/v1/search-history").then(r => r.json())
  });
};

export const useAddSearchHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (query: string) => 
      fetch("/api/v1/search-history", {
        method: "POST",
        body: JSON.stringify({ query })
      }),
    onSuccess: () => queryClient.invalidateQueries(["searchHistory"])
  });
};

export const useClearSearchHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => 
      fetch("/api/v1/search-history", { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries(["searchHistory"])
  });
};
```

### AI Search API Changes

Modify `aiSearch.ts` controller to return categorized results:

```typescript
// Response structure
{
  data: {
    links: Link[],
    pins: Link[],       // links where pinnedBy includes current user
    collections: Collection[],
    tags: Tag[]
  },
  counts: {
    links: number,
    pins: number,
    collections: number,
    tags: number
  }
}
```

### Component Structure

```
AISearchModal
├── SearchInput (with onChange debounce)
├── SearchButton (triggers full AI search)
│
├── [Initial State - no query]
│   ├── RecentSearches (horizontal chips)
│   └── RecentlyAdded (3 square cards)
│
└── [Search State - has query]
    ├── SearchTabs (Links | Pins | Collections | Tags)
    │   └── Each tab has count badge
    └── SearchResultsList
        └── Renders LinkList components in rows
```

## Implementation Tasks

### Task 1: Database Migration ✅
- Add `SearchHistory` model to `packages/prisma/schema.prisma`
- Add `searchHistory` relation to `User` model
- ⚠️ **Pending**: Run `prisma migrate dev --name add_search_history_table` (requires DATABASE_URL)
- ⚠️ **Pending**: Generate Prisma client

### Task 2: Search History API ✅
- Create `apps/web/lib/api/controllers/searchHistory.ts`
  - `getSearchHistory(userId)` - fetch last 10 searches
  - `addSearchHistory(userId, query)` - add new entry, enforce max 10
  - `deleteSearchHistory(userId, id)` - delete single entry
  - `clearSearchHistory(userId)` - delete all for user
- Create `apps/web/pages/api/v1/search-history/index.ts` (GET, POST, DELETE)
- Create `apps/web/pages/api/v1/search-history/[id].ts` (DELETE)

### Task 3: React Query Hooks for Search History ✅
- Create `packages/router/searchHistory.ts`
- Hooks: `useSearchHistory`, `useAddSearchHistory`, `useDeleteSearchHistoryEntry`, `useClearSearchHistory`

### Task 4: Create RecentSearches Component ✅
- Create `apps/web/components/AISearch/RecentSearches.tsx`
- Horizontal flex row of button chips
- Use `useSearchHistory` hook to fetch data
- onClick: populate input + trigger search
- Style: subtle background, rounded pill shape

### Task 5: Create RecentlyAdded Component ✅
- Create `apps/web/components/AISearch/RecentlyAdded.tsx`
- Fetch 3 most recent links (use `useLinks` with sort: DateNewestFirst)
- Display as square cards with icon + short name
- Extract domain name (before .com) for display
- onClick: navigate to link detail

### Task 6: Create SearchTabs Component ✅
- Create `apps/web/components/AISearch/SearchTabs.tsx`
- Four tabs: Links, Pins, Collections, Tags
- Each tab shows count badge (number)
- Active tab has highlighted style
- Controlled by parent (activeTab state)

### Task 7: Create SearchResultsList Component ✅
- Create `apps/web/components/AISearch/SearchResultsList.tsx`
- Receives array of links/items
- Uses LinkIcon component for consistent display
- Scrollable container
- Empty state for no results

### Task 8: Update AI Search API ✅
- Modify `apps/web/lib/api/controllers/search/aiSearch.ts`
- Separate pins from regular links (check `pinnedBy`)
- Query collections and tags that match
- Return categorized counts

### Task 9: Refactor AISearchModal ✅
- Add debounced onChange handler (300ms)
- Add state for: `activeTab`, `searchMode` (initial/searching)
- Integrate all new sub-components
- Call `useAddSearchHistory` on successful search (after Enter/button)
- Keyboard navigation: Escape to close

### Task 10: Add Translations ✅
- Add new i18n keys to `apps/web/public/locales/en/common.json`:
  - `recent_searches`
  - `recently_added`
  - `clear`
  - `no_results_found`

## UI Mockup (ASCII)

```
┌─────────────────────────────────────────────────────────┐
│  ✨ AI Search                                       [X] │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  ┌─────────┐  │
│  │ 🔍 Ask AI to find bookmarks...       │  │ Search  │  │
│  └──────────────────────────────────────┘  └─────────┘  │
│                                                         │
│  ═══════════════════════════════════════════════════   │
│                                                         │
│  [INITIAL STATE - when input is empty]                  │
│                                                         │
│  Recent Searches                                        │
│  ┌────────────┐ ┌──────────┐ ┌─────────────┐           │
│  │design tools│ │react libs│ │productivity │           │
│  └────────────┘ └──────────┘ └─────────────┘           │
│                                                         │
│  Recently Added                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │  🌐     │ │  📄     │ │  🎨     │                   │
│  │ figma   │ │ notion  │ │ dribbble│                   │
│  └─────────┘ └─────────┘ └─────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [SEARCH STATE - when typing]                           │
│                                                         │
│  ┌──────────────────────────────────────┐  ┌─────────┐  │
│  │ 🔍 design tools                      │  │ Search  │  │
│  └──────────────────────────────────────┘  └─────────┘  │
│                                                         │
│  ┌──────────┬──────────┬──────────────┬───────────┐    │
│  │Links (5) │ Pins (2) │Collections(1)│ Tags (3)  │    │
│  └──────────┴──────────┴──────────────┴───────────┘    │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🌐 Figma - Design Tools                           │  │
│  │    figma.com • Design • 2 days ago                │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ 🌐 Sketch - Vector Design                         │  │
│  │    sketch.com • Design • 1 week ago               │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ 🌐 Adobe XD - UI/UX Design                        │  │
│  │    adobe.com/xd • Design • 2 weeks ago            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Dependencies

No new dependencies required. Using existing:
- `zustand` - State management
- `vaul` - Mobile drawer
- `@tanstack/react-query` - Data fetching
- Existing UI components from the codebase

## Performance Considerations

1. **Debounce**: 300ms delay on onChange to prevent excessive API calls
2. **Caching**: React Query will cache recent results
3. **Pagination**: Initially load first page only, lazy load more
4. **Abort Controller**: Cancel in-flight requests when query changes

## Migration Notes

- Existing search functionality remains unchanged
- New features are additive
- localStorage keys are new, no migration needed
