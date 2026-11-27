# Native email/password auth — multi-PR plan

Goal: users register and sign in to Rehi with email and password, without Auth0. The Rehi backend hashes passwords and issues its own JWTs. The web app and the browser extension use those tokens. Auth0 login stays available for the long term as a second way in.

Status: plan only. Execution starts on the dev's explicit go.

## Product decisions (dev, 2026-11-27)

| Question | Decision |
|---|---|
| Auth0 | Keep it in parallel for the long term. Web shows email/password and an Auth0 button. |
| Existing Auth0 users | No migration. They can still use Auth0. Forgot-password also gives them a password, because it proves they own the email. |
| Email verification, forgot password | Both in v1. |
| Session length | Short access token (15 min) plus a rotating refresh token stored as a hash in the DB. |
| Web token storage | httpOnly cookie that Next.js owns. The browser never sees the refresh token. |
| Extension | The web hands the extension its own refresh token, on Rehi origins only. The extension refreshes on its own. |
| Domains | Web and API are on different sites (web on a host like `*.vercel.app`, API on Azure). |

## Decisions made in this plan (reversible, flip them in review)

- Login requires a verified email. This stops someone from squatting another person's address.
- `POST /auth/register` returns `409 User.EmailAlreadyExists` for a known email (`Rehi.Domain/Users/UserErrors.cs:9`). It never attaches a password to an existing row, because that would hand over an Auth0 user's data. This reveals that the email exists. Forgot-password always returns `200`.
- Emails are trimmed and lowercased at the API boundary. The unique index on `Users.Email` (`Rehi.Infrastructure/Configurations/UserConfiguration.cs:12`) is case-sensitive in Postgres.
- `IUserContext` stays email-based (`Rehi.Application/Abstraction/Authentication/IUserContext.cs`). Twenty handlers look users up by email, and email is the only key that Auth0 tokens and Rehi tokens share. Rehi tokens also carry `sub = Users.Id`, but nothing reads it yet.
- Refresh token lifetimes are 30 days for web and 90 days for the extension. Every refresh rotates the token.
- A refresh token reused within 30 seconds of its rotation is treated as a race between two tabs, not as theft. It gets a fresh pair in the same family. A reuse after 30 seconds revokes the whole family.

## Data shape

```
User (existing, Rehi.Domain/Users/User.cs)
  + PasswordHash     string?    null = no password (Auth0-only user)
  + EmailVerifiedAt  DateTime?  null = not verified

RefreshToken (new table)
  Id, UserId -> Users.Id
  TokenHash      string     SHA-256 of 32 random bytes, base64url. Unique index.
  Client         enum       Web | Extension
  FamilyId       Guid       shared by every rotation of one sign-in
  CreatedAt, ExpiresAt
  RevokedAt      DateTime?
  ReplacedById   Guid?      the token this one rotated into

EmailToken (new table)
  Id, UserId -> Users.Id
  Purpose        enum       VerifyEmail | ResetPassword
  TokenHash      string     SHA-256, unique index
  CreatedAt, ExpiresAt      24 h for VerifyEmail, 1 h for ResetPassword
  ConsumedAt     DateTime?
```

Access token: HS256 JWT signed with the existing, unused `Jwt` config section (`Secret`, `Issuer`, `Audience`, `ExpirationInMinutes` in `Rehi.Apis/appsettings.Development.json`). Claims are `sub`, `email`, and `name`. The JWT handler maps the `email` claim to `ClaimTypes.Email`, so `ClaimPrincipleExtension.GetEmail` (`Rehi.Infrastructure/Authentication/ClaimPrincipleExtension.cs:16-21`) works unchanged.

API response for login, refresh, and both exchanges:

```
TokenPair { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt }   // timestamps in epoch ms, as elsewhere in the API
```

Endpoints (new, `Rehi.Apis/Auth/`, `.AllowAnonymous()` unless noted):

