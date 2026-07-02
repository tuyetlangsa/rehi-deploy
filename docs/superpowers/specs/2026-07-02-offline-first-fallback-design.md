# Offline-First Fallback for rehi — Design Spec

**Date:** 2026-07-02
**Status:** Approved (design), pending implementation plan
**Author:** brainstormed with Claude

---

## 1. Problem

rehi is a Next.js 15 (App Router) PWA using `@serwist/next` 9 and Dexie (IndexedDB).
All article/tag/highlight **data already lives in IndexedDB** (`RehiDB`), and every app
page is a client component that reads from IndexedDB via `useLiveQuery`. A background
loop (`SyncProvider`, every 10s) is the only thing that talks to the REST API.

Despite this, the app is **not usable offline**:

- Only the article currently open survives going offline (its HTML document is already
  in the tab).
- Navigating to any other route offline fails.
- `next/link` navigation offline "sometimes works, sometimes not".

### Root cause (verified)

The failure is **not** in the data layer (data is fully in IndexedDB). It is in the
**app shell / navigation layer**:

- Next.js App Router serves each route as its own HTML **document** (hard nav / reload /
  PWA launch) **and** its own **RSC payload** (`next/link` soft nav, request header
  `RSC: 1`).
- Serwist's `defaultCache` handles both with **NetworkFirst**, keyed by exact URL
  (built `public/sw.js`: `ev = { rscPrefetch: "pages-rsc-prefetch", rsc: "pages-rsc",
  html: "pages" }`, all using the NetworkFirst strategy).
- NetworkFirst only fills the cache for URLs actually fetched while online. A never-visited
  route — especially a dynamic `/articles/[articleId]` — has no cache entry, so offline it
  tries the network, fails, and there is no fallback.
- Service workers cannot understand dynamic params: `/articles/1`, `/articles/2`, … are N
  distinct URLs; all possible `[articleId]` values cannot be precached.

A secondary blocker: every gated page is wrapped in `withPageAuthRequired` (client HOC,
fetches `/auth/profile`) and the app runs `auth0.middleware` (server). Offline, neither can
reach the server, which can block rendering / trigger a login redirect.

---

## 2. Goals & non-goals

### Goals
- The **whole authed app** works offline, including routes **never visited before**:
  `/`, `/articles`, `/articles/[articleId]`, `/tags`, `/trash`, `/review`, `/settings`,
  `/profile`.
- Offline navigation renders real content (from IndexedDB) with each page's real layout.
- Online behavior is unchanged (auth still gates; background sync still replays mutations).

### Non-goals (YAGNI)
- **No smooth RSC-payload fallback.** Offline `next/link` navigation is allowed to fall
  back to a hard navigation (one white reload), then render correctly. Synthesizing a valid
  RSC payload is version-fragile and cosmetic-only.
- No changes to the sync layer or IndexedDB schema.
- No cleanup of vestigial code (empty Redux store, unused React Query `use-article.ts`).

### Decisions locked during brainstorming
- **Scope:** whole app offline (not just article detail).
- **Auth offline:** fail-open — if the user was previously logged in (has local data), stay
  in the app when offline; when back online, middleware gates normally.
- **Approach:** "B" = universal document fallback + precache the finite set of static routes
  + a dynamic shell for `/articles/[articleId]`.

---

## 3. Architecture

Two independent problems, solved separately:

| Problem | Solution |
|---|---|
| **P1 — app shell offline** | Precache static routes' real HTML; serve a dynamic shell for `/articles/[articleId]`; a generic offline page catches anything else. |
| **P2 — client auth gate fails offline** | `OfflineAuthGuard` that fails open when `navigator.onLine === false`, else behaves like `withPageAuthRequired`. |

Routes split by cardinality:

| Kind | Routes | Offline coverage |
|---|---|---|
| **Static (finite)** | `/`, `/articles`, `/tags`, `/trash`, `/review`, `/profile`, `/settings` | Precache real HTML at install → real layout/sidebars preserved |
| **Dynamic (unbounded)** | `/articles/[articleId]` | Fallback shell reads id from `location.pathname`, renders from IndexedDB |
| **Anything else** | unknown / uncached documents | Generic `/~offline` page |

