# AI Search - Implementation Tasks

## Progress Tracker

### Phase 1: Setup & Dependencies
- [x] 1.1 Add AI dependencies to web package.json (ai, @openrouter/ai-sdk-provider)
- [x] 1.2 Add environment variables to .env.sample (already present)

### Phase 2: Backend Implementation
- [x] 2.1 Create AI model utility in packages/lib (shared getAIModel function)
- [x] 2.2 Create AI search prompt in packages/lib/aiSearchPrompt.ts
- [x] 2.3 Create AI search controller (apps/web/lib/api/controllers/search/aiSearch.ts)
- [x] 2.4 Create AI search API endpoint (apps/web/pages/api/v1/ai-search.ts)

### Phase 3: Frontend Implementation
- [x] 3.1 Create FloatingSearchBar component
- [x] 3.2 Create AISearchModal component
- [x] 3.3 Integrate components into main layout

---

## Current Status: ✅ All tasks complete!

## Files Created/Modified

### New Files:
- `packages/lib/aiModel.ts` - Shared AI model utility (getAIModel, isAIConfigured)
- `packages/lib/aiSearchPrompt.ts` - AI search prompt template
- `apps/web/lib/api/controllers/search/aiSearch.ts` - AI search controller
- `apps/web/pages/api/v1/ai-search.ts` - API endpoint
- `apps/web/components/FloatingSearchBar.tsx` - Floating button at bottom
- `apps/web/components/AISearchModal.tsx` - Search modal UI

### Modified Files:
- `apps/web/package.json` - Added AI dependencies
- `packages/lib/package.json` - Added AI dependencies
- `packages/lib/index.ts` - Exported new modules
- `apps/worker/lib/prompts.ts` - Added search prompt (also in lib)
- `apps/web/layouts/MainLayout.tsx` - Integrated FloatingSearchBar

## How to Test

1. Install dependencies: `yarn install`
2. Configure AI provider in `.env` (e.g., OPENROUTER_API_KEY, OPENROUTER_MODEL)
3. Start the app: `yarn web:dev`
4. Click the "AI Search" button at bottom of screen or press ⌘K / Ctrl+K
5. Enter natural language query like "Show me all design tools"