| Route | Body | Result |
|---|---|---|
| `POST /auth/register` | email, password, fullName | 200. Creates the user and raises `UserRegisteredDomainEvent`. |
| `POST /auth/verify-email` | token | 200. Sets `EmailVerifiedAt`. |
| `POST /auth/resend-verification` | email | Always 200. |
| `POST /auth/login` | email, password, client | `TokenPair`. 401 for a bad password, 403 `Auth.EmailNotVerified`. |
| `POST /auth/refresh` | refreshToken | `TokenPair` (rotated). |
| `POST /auth/logout` | refreshToken | 200. Revokes the family. |
| `POST /auth/forgot-password` | email | Always 200. |
| `POST /auth/reset-password` | token, newPassword | 200. Sets the hash, sets `EmailVerifiedAt`, revokes all of the user's refresh tokens. |
| `POST /auth/extension-session` | none. Requires a Rehi access token. | `TokenPair` with `Client = Extension`. |
| `POST /auth/auth0-exchange` | none. Requires an Auth0 access token. | Finds or creates the user by email, then returns a `TokenPair` with `Client = Web`. Replaces `POST /users`. |

Email side effects go through domain events and the outbox, as `CLAUDE.md` requires. The event carries `UserId` and `Purpose`, never a raw token. The handler creates the `EmailToken`, voids older unconsumed tokens with the same purpose, and sends the link to `Rehi:WebBaseUrl` + `/verify-email?token=` or `/reset-password?token=`. An outbox retry sends a second email, and only the newest link works.

## PRs in landing order

| Id | Repo | Title | Depends on | Review-gated |
|---|---|---|---|---|
| P0 | Rehi-backend | existing branch `chore/verify-rehi-backend` | none | merge deploys, needs the dev's OK |
| B1 | Rehi-backend | `chore(verify): local mail catcher for verify-rehi-backend` | P0 | |
| B2 | Rehi-backend | `feat(auth): password, refresh-token, email-token schema` | P0 | |
| B3 | Rehi-backend | `feat(auth): register, verify email, login, refresh, logout` | B1, B2 | yes, plus `/pstack:interrogate` |
| B4 | Rehi-backend | `feat(auth): forgot and reset password` | B3 | |
| B5 | Rehi-backend | `feat(auth): extension session and Auth0 exchange` | B3 | yes |
| W1 | rehi-deploy | `refactor(auth): run the web session on Rehi tokens` | B5 | yes |
| W2 | rehi-deploy | `feat(auth): register, login, verify, and reset pages` | W1, B4 | yes |
| W3 | rehi-deploy | `feat(auth): hand an extension session to the extension` | W1, B5 | yes |
| E1 | Rehi-browser-extension | `feat(auth): refreshable session from the web app` | B5, W3 | yes, store submit needs the dev's OK |
| B6 | Rehi-backend | `chore(users): delete POST /users` | W1 live in production | |
| W4 | rehi-deploy | `chore(auth): stop the legacy FROM_PAGE token broadcast` | E1 published in the store | |

Dependency graph:

```
P0 ─┬─ B1 ─┐
    └─ B2 ─┴─ B3 ─┬─ B4 ───────────────┐
                  └─ B5 ─┬─ W1 ─┬─ W2 ─┘ (W2 needs B4 and W1)
                         │      └─ W3 ─ E1 ─ W4
                         └────────────── E1
W1 live ─ B6
```

B1 and B2 are independent and both branch from `main` after P0. B4 and B5 are independent and both branch from B3. Backend PRs stack in one Orca worktree chain. Web and extension worktrees are child worktrees of the backend worktree (`--parent-worktree`), per `CLAUDE.md`.

Every merge to `Rehi-backend/main` deploys to Azure (`.github/workflows/main.yml`). Each backend merge waits for the dev's explicit OK. Before B3 merges, the dev sets `Jwt__Secret`, `Jwt__Issuer`, `Jwt__Audience`, and `Rehi__WebBaseUrl` in the Azure app settings.

Backend verification uses `.claude/skills/verify-rehi-backend` (`scripts/verify.sh up`, `doctor`, `call`, `sql`, `down`). Each live box lists the journey file it runs. Evidence lives in `~/.cache/rehi-verify/evidence/<run-id>/`.