Data is untouched: all views keep reading from IndexedDB via `useLiveQuery`.

### How soft navigation is handled (the accepted tradeoff)

`fallbacks` matchers only match `request.destination === "document"`. When `next/link`
soft-nav fetches an RSC payload offline and fails, Next.js **automatically falls back to a
hard navigation** to the target URL. That hard navigation is a document request, which the
fallback catches. Net effect: offline `<Link>` clicks still land on the correct page, at the
cost of one full reload (no smooth transition). This is the explicitly accepted MVP tradeoff.

---

## 4. Components

### 4.1 Refactor for reuse — `src/components/article-view.tsx` (new)
Extract the body of `src/app/(article-details)/articles/[articleId]/page.tsx` into a
component `ArticleView({ articleId }: { articleId: string })` — including the highlight
logic and the left/right sidebars currently defined inline in that file.

- `src/app/(article-details)/articles/[articleId]/page.tsx` becomes:
  ```tsx
  const { articleId } = useParams();
  return <ArticleView articleId={articleId as string} />;
  ```
  (still exported through the auth guard for the online route).

### 4.2 Dynamic article offline shell — `src/app/~offline-article/page.tsx` (new)
Client component. **No auth guard** (this route is only ever served offline).

```tsx
"use client";
import { useEffect, useState } from "react";
import { ArticleView } from "@/components/article-view";

export default function OfflineArticle() {
  const [articleId, setArticleId] = useState<string | null>(null);
  useEffect(() => {
    // useParams() does NOT resolve on the fallback document — read the real URL.
    const parts = location.pathname.split("/").filter(Boolean);
    setArticleId(parts[parts.length - 1] ?? null);
  }, []);
  if (!articleId) return null;
  return <ArticleView articleId={articleId} />;
}
```

