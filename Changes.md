# Community Tool Library — MVP Restoration

## 1. MVP Identification

The product exists to help neighbors share infrequently used tools instead of buying them. Its minimum viable behavior is therefore intentionally small: a resident must be able to add a tool, see tools currently listed, borrow an available tool, and return a borrowed tool. Ratings, reviews, images, categories, and badges are outside this repair because they do not matter until the add/view/borrow/return loop is reliable.

## 2. Issues Discovered and Fixes

### Bug 1: The initial tool fetch ran on every render

**Symptom:** The interface repeatedly requested `/api/tools` after each state update, causing unnecessary network traffic and making the app feel unstable.

**Cause:** `client/src/App.jsx` used `useEffect` without a dependency array. Calling `setTools` and `setLoading` triggered another render, which immediately triggered another fetch.

**Fix:** Added an empty dependency array so the initial load runs once. The fetch now also checks `response.ok` and handles failures without accepting an error payload as a tool list.

### Bug 2: Tool creation returned an object that was never persisted

**Symptom:** The form displayed “Tool listed successfully,” but refreshing the page removed the new tool.

**Cause:** `server/routes/tools.js` created a mock object with `Date.now()` and returned it without calling Prisma.

**Fix:** The route now validates `name` and `description`, calls `prisma.tool.create`, and returns the persisted record. Invalid submissions return `400`; unexpected database errors return `500`.

### Bug 3: Borrow and return used the wrong frontend endpoint

**Symptom:** Clicking Borrow or Return requested `/api/tool/:id`, while the backend exposed `/api/tools/:id`.

**Cause:** The frontend path omitted the plural `tools` segment.

**Fix:** `client/src/components/ToolCard.jsx` now calls the same `/api/tools/:id` route implemented by the backend.

### Bug 4: Borrow and return ignored the database result

**Symptom:** The button action could succeed on the server while the card continued to display the previous availability state.

**Cause:** The component built a local object whose `isAvailable` value was copied from the stale prop, so it never actually toggled. The parent also mutated its `tools` array directly without calling the state setter.

**Fix:** The card now passes the exact updated record returned by the server. `App.jsx` uses a functional immutable `setTools` update, replacing only the matching tool and reliably triggering a render.

### Bug 5: Tool cards used an undefined React key

**Symptom:** React could not reliably preserve card identity during list updates.

**Cause:** `ToolList.jsx` used `tool.index`, but the Prisma model provides `tool.id`.

**Fix:** Tool cards now use the stable database ID as their key.

## 3. Improvements

The repaired flow keeps the original Express, Prisma, React, and Vite structure. It avoids adding authentication, ratings, image storage, or other non-MVP complexity. The form reports non-2xx responses instead of silently succeeding, the borrow button remains disabled while a request is pending, and the UI always reflects the server’s persisted state. The Prisma schema remains the source of truth for tool availability.

## Verification

The frontend production build completes with `npm run build`. The backend route and frontend component files pass Node/JavaScript syntax checks. Prisma Client generation completes successfully. A full add/borrow/return integration test requires a PostgreSQL `DATABASE_URL`, which is intentionally not committed to this repository.

## Deployment

- **Frontend:** Deploy the `client` directory with Vercel or Netlify.
- **Backend:** Deploy the `server` directory with Render or Railway.
- **Database:** Set `DATABASE_URL` to a hosted PostgreSQL connection string from Neon or Supabase.

Live deployment URLs should be added here after the owner’s hosting and database credentials are connected.


### Bug 6: Prisma CLI could not generate the client

**Symptom:** The original server used a file named `prisma.config.js` for the Prisma client singleton. Prisma 7 treated that filename as CLI configuration and failed before generation; Prisma 7 also rejects the schema’s existing `datasource.url` format.

**Fix:** Renamed the singleton to `server/prismaClient.js`, updated the route import, and pinned `prisma` and `@prisma/client` to the compatible 6.x line. `npx prisma generate --schema prisma/schema.prisma` now completes successfully while preserving the existing PostgreSQL schema and CommonJS runtime.

## Final Verification Results

- `npm --prefix client run build` passes.
- `node --check server/index.js` passes.
- `node --check server/routes/tools.js` passes.
- `node --check server/prismaClient.js` passes.
- `npx prisma generate --schema prisma/schema.prisma` passes with Prisma 6.19.3.