---

## P0 · verify skill lands on main

- [ ] Depends on nothing. The branch has one commit, `9f36175`.
- [ ] Files: `.claude/skills/verify-rehi-backend/**` only.
- [ ] Change: the skill becomes available on `main`, so every later backend branch has it.
- [ ] Result: `main` has the skill. The deploy runs and ships no code change.
- [ ] Verify: `verify.sh up` and `doctor` print all `OK` on the merged `main`. The `api-boot` and `auth-gate` journeys pass.

## B1 · local mail catcher for verify

- [ ] Depends on P0.
- [ ] Files: `Rehi.Infrastructure/Email/SendEmailService.cs`, `Rehi.Apis/appsettings.Development.json` (non-secret keys only), `.claude/skills/verify-rehi-backend/scripts/verify.sh`, `.claude/skills/verify-rehi-backend/SKILL.md`.
- [ ] Change: `SendEmailService` reads `SendEmail:Host`, `SendEmail:Port`, and `SendEmail:Security`. The defaults are `smtp.gmail.com`, `587`, and `StartTls`, which is what line 50 hardcodes today, so production behaves the same. `verify.sh up` also starts `axllent/mailpit:v1.21` with label `rehi-verify=1` and accept-any SMTP auth, then points the API at it. `doctor` checks the Mailpit container. A new `verify.sh mail-token <to> <verify|reset>` prints the token from the newest email to that address, reading the Mailpit HTTP API. This is the lever that makes email journeys rerunnable without a test-only endpoint.
- [ ] Result: email sent by the verify instance lands in Mailpit, never in Gmail.
- [ ] Unit: `dotnet build Rehi.sln` passes.
- [ ] Live: `up` and then `doctor` print all `OK`, including the Mailpit line. `down` removes the Mailpit container: `docker ps -a --filter label=rehi-verify=1` prints nothing.
- [ ] Perf: n/a. No request path changes.

## B2 · auth schema

- [ ] Depends on P0.
- [ ] Files: `Rehi.Domain/Users/User.cs`, new `Rehi.Domain/Users/RefreshToken.cs`, `Rehi.Domain/Users/EmailToken.cs`, new configurations in `Rehi.Infrastructure/Configurations/`, `Rehi.Infrastructure/Database/ApplicationDbContext.cs`, `Rehi.Application/Abstraction/Data/IDbContext.cs`, a new migration `AddNativeAuth` (`dotnet ef migrations add AddNativeAuth -p Rehi.Infrastructure -s Rehi.Apis`).
- [ ] Change: the data shape above. No endpoint reads it yet.
- [ ] Result: the database has the new columns and tables. Existing rows get `PasswordHash = null` and `EmailVerifiedAt = null`.
- [ ] Unit: `dotnet build Rehi.sln` passes.
- [ ] Live: `doctor` prints the migration line `OK` with the new count. `verify.sh sql` on `information_schema.columns` lists `PasswordHash` and `EmailVerifiedAt` on `Users`, and the tables `RefreshTokens` and `EmailTokens`. The `api-boot` journey passes.
- [ ] Perf: n/a.

## B3 · register, verify, login, refresh, logout