`ArticleView` already handles the "article not in IndexedDB" case (renders "Article is not
found"), so a truly-unknown id degrades gracefully.

### 4.3 Generic offline page — `src/app/~offline/page.tsx` (new)
Minimal "You're offline" client page with a link back to `/articles`. Catch-all for
document requests that are neither cached nor an article route.

### 4.4 Auth guard — `src/components/offline-auth-guard.tsx` (new)
```tsx
"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";

// Fail-open when offline; identical to withPageAuthRequired when online.
export function withOfflineAuth<P extends object>(Page: ComponentType<P>) {
  const Guarded = withPageAuthRequired(Page as ComponentType);
  return function OfflineAware(props: P) {
    // Lazy init from navigator.onLine so an offline first-load never briefly
    // renders the guarded (redirect-prone) branch. `true` during SSR.
    const [online, setOnline] = useState(() =>
      typeof navigator === "undefined" ? true : navigator.onLine
    );
    useEffect(() => {
      const update = () => setOnline(navigator.onLine);
      update();
      window.addEventListener("online", update);
      window.addEventListener("offline", update);
      return () => {
        window.removeEventListener("online", update);
        window.removeEventListener("offline", update);
      };
    }, []);
    return online ? <Guarded {...(props as any)} /> : <Page {...props} />;
  };
}
```
This does **not** depend on the SDK's internal offline behavior; when offline it renders the
page directly. Initial state is `online = true` to avoid a flash before the effect runs
(online users see no change).

---

## 5. Service worker changes — `src/sw.ts`

Add `fallbacks` to the existing `Serwist` constructor. **Keep the existing background-sync
setup unchanged** (`mutations-queue`, `NetworkOnly`, `registerCapture` for
POST/PUT/PATCH/DELETE).

```ts
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  disableDevLogs: true,
  fallbacks: {
    entries: [
      {
        url: "/~offline-article",
        matcher: ({ request }) =>
          request.destination === "document" &&
          /^\/articles\/[^/]+$/.test(new URL(request.url).pathname),
      },
      {
        url: "/~offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});
```

Matcher order matters: the article-specific entry must come before the generic one.

---

## 6. Build config changes — `next.config.ts`

Add `additionalPrecacheEntries` so the fallback pages **and** the finite static routes are
precached at SW install.

```ts
const revision = process.env.NEXT_PUBLIC_BUILD_ID ?? String(Date.now());

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  additionalPrecacheEntries: [
    { url: "/~offline", revision },
    { url: "/~offline-article", revision },
    { url: "/", revision },
    { url: "/articles", revision },
    { url: "/tags", revision },
    { url: "/trash", revision },
    { url: "/review", revision },
    { url: "/profile", revision },
    { url: "/settings", revision },
  ],
});
```

> `/library` is intentionally omitted — it `permanent`-redirects to `/articles`
> (`next.config.ts` redirects). `/chat`, `/public/*`, `/subscription/*`, `/dashboard`,
> `/landing`, `/privacy` are out of scope for offline and are not precached.

### Risk & mitigation (precaching authed HTML)
Precaching a static route's HTML happens at `install`, online, with the user's session
cookie (same-origin SW fetch carries credentials), so it captures real authed HTML. This is
the highest-risk part. Since content is rendered from IndexedDB, the precached HTML is only
a shell, so a slightly stale shell is fine. **Fallback plan** if install-time precache of
authed routes proves unreliable: drop the static-route entries and rely on
`cacheOnNavigation: true` (covers visited routes only) plus the generic `/~offline` page.
This will be validated during testing (Section 8).

---

## 7. Auth guard rollout

Replace `withPageAuthRequired(X)` with `withOfflineAuth(X)` in the pages **in offline
scope**:

- `src/app/(main)/articles/page.tsx`
- `src/app/(article-details)/articles/[articleId]/page.tsx`
- `src/app/(main)/tags/page.tsx`
- `src/app/(main)/trash/page.tsx`
- `src/app/(main)/review/page.tsx`
- `src/app/(main)/settings/page.tsx`

Out-of-scope pages keep `withPageAuthRequired` unchanged: `/chat`, `/public/articles`,
`/public/articles/[articleId]`, `/(main)/library` (redirects away). `/profile` currently has
no guard and is left as-is.

---

## 8. Testing (manual — service worker)

Automated tests are impractical for SW behavior; verify manually.

1. `next build` (SW is disabled in dev) → inspect `public/sw.js` contains `fallbacks` and
   the `additionalPrecacheEntries` URLs in the precache manifest.
2. `next start`, load the app online once (lets initial sync populate IndexedDB + installs SW).
3. DevTools → Application → Service Workers → enable **Offline**.
4. Offline checks:
   - Type-URL + reload a **never-visited** `/articles/<id>` (id that exists in IndexedDB) →
     `ArticleView` renders from IndexedDB. ✅
   - Navigate each static route directly (type URL + reload): `/articles`, `/tags`, `/trash`,
     `/review`, `/settings`, `/profile`, `/`. ✅
   - `<Link>` navigation between pages → lands correctly (one reload expected). ✅
   - Launch installed PWA while offline → app opens. ✅
   - Unknown route offline → generic `/~offline` page. ✅
5. Regression:
   - Online: auth still redirects unauthenticated users to login.
   - Offline mutations (delete/move/edit highlight) queue and replay on reconnect
     (existing `mutations-queue`).
6. If step 4's static-route checks fail due to install-time auth, apply the Section 6
   fallback plan and re-test.

---

## 9. File change summary

**New**
- `src/components/article-view.tsx`
- `src/app/~offline-article/page.tsx`
- `src/app/~offline/page.tsx`
- `src/components/offline-auth-guard.tsx`

**Modified**
- `src/sw.ts` (add `fallbacks`)
- `next.config.ts` (add `additionalPrecacheEntries`)
- `src/app/(article-details)/articles/[articleId]/page.tsx` (use `ArticleView` + `withOfflineAuth`)
- 5 more `(main)` pages (swap `withPageAuthRequired` → `withOfflineAuth`)

**Untouched**
- Sync layer (`services/state.ts`, `SyncProvider`), IndexedDB (`db/*`), background-sync in `sw.ts`.