- [ ] Depends on B1 and B2.
- [ ] Files: `Rehi.Infrastructure/DependencyInjection.cs` (`AddAuthenticationInternal`), new `Rehi.Infrastructure/Authentication/{RehiJwtOptions,TokenIssuer,PasswordHasher}.cs`, new `Rehi.Application/Abstraction/Authentication/{ITokenIssuer,IPasswordHasher}.cs`, new slices under `Rehi.Application/Auth/{Register,VerifyEmail,ResendVerification,Login,Refresh,Logout}/`, the domain event and its handler for the verification email, new endpoints in `Rehi.Apis/Auth/`, `Rehi.Apis/Program.cs` (rate limiter), `Rehi.Infrastructure/Rehi.Infrastructure.csproj` (`Microsoft.Extensions.Identity.Core` 8.x for `PasswordHasher<T>`), verify feature files.
- [ ] Change: two JWT bearer schemes behind one policy scheme. Its `ForwardDefaultSelector` reads the token's `iss` without validating it, then sends Rehi-issued tokens to the `Rehi` scheme and everything else to the existing Auth0 scheme. Each scheme then validates the token fully. Add the six endpoints. Add `AddRateLimiter` with fixed windows per client IP: login 10 per minute, register 5 per minute, resend 5 per minute. Add `UseForwardedHeaders` so Azure's `X-Forwarded-For` gives the real IP.
- [ ] Feature map, which the dev asked for:
  - [ ] New `features/native-auth.md`. Register `verify@rehi.test`, then `mail-token` gives the token, then verify-email, then login with `client=web`, then `export REHI_VERIFY_TOKEN` from the body. Then refresh, which rotates. The old refresh token used again after 30 s revokes the family. Logout. Negative cases: wrong password returns 401, an unverified login returns 403, a duplicate register returns 409, and a short password returns 400.
  - [ ] `features/auth-gate.md`. Add `gate-rehi-token-200` and `gate-forged-rehi-401`, a token signed with a different secret. That token comes from the running app with the wrong config, never from a hand-written JWT. If that is not possible, use a tampered signature byte. Rerun the whole journey, as its gotcha requires.
  - [ ] `features/save-article.md`, `tags.md`, `highlights.md`. Replace the BLOCKED preconditions with "run `native-auth` through Login". Swap the `POST /users` onboarding step for register.
  - [ ] `features/README.md` and `SKILL.md` "Authentication". Remove the BLOCKED wording and say that tokens come from `native-auth`.
- [ ] Result: a client can register, verify, sign in, and call every existing endpoint with a Rehi token. Auth0 tokens still work.
- [ ] Unit: `dotnet build Rehi.sln` passes.
- [ ] Live: the `native-auth`, `auth-gate`, `save-article`, `tags`, and `highlights` journeys all pass from one fresh `up`. The evidence shows each `.status`, plus SQL reads of `Users."EmailVerifiedAt"` and `RefreshTokens."RevokedAt"`. Two parallel `POST /auth/refresh` calls with the same token both return 200 (race grace). Login 11 times in one minute, and the 11th call returns 429.
- [ ] Perf: the metric is `POST /auth/login` latency, which is dominated by PBKDF2. The probe is 20 sequential logins on the verify instance, timed with `curl -w %{time_total}`, and you report p50 and max. There is no trunk baseline because the endpoint is new. It fails if p50 is above 500 ms. Existing routes have no baseline either, because trunk cannot mint a token.
- [ ] Review: run `/pstack:interrogate` on this PR before merge. Focus on scheme selection making a route anonymous, refresh reuse, user enumeration, and rate-limit bypass.

## B4 · forgot and reset password

- [ ] Depends on B3.
- [ ] Files: `Rehi.Application/Auth/{ForgotPassword,ResetPassword}/`, the reset email event handler, `Rehi.Apis/Auth/` endpoints, new `features/password-reset.md`, `features/README.md`.
- [ ] Change: two endpoints, rate limited at 5 per minute.
- [ ] Result: a user who forgot their password, or an Auth0-only user, sets a password through an email link.
- [ ] Unit: `dotnet build Rehi.sln` passes.
- [ ] Live: the `password-reset` journey. Forgot-password for a registered user gets a token from `mail-token`, then reset. The old password returns 401, the new one returns 200, and the refresh token issued before the reset returns 401. Forgot-password for an unknown email returns 200 and Mailpit has no new message. A reused reset token returns 400.
- [ ] Perf: n/a.

## B5 · extension session and Auth0 exchange

- [ ] Depends on B3.
- [ ] Files: `Rehi.Application/Auth/{CreateExtensionSession,ExchangeAuth0}/`, `Rehi.Apis/Auth/` endpoints, each pinned to one scheme with `RequireAuthorization(policy)`, new `features/extension-session.md`, and an `auth0-exchange` section.
- [ ] Change: `extension-session` accepts only a Rehi token. `auth0-exchange` accepts only an Auth0 token, then finds or creates the user by the token's email, never the body's. That closes the hole in today's `POST /users`, which trusts the body email (`Rehi.Application/Users/CreateUser.cs:18-27`).
- [ ] Result: web can turn an Auth0 login into a Rehi session, and it can mint an extension session.
- [ ] Unit: `dotnet build Rehi.sln` passes.
- [ ] Live: in the `extension-session` journey, a Rehi web token gets a pair whose `RefreshTokens."Client"` is `Extension`, and refreshing that token works. `auth0-exchange` with a Rehi token returns 401. `auth0-exchange` with an Auth0 token is **BLOCKED** locally because the verify instance cannot mint one. The dev checks it in W1's live box.
- [ ] Perf: n/a.

## W1 · web session on Rehi tokens

- [ ] Depends on B5, deployed for production. The dev's local backend is enough for development.
- [ ] Files: new `src/app/api/auth/{login,token,logout,extension-session}/route.ts`, new `src/lib/session.ts` (cookie helpers on the server, plus an in-memory access token with single-flight refresh on the client), new `src/hooks/use-session.ts`, `src/lib/auth0.ts` (`onCallback` calls `auth0-exchange` and sets the Rehi cookie instead of `POST /users`), `src/lib/http.ts`, `src/components/offline-auth-guard.tsx`, and the `useUser` and `withPageAuthRequired` callers. Those are `src/app/(main)/library/page.tsx`, `(main)/profile/page.tsx`, `chat/page.tsx`, `dashboard/page.tsx`, `landing/page.tsx`, `public/articles/page.tsx`, `public/articles/[articleId]/page.tsx`, `src/components/app-sidebar.tsx`, `providers.tsx`, and `user-guide-page.tsx`.
- [ ] Change: the cookie `rehi_session` holds the refresh token. It is httpOnly, `Secure` in production, `SameSite=Lax`, with `Path=/api/auth`. `POST /api/auth/token` refreshes, rotates the cookie, and returns `{ accessToken, expiresAt, user: { email, name } }`. `http.ts` gets its token from `session.ts`, not from `getAccessToken()`. The guards redirect to `/auth/login` for now, and W2 switches that to `/login`. Offline behavior stays fail-open, as in `offline-auth-guard.tsx:29-46`. Logout revokes the Rehi session, then ends the Auth0 session if `auth0.getSession()` has one.
- [ ] Result: Auth0 users see no change, and every API call now carries a Rehi token.
- [ ] Unit: `npm run lint` and `npm run build` pass.
- [ ] Live, in a browser against the local backend with a real Auth0 account: sign in through Auth0, land on `/library`, and see the articles. DevTools shows the `Authorization` header token with `iss` equal to the Rehi issuer. The `rehi_session` cookie is httpOnly. Wait 16 minutes or delete the in-memory token, then load the library again, and it works with a new cookie value. Two tabs refresh at once and neither is logged out. Logout returns to the landing page, and `/library` redirects to login. Offline, `/library` still renders from IndexedDB.
- [ ] Perf: the metric is time to first library data after a hard reload. The probe is the Network panel, from navigation start to the first `/states` response, measured 5 times. Measure the trunk baseline first. It fails if the median grows by more than 300 ms.

## W2 · native auth pages

- [ ] Depends on W1 and B4.
- [ ] Files: new `src/app/(auth)/{login,register,verify-email,forgot-password,reset-password}/page.tsx` built from existing shadcn primitives (`components.json`), `src/app/api/auth/register/route.ts`, `src/services/auth-service.ts`, `src/middleware.ts` (only if a matcher change is needed), and link changes from `/auth/login` to `/login` in `landing/page.tsx`, `user-guide-page.tsx`, and the guards.
- [ ] Change: email/password forms, plus a "Continue with Auth0" button that links to `/auth/login`.
- [ ] Result: a new user registers, gets the email, verifies, and signs in without Auth0.
- [ ] Unit: `npm run lint` and `npm run build` pass.
- [ ] Live, in a browser against a local backend with SMTP pointed at Mailpit: register `w2@rehi.test`, open the link from Mailpit, sign in, and see an empty library. Wrong password shows an inline error and no redirect. An unverified login shows "check your email" with a resend button. Forgot password, then the link, then a new password lets you sign in. The Auth0 button still works.
- [ ] Perf: n/a. These are new pages with no baseline.

## W3 · extension handoff from the web

- [ ] Depends on W1 and B5.
- [ ] Files: new `src/components/extension-bridge.tsx`, mounted in `providers.tsx`, `src/app/api/auth/extension-session/route.ts`, `landing/page.tsx`, and `user-guide-page.tsx`.
- [ ] Change: the extension's content script posts `REHI_EXTENSION_READY`. Only then, and only for a signed-in user, the bridge fetches an extension session and posts `{ type: "REHI_EXTENSION_SESSION", refreshToken }` to `window.location.origin`. The legacy `FROM_PAGE` post stays, now with a Rehi access token, so old extension builds keep working until W4.
- [ ] Result: the web mints an extension session only when the extension asks for one.
- [ ] Unit: `npm run lint` and `npm run build` pass.
- [ ] Live, in a browser with the E1 dev build loaded: signing in gives the extension a session, and the extension's `RefreshTokens` row has `Client = Extension`. With no extension installed, the network log shows no `extension-session` call.
- [ ] Perf: n/a.

## E1 · extension session with refresh

- [ ] Depends on B5 and W3.
- [ ] Files: `src/contents/access-token.ts`, replaced by `src/contents/rehi-session.ts` with `matches` set to the Rehi web origins and an `event.origin` allowlist check. New `src/auth/session.ts` (stores `{ refreshToken }`, keeps the access token in memory, single-flight refresh, and drops the session on a 401 from refresh). `src/background.ts` (the three `chrome.storage.local.get(["jwt"])` reads at lines 64, 96, and 137), `src/popup.tsx` (status, a login link to `${WEB_URL}/login?from=extension`, and logout), `src/axios-client.ts`, and `.env` keys `PLASMO_PUBLIC_API_URL` and `PLASMO_PUBLIC_WEB_URL`.
- [ ] Change: as listed. Also fix the base URL. `axios-client.ts:6` reads `NEXT_PUBLIC_API_URL`, which Plasmo does not inline (inferred), and the popup hardcodes `http://localhost:3000` (`popup.tsx:20`).
- [ ] Result: the extension stays signed in for 90 days, and other sites can no longer replace its token.
- [ ] Unit: `pnpm build` passes.
- [ ] Live, with `build/chrome-mv3-dev` loaded: sign in on the web, then save an article from a page, and it appears in the library. Clear the in-memory token by restarting the service worker in `chrome://extensions`, then save again, and it works through a refresh. Post `REHI_EXTENSION_SESSION` from a non-Rehi page with the DevTools console, and storage stays unchanged. Logout in the popup revokes the token, and a save then prompts for login.
- [ ] Perf: n/a.
- [ ] Release: the store submission (`.github/workflows/submit.yml`) waits for the dev's OK.

## B6 · delete POST /users

- [ ] Depends on W1 being live in production. The only caller is `rehi-deploy/src/lib/auth0.ts:38`, and the extension has none.
- [ ] Files: `Rehi.Apis/Users/CreateUser.cs`, `Rehi.Application/Users/CreateUser.cs`, and the verify feature files that mention it.
- [ ] Change: delete the endpoint and the slice.
- [ ] Unit: `dotnet build Rehi.sln` passes.
- [ ] Live: `POST /users` returns 404 or 405. `save-article` and `native-auth` pass.
- [ ] Perf: n/a.

## W4 · drop the legacy FROM_PAGE broadcast

- [ ] Depends on E1 being published, and on the dev confirming that old extension builds can be dropped.
- [ ] Files: `landing/page.tsx`, `user-guide-page.tsx`, and `extension-bridge.tsx`.
- [ ] Change: delete the `FROM_PAGE` post.
- [ ] Unit: `npm run lint` and `npm run build` pass.
- [ ] Live: a page search for `FROM_PAGE` in the built output finds nothing. The E1 handoff still works.
- [ ] Perf: n/a.

---

## Unproven, and what the dev provides

- The production web origin. E1 `matches`, W3, and backend `Rehi:WebBaseUrl` need it. It is a placeholder until the dev names it.
- Whether Auth0 access tokens carry `email_verified`. `auth0-exchange` trusts the Auth0 email claim, as the backend does today. An unverified Auth0 database user could claim a native account with the same email. Check the Auth0 Action that adds `email`, and if possible add `email_verified` and require it in B5.
- `auth0-exchange` with a real Auth0 token. It cannot run on the verify instance, so W1's live box covers it with the dev's account.
- Production config: the `Jwt` secret, SMTP, and Azure forwarded headers. The verify instance cannot reach any of them.
- CORS in production. The code allows only `http://localhost:3000` (`Rehi.Apis/DependencyInjection.cs:16`). The browser calls the API directly, so production CORS presumably lives in the Azure portal (inferred). Check before W1 ships.

## Appendix: wire contract (fixed 2026-11-27 before parallel work)

Backend, web, and extension are built in parallel against this contract. Change it only by editing this section and telling every owner.

- Success bodies use the existing envelope from `Rehi.Apis/Results/ApiResult.cs` (`{ isSuccess: true, data }`). Failures are the existing ProblemDetails from `Rehi.Apis/Results/CustomeResult.cs`, whose `title` is the error code. Clients branch on HTTP status plus `title`.
- `TokenPair` JSON: `{ "accessToken": string, "accessTokenExpiresAt": number, "refreshToken": string, "refreshTokenExpiresAt": number }`. Times are epoch milliseconds.
- `client` in `POST /auth/login` is the string `"web"` or `"extension"`.
- Error codes and statuses:
  - `Auth.InvalidCredentials` 401: unknown email, wrong password, or a user with no password.
  - `Auth.EmailNotVerified` 403: needs a new `ErrorType.Forbidden` mapped to 403 in `CustomeResult.cs`.
  - `User.EmailAlreadyExists` 409 on register.
  - `Auth.InvalidRefreshToken` 401: unknown, expired, revoked, or reused outside the grace window.
  - `Auth.InvalidEmailToken` 400: unknown, expired, or consumed verify or reset token.
  - Validation failures 400 through the existing FluentValidation pipeline. Password is 8 to 128 characters.
  - Rate limit 429 with no body contract.
- Request bodies (camelCase JSON):
  - register `{ email, password, fullName }`
  - verify-email `{ token }`
  - resend-verification `{ email }`
  - login `{ email, password, client }`
  - refresh `{ refreshToken }`
  - logout `{ refreshToken }`
  - forgot-password `{ email }`
  - reset-password `{ token, newPassword }`
  - extension-session and auth0-exchange take no body.
- Access token claims: `iss` = `Jwt:Issuer`, `aud` = `Jwt:Audience`, `sub` = `Users.Id`, `email`, `name`, `exp`.
- Email links: `{Rehi:WebBaseUrl}/verify-email?token=<token>` and `{Rehi:WebBaseUrl}/reset-password?token=<token>`. The token is base64url.
- Web to extension messages, both through `window.postMessage` with target origin `window.location.origin`:
  - The extension content script posts `{ type: "REHI_EXTENSION_READY" }`.
  - The web replies `{ type: "REHI_EXTENSION_SESSION", refreshToken }`. It replies only for a signed-in user, after it gets a pair from `POST /api/auth/extension-session`.
- Web Next route handlers: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/token` (returns `{ accessToken, expiresAt, user: { email, name } }`, or 401), `POST /api/auth/logout`, `POST /api/auth/extension-session`. The cookie is `rehi_session`.
- Amendment 1 (2026-11-27, after E1): the extension's READY can fire before the web bridge mounts. On mount, the web bridge posts `{ type: "REHI_EXTENSION_PING" }` to `window.location.origin`. A content script with no session answers a PING with READY, just as it does on load. The web still replies only for a signed-in user.
