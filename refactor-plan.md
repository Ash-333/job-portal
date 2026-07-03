# Refactor Plan — Job Portal Monorepo

> Generated after exhaustive audit of `server/`, `portal/`, and `admin/`.
> Organized by project, then by priority within each project.

---

## Priority Legend

| Level | Definition |
|-------|-----------|
| **🔴 CRITICAL** | Bug or security flaw — breaks functionality in production |
| **🟠 HIGH** | Major duplication, architectural violation, or performance issue |
| **🟡 MEDIUM** | Code quality, consistency, or maintainability improvement |
| **🟢 LOW** | Polish, minor patterns, cleaning |

---

# Server (`server/`)

## 🔴 CRITICAL

### S-C01 — TLS `rejectUnauthorized: false` in production
- **Location:** `src/lib/email.ts:14`
- **Issue:** `tls: { rejectUnauthorized: false }` disables TLS certificate validation for all environments. The comment says "For development only" but there's no env check.
- **Fix:** Only disable in development: `tls: { ...(process.env.NODE_ENV !== 'production' && { rejectUnauthorized: false }) }`.

### S-C02 — Verification/reset tokens logged to console
- **Location:** `src/lib/email.ts:233,257`
- **Issue:** `console.log(\`🔑 Verification token: ${token}\`)` — tokens that can hijack accounts are written to console logs.
- **Fix:** Remove `console.log` lines or only log in debug mode.

### S-C03 — Route handler mutates DB directly
- **Location:** `src/routes/jobs.ts:123-128`
- **Issue:** `await db.job.update({ where: { slug }, data: { viewCount: { increment: 1 } } })` — direct Prisma call in a route handler, violating the Route→Controller→Service pattern.
- **Fix:** Create `jobService.incrementViewCount(slug)` and call it from a controller.

### S-C04 — `require()` inside route handler
- **Location:** `src/routes/jobs.ts:101`
- **Issue:** `const { JOB_CATEGORIES } = require('../schemas/job')` — mixing `import` and `require()` and doing it inside a handler instead of top-level.
- **Fix:** Move to top-level `import`.

### S-C05 — No Zod validation on subscription/sponsored endpoints
- **Location:** `src/controllers/subscriptionController.ts:23,30,75,82` · `src/controllers/employerSubscriptionController.ts:14`
- **Issue:** `req.body` passed directly to services without Zod validation. Violates project convention ("Validate every input with Zod").
- **Fix:** Add Zod schemas and use `.parse(req.body)`.

### S-C06 — `catch(() => {})` swallows errors silently (17+ occurrences)
- **Locations:** `src/services/authService.ts:35,74,215,256` · `jobService.ts:190-193,246-249,266-269,420-424,441-444,472-475` · `blogService.ts:119-123,179-183,196-200` · `adminService.ts:98-102,121-125,142-146` · `subscriptionService.ts:45-49,74-78,92-96,153-157,172-176,304-308,326-330,341-345` · `applicationService.ts:187-195,258-266`
- **Issue:** Fire-and-forget promises (email sends, audit logs) have `.catch(() => {})` — ALL errors are silently swallowed. Failures go completely undetected.
- **Fix:** At minimum log with `console.error` or `logger.error`. Better: use a dedicated error handler for background tasks.

### S-C07 — Duplicate pagination helper in applicationService
- **Location:** `src/services/applicationService.ts:272-278` vs `src/lib/utils.ts:62-81`
- **Issue:** Local reimplementation of `createPaginationResult` instead of importing from `lib/utils.ts`.
- **Fix:** Delete local copy and import from `../lib/utils`.


## 🟠 HIGH

### S-H01 — Duplicate application status change logic
- **Location:** `src/services/applicationService.ts:152-198` (employer) vs `227-269` (admin)
- **Issue:** Both functions are ~85% identical (same findUnique, status check, update, log, email). Only the ownership check differs.
- **Fix:** Extract a shared `_changeApplicationStatus(appId, newStatus, actorId, ip, ua)` private function.

### S-H02 — HTML sanitization pattern repeated 6x
- **Locations:** `src/services/jobService.ts:160-164,174,208-227,343-347,389-403` · `src/services/blogService.ts:105-113,143-172`
- **Issue:** `sanitizeTextOnly(title)` + `sanitizeRichText(description/content)` + mapping arrays — repeated verbatim in 6 functions.
- **Fix:** Create `sanitizeJobFields()` and `sanitizeBlogFields()` helpers, or a generic `sanitizeFields(data, fieldConfig)`.

### S-H03 — Duplicate file validation in upload routes
- **Location:** `src/routes/upload.ts:52-66,132-146,245-259,322-336`
- **Issue:** Same 3-step pattern (type check → magic byte check → size check) repeated 4 times with different params.
- **Fix:** Create `validateUpload(file, { allowedTypes, maxSize })` helper.

### S-H04 — `getJobBySlug` does 2 DB round-trips for every view
- **Location:** `src/routes/jobs.ts:125-128` + `src/services/jobService.ts:101-121`
- **Issue:** View count increment is a separate DB call from the job fetch. Could combine into a single `update` with `include`.
- **Fix:** Move increment into the service's `getJobBySlug` and use `update({ where: { slug }, data: { viewCount: { increment: 1 } }, include: {...} })`.

### S-H05 — Inconsistent response shapes across endpoints
- **Locations:** Various
  - `routes/jobs.ts:64`: `{ jobs, pagination }`
  - `routes/blogs.ts:23`: `{ blogs, pagination }`
  - `routes/user.ts:58`: `{ data, pagination }`
  - `controllers/adminController.ts:26`: `{ data, pagination }`
  - `controllers/employerController.ts:23`: `{ data, pagination }`
- **Issue:** Some wrap in `{ entity_name, pagination }`, others return `{ data, pagination }`. Inconsistent API contract for frontend consumers.
- **Fix:** Standardize on one format (recommended: `{ data, pagination }`).

### S-H06 — `ensureBucketExists` called on every upload
- **Location:** `src/lib/supabase.ts:52`
- **Issue:** Lists all Supabase buckets and checks existence on every single file upload — unnecessary API call overhead.
- **Fix:** Cache the result after first check, or set up bucket once at startup.

### S-H07 — `process.exit()` prevents graceful shutdown
- **Location:** `src/index.ts:189-190,194-195`
- **Issue:** `process.exit(0)` in SIGTERM/SIGINT handlers aborts in-flight requests and DB connections.
- **Fix:** `server.close(() => process.exit(0))`.

### S-H08 — Magic numbers in rate limiter configs
- **Location:** `src/index.ts:37-63`
- **Issue:** `max: 100`, `max: 5`, `max: 3`, `max: 10` — unnamed magic numbers.
- **Fix:** Define named constants: `GLOBAL_RATE_LIMIT = 100`, `AUTH_RATE_LIMIT = 5`, etc.

### S-H09 — Missing compound DB indexes
- **Location:** `prisma/schema.prisma`
- **Issue:** Common queries filter by `[jobId, status]` on `Application` and `[postedById, status]` on `Job` but only single-column indexes exist.
- **Fix:** Add compound indexes: `@@index([jobId, status])` on `Application`, `@@index([postedById, status])` on `Job`.

### S-H10 — `_` used for password exclusion 7 times — should be a helper
- **Locations:** `src/services/authService.ts:100,109,154,183,193` · `src/services/userService.ts:38,66`
- **Issue:** `const { password: _, ...userWithoutPassword } = user` repeated 7 times across 2 files.
- **Fix:** Create `excludePassword(user)` utility function.

### S-H11 — Production Hardening (CORS & Cookies)
- **Location:** `src/index.ts`
- **Issue:** Need strict CORS and secure cookies for production deployment.
- **Fix:** Verify CORS strictly whitelists production domains. Ensure JWT cookies are set with `Secure: true` and `SameSite: 'strict'` in production.

### S-H12 — Zero Automated Testing Strategy
- **Location:** All services
- **Issue:** With 113+ refactor items touching core auth, payment, and application flows, there are zero tests. Refactoring without tests is highly risky.
- **Fix:** Add basic unit tests (Jest/Vitest) for the most critical backend services before refactoring.


## 🟡 MEDIUM

### S-M01 — Files that should be split
| File | Lines | Recommendation |
|------|-------|---------------|
| `prisma/seed.ts` | 975 | Split by domain (users, jobs, applications, blogs, subscriptions) |
| `src/lib/email.ts` | 358 | Extract HTML email templates to separate files |
| `src/services/jobService.ts` | 621 | Split into `jobService.ts`, `employerJobService.ts`, `adminJobService.ts`, `dashboardService.ts` |
| `src/routes/admin.ts` | 587 | Already mostly route definitions — borderline acceptable |

### S-M02 — Missing controller layer for sponsored/companies routes
- **Locations:** `src/routes/sponsored.ts:6-11` · `src/routes/companies.ts`
- **Issue:** These routes call services directly without a controller layer, breaking the Route→Controller→Service pattern.
- **Fix:** Add `sponsoredController` and `companiesController`.

### S-M03 — Dead/unused code
| Item | Location | Action |
|------|----------|--------|
| `index-minimal.ts` | `src/index-minimal.ts` | Delete (historical artifact) |
| `logout` service function | `src/services/authService.ts:284-286` | Delete or wire up properly |
| `getPlanBySlug` | `src/services/subscriptionService.ts:17-21` | Delete (never called) |
| `test-db.js`, `test-server.js` | root directory | Delete (dev artifacts) |
| `@radix-ui/react-alert-dialog` | `package.json:23` | Remove (not a server dependency) |
| `LoginInput` import | `src/services/authService.ts:6` | Remove (unused import) |

### S-M04 — Hardcoded Swagger URL
- **Location:** `src/index.ts:116`
- **Issue:** `url: \`http://localhost:${PORT}\`` — won't work behind a proxy or custom domain.
- **Fix:** Use `process.env.API_URL || \`http://localhost:${PORT}\``.

### S-M05 — No `--transpile-only` in dev script
- **Location:** `nodemon.json:5`
- **Issue:** `ts-node` does full type-checking on every restart, slowing dev iteration.
- **Fix:** Change to `ts-node --transpile-only`.

### S-M06 — Inconsistent error object construction
- **Location:** `src/controllers/authController.ts:77`
- **Issue:** `throw Object.assign(new Error('Admin access required'), { statusCode: 403 })` instead of using `createError()` helper.
- **Fix:** Use `createError('Admin access required', 403)`.

### S-M07 — Missing rate limiting on test-email endpoint
- **Location:** `src/routes/auth.ts:370`
- **Issue:** The `/api/auth/test-email` endpoint can be spammed to send many emails.
- **Fix:** Apply rate limiter (3 req/15m).

### S-M08 — JSON-LD structuredData not validated
- **Location:** `src/schemas/jobs.ts` (blog schema)
- **Issue:** `structuredData: z.any().optional()` accepts any JSON without validation.
- **Fix:** Use `z.object({...})` or at minimum `z.record(z.unknown())`.

### S-M09 — Unused path alias `@/`
- **Location:** `tsconfig.json:25-27`
- **Issue:** `"@/*": ["src/*"]` configured but zero imports use it (all relative paths).
- **Fix:** Either use it consistently or remove the config.

### S-M10 — tsconfig produces unnecessary declaration files
- **Location:** `tsconfig.json:13-14`
- **Issue:** `declaration: true` and `declarationMap: true` produce `.d.ts` files that aren't needed for a backend service.
- **Fix:** Set to `false` unless the project is published as a library.

### S-M11 — `getEmployerDashboardStats` / `getAdminDashboardStats` too large
- **Location:** `src/services/jobService.ts:512-582,586-621`
- **Issue:** Each runs 7-9 parallel queries. Too many concerns in one function.
- **Fix:** Split into `getEmployerJobCounts(id)`, `getEmployerViews(id)`, `getEmployerRecentApplications(id)`, etc.

### S-M12 — `updateEmployerJobSchema` doesn't validate URL for companyWebsite
- **Location:** `src/schemas/employer.ts:20-22`
- **Issue:** `companyWebsite: z.string().optional()` — no URL validation, unlike the admin job schema which uses `z.string().url()`.
- **Fix:** Add `.url('Invalid URL')` validation.

### S-M13 — Missing max length validation on companyName in registerEmployerSchema
- **Location:** `src/schemas/employer.ts:16`
- **Issue:** `companyName: z.string().min(1, 'Company name is required')` — no max length.
- **Fix:** Add `.max(100)`.

### S-M14 — The Dead `CVUnlock` Model
- **Location:** `prisma/schema.prisma`
- **Issue:** The `CVUnlock` database model exists but has zero backend logic and zero UI.
- **Fix:** Either implement the missing backend/UI for employers to pay-to-unlock CVs, or delete the dead model from the schema.


## 🟢 LOW

### S-L01 — Migration date inconsistency
- **Location:** `prisma/migrations/`
- **Issue:** `20250126000000_update_experience_levels` predates `20250525031248_init`.
- **Fix:** Rename migration folder to correct chronology.

### S-L02 — Inconsistent semicolons
- **Files:** `src/lib/supabase.ts`, `src/lib/email.ts`, `prisma/seed.ts`
- **Issue:** Some files omit semicolons while most files use them.
- **Fix:** Add a linter rule and auto-fix.

### S-L03 — Missing `.env.example` file
- **Location:** `.env.example` does not exist
- **Issue:** No template for required env vars. New developers must reverse-engineer from source code.
- **Fix:** Create `.env.example` with all documented variables.

### S-L04 — `jobFiltersSchema` missing salaryCurrency filter
- **Location:** `src/schemas/job.ts`
- **Issue:** Jobs support `currency` field but it's not filterable in the schema.

---

# Portal (`portal/`)

## 🔴 CRITICAL

### P-C01 — `document.execCommand()` deprecated
- **Location:** `src/components/ui/rich-text-editor.tsx:38`
- **Issue:** `document.execCommand()` is deprecated by all major browsers and will eventually stop working.
- **Fix:** Migrate to a modern rich-text library (TipTap, Slate, Quill) or use the `beforeinput` event + `contentEditable` approach.

### P-C02 — Job form 85% duplicated between new and edit
- **Locations:** `src/app/dashboard/employer/jobs/new/page.tsx` · `src/app/dashboard/employer/jobs/[id]/edit/page.tsx`
- **Issue:** ~85% of the JSX form structure is duplicated (same Card/FormField layout, same 15+ fields).
- **Fix:** Extract a shared `<JobForm />` component.

### P-C03 — CompanyPage uses raw `useEffect`+`useState` for data fetching
- **Location:** `src/app/companies/[companySlug]/page.tsx:20-34`
- **Issue:** Violates the "never fetch server data with useEffect + useState" rule.
- **Fix:** Either convert to a Server Component or use TanStack Query `useQuery`.

### P-C04 — Application history uses raw `useState`/`useEffect` for data fetching
- **Location:** `src/app/dashboard/applications/page.tsx:84-101`
- **Issue:** `toggleHistory` manually fetches application history with raw `useState` instead of TanStack Query.
- **Fix:** Use `useQuery` with a unique key per application ID.

### P-C05 — Status badge/config logic duplicated 5x
- **Locations:** `src/app/dashboard/employer/page.tsx:29-36` · `src/app/dashboard/employer/jobs/page.tsx:64-71` · `src/app/dashboard/employer/jobs/[id]/page.tsx:92-99,103-112` · `src/app/dashboard/applications/page.tsx:29-39`
- **Issue:** Identical switch-case mappings from status enum → color/label redefined 5 times.
- **Fix:** Extract a shared constant/function in `lib/constants.ts`.

### P-C06 — DOMPurify SSR Crash in Next.js
- **Location:** `src/components/jobs/job-details-client.tsx` · `src/components/blog/blog-details-client.tsx`
- **Issue:** DOMPurify requires a browser DOM; importing it at module level crashes SSR.
- **Fix:** Replace with `isomorphic-dompurify` or dynamically import sanitization to run only on the client.


## 🟠 HIGH

### P-H01 — Dashboard sidebar layouts duplicated
- **Locations:** `src/app/dashboard/layout.tsx:76-155` · `src/app/dashboard/employer/layout.tsx:85-157`
- **Issue:** ~70% of sidebar JSX is identical (mobile overlay, fixed sidebar, header with logo, nav list, profile card).
- **Fix:** Extract a shared `DashboardSidebar` component with slot-based navigation items.

### P-H02 — `Promise<any>` in API methods
- **Location:** `src/lib/api.ts:448,691,706`
- **Issue:** Methods return `Promise<any>` instead of typed interfaces.
- **Fix:** Define return types for all API methods.

### P-H03 — `window.location.href`/`.reload()` used instead of router
- **Locations:** `src/app/page.tsx:139` · `src/app/jobs/page.tsx:270` · `src/app/dashboard/applications/page.tsx:189` · `src/app/blogs/page.tsx:72`
- **Issue:** Full page reloads instead of client-side navigation/refetch.
- **Fix:** Use `router.push()` or `queryClient.invalidateQueries()`.

### P-H04 — Inline query keys not centralized
- **Locations:** Multiple page files — `['my-applications']`, `['featured-jobs']`, `['job-categories']`, `['blogs', currentPage]`, etc.
- **Issue:** Query keys are inline strings. Changing a key in one place won't invalidate related queries.
- **Fix:** Create a query key factory (like the existing `employerKeys` in `features/employer/queries.ts`).

### P-H05 — Auth context not memoized
- **Location:** `src/hooks/use-auth.tsx:197-209`
- **Issue:** The context value object is recreated on every `AuthProvider` render, causing all consumers to re-render.
- **Fix:** Wrap with `useMemo`.

### P-H06 — Stale `console.log` statements
- **Locations:** `src/app/jobs/[slug]/page.tsx:12,16,51` · `src/components/blog/blog-details-client.tsx:35`
- **Issue:** Debug console logs left in production code.
- **Fix:** Remove.

### P-H07 — Non-functional newsletter forms
- **Locations:** `src/components/layout/footer.tsx:51-66` · `src/app/blogs/page.tsx:226-241`
- **Issue:** Email subscription forms clear input on submit but don't send data anywhere.
- **Fix:** Either implement the API endpoint and wire it up, or remove the forms.

### P-H08 — BackButton pattern repeated 6x
- **Locations:** All dashboard pages, company page, blog detail page
- **Issue:** `<Button variant="ghost"> + ArrowLeft + Link` repeated verbatim.
- **Fix:** Extract a `<BackButton href="..." />` component.


## 🟡 MEDIUM

### P-M01 — EmptyState pattern repeated 8x
- **Locations:** Various list pages — identical pattern of icon + title + description + action button.
- **Fix:** Extract a reusable `<EmptyState>` component.

### P-M02 — Avatar fallback initials logic repeated 4x
- **Locations:** `src/components/layout/header.tsx:108` · `src/app/dashboard/layout.tsx:64-66` · `src/app/dashboard/profile/page.tsx:251` · `src/app/dashboard/employer/layout.tsx:73-75`
- **Issue:** `user.firstName?.charAt(0) + user.lastName?.charAt(0)` logic scattered.
- **Fix:** Extract `getInitials(user)` utility.

### P-M03 — Password visibility toggle pattern duplicated 3x
- **Locations:** `src/app/auth/login/page.tsx:100-113` · `register/page.tsx:282-295` · `reset-password/page.tsx:163-171,194-202`
- **Issue:** Eye/EyeOff toggle button duplicated in multiple auth forms.
- **Fix:** Extract a `<PasswordInput>` component.

### P-M04 — Stat card pattern repeated 6x
- **Locations:** `src/app/dashboard/page.tsx:62-115` · `dashboard/employer/page.tsx:134-153` · `dashboard/applications/page.tsx:119-141` · `app/page.tsx:182-201`
- **Issue:** Icon container + label + value card pattern duplicated.
- **Fix:** Extract a `<StatCard>` or `<StatsGrid>` component.

### P-M05 — `confirm()` dialog for deletion instead of AlertDialog
- **Location:** `src/app/dashboard/employer/jobs/page.tsx:46`
- **Issue:** Uses native browser `confirm()` instead of shadcn `AlertDialog`.
- **Fix:** Replace with `AlertDialog`.

### P-M06 — File upload bypasses shared request method
- **Location:** `src/lib/api.ts:633-664`
- **Issue:** `uploadFile` duplicates auth injection and error handling from the `request<T>` method. If token handling changes, uploads won't be updated.
- **Fix:** Refactor to reuse the shared request infrastructure.

### P-M07 — `/companies/[companySlug]` should be a Server Component
- **Location:** `src/app/companies/[companySlug]/page.tsx`
- **Issue:** It's a Client Component when it only fetches and renders data.
- **Fix:** Convert to Server Component + pass data to a Client Component for interactivity.

### P-M08 — Hardcoded API fallback URL mismatches project port
- **Location:** `src/lib/api.ts:1`
- **Issue:** `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'` — documented port is 5050, not 5000.
- **Fix:** Update fallback to match documentation: `http://localhost:5050/api`.

### P-M09 — `resendVerificationEmail` is a pure alias
- **Location:** `src/lib/api.ts:687-689`
- **Issue:** `resendVerificationEmail` just calls `sendVerificationEmail`. If endpoints diverge later, this alias breaks.
- **Fix:** Either remove the alias or make it a real separate endpoint.

### P-M10 — `useCallback` with frequently-changing dependencies
- **Location:** `src/app/jobs/page.tsx:42-46`
- **Issue:** `useCallback` depends on `hasNextPage, isFetchingNextPage, fetchNextPage` — these change frequently, making the optimization ineffective.
- **Fix:** Restructure the infinite scroll logic.

### P-M11 — `formatSalary` defined in api.ts but some pages inline salary formatting
- **Locations:** `src/lib/api.ts:721` vs `src/app/page.tsx:374-378` · `src/app/dashboard/employer/jobs/[id]/page.tsx:205`
- **Issue:** `formatSalary` utility exists but several places inline ad-hoc formatting.
- **Fix:** Use the shared `formatSalary` consistently.

### P-M12 — ErrorMessage pattern repeated 5x
- **Locations:** Multiple pages — icon + message + retry button pattern.
- **Fix:** Extract `<ErrorMessage>` component.

### P-M13 — RichTextEditor unsanitized value injection
- **Location:** `src/components/ui/rich-text-editor.tsx:30`
- **Issue:** `editorRef.current.innerHTML = value` — directly sets innerHTML on every value change.
- **Fix:** Use a more robust approach and ensure server-side sanitization covers all cases.

### P-M14 — FAQ auto-generation runs every render
- **Location:** `src/components/jobs/job-details-client.tsx:84-114`
- **Issue:** FAQ array dynamically generated from job data on every render — not memoized.
- **Fix:** Wrap with `useMemo`.

### P-M15 — Completion percentage computed inline every render
- **Location:** `src/app/dashboard/profile/page.tsx:193-202`
- **Issue:** `completionItems` array and `completionPct` calculated in render body.
- **Fix:** Wrap with `useMemo`.

### P-M16 — Related blogs query has no error/loading state
- **Location:** `src/components/blog/blog-details-client.tsx:30-33`
- **Issue:** `relatedBlogs` query doesn't show loading state or handle errors silently.
- **Fix:** At minimum show a loading spinner; add error handling.


## 🟢 LOW

### P-L01 — `Zustand` installed but unused
- **Location:** `package.json`
- **Issue:** Zustand v5 listed as dependency but never imported anywhere in the portal.
- **Fix:** Either remove or use for state management that warrants it.

### P-L02 — Raw `<img>` tags used extensively
- **Locations:** `src/components/jobs/job-card.tsx:28` · `job-details-client.tsx:150,278` · `page.tsx:341` · `blogs/page.tsx:96,148` · `blog-details-client.tsx:161,292`
- **Issue:** Plain `<img>` instead of Next.js `<Image>`. No automatic optimization or lazy loading.
- **Fix:** Replace with `next/image` with proper config for external URLs.

### P-L03 — Top-level page could use better error boundary granularity
- **Location:** `src/app/layout.tsx:76`
- **Issue:** Single `ErrorBoundary` wraps the entire app. Individual route segments could have their own `error.tsx`.
- **Fix:** Add `error.tsx` files at appropriate route segments.

### P-L04 — `loading.tsx` provides no context
- **Location:** `src/app/loading.tsx:4`
- **Issue:** Shows generic "Loading..." text.
- **Fix:** Use a more contextual skeleton or remove.

### P-L05 — Sitemap relies on localStorage guard
- **Location:** `src/app/sitemap.ts` + `api.ts:351`
- **Issue:** Server-side sitemap generation accesses `localStorage` (guarded by `typeof window !== 'undefined'`). Works but fragile.
- **Fix:** Create a server-safe API client for sitemap generation.

### P-L06 — Magic number `30 * 24 * 60 * 60 * 1000` in job detail
- **Location:** `src/app/jobs/[slug]/page.tsx:65`
- **Issue:** `new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)` — unnamed "30 days" constant.
- **Fix:** Define as `const STRUCTURED_DATA_VALIDITY_DAYS = 30`.

### P-L07 — AnimatedCounter defined inline in HomePage
- **Location:** `src/app/page.tsx:36-67`
- **Issue:** `AnimatedCounter` is defined in the same file as the HomePage.
- **Fix:** Extract to `components/ui/animated-counter.tsx`.

---

# Admin (`admin/`)

## 🔴 CRITICAL

### A-C01 — Potential infinite loading on page refresh
- **Location:** `src/App.tsx:49-64`
- **Issue:** When persisted Zustand state rehydrates before the effect runs, `token` is set AND `admin` is already populated — neither branch executes, so `setInitialized(true)` is never called. The app shows `<Loading />` forever.
- **Fix:** Restructure the conditional to always call `setInitialized(true)` after checks.

### A-C02 — Tailwind dynamic class names won't compile
- **Location:** `src/pages/AnalyticsPage.tsx:66-68`
- **Issue:** `` className={`p-3 rounded-full bg-${color}-100`} `` — Tailwind JIT cannot resolve dynamically constructed class names.
- **Fix:** Use a map from color → literal Tailwind class, or inline the full classes.

### A-C03 — Division by zero in analytics
- **Location:** `src/pages/AnalyticsPage.tsx:310,317`
- **Issue:** `(activeJobs / totalJobs) * 100` and `(publishedBlogs / totalBlogs) * 100` crash when denominator is 0.
- **Fix:** Add `|| 1` guard or check before division.

### A-C04 — Lost requirements/responsibilities on job edit
- **Location:** `src/pages/JobFormPage.tsx:56-57`
- **Issue:** `requirements: ''` and `responsibilities: ''` (empty strings) instead of `job.requirements?.join('\n') || ''`. Editing a job silently deletes existing requirements.
- **Fix:** Populate from fetched job data.

### A-C05 — Non-functional buttons (View, View All)
- **Location:** `src/pages/ApplicationsPage.tsx:247-249` · `src/pages/DashboardPage.tsx:182-185`
- **Issue:** "View" and "View All" `<Button>` elements have no `onClick` or `Link` — they do nothing.
- **Fix:** Wire to the correct route or remove.

### A-C06 — `any` types used pervasively (30+ occurrences)
- **Locations:** All page files — `jobs.map((job: any)`, `users.map((user: any)`, etc. Also `lib/api.ts:6-11` has `<T = any>` as default.
- **Issue:** No type safety on API responses; refactors break silently.
- **Fix:** Define and use typed interfaces for all API responses.

### A-C07 — `document.execCommand()` deprecated
- **Location:** `src/components/RichTextEditor.tsx:35`
- **Issue:** Same deprecated API as the portal's rich text editor.
- **Fix:** Migrate to a modern rich-text library (TipTap, Slate, Quill).


## 🟠 HIGH

### A-H01 — Pagination UI block duplicated 5x
- **Locations:** `src/pages/JobsPage.tsx:251-280` · `JobApplicantsPage.tsx:323-352` · `UsersPage.tsx:343-372` · `ApplicationsPage.tsx:258-287` · `BlogsPage.tsx:226-255`
- **Issue:** ~16-line identical pagination block repeated in every list page.
- **Fix:** Extract a reusable `<Pagination>` component.

### A-H02 — Filter Card + Search pattern duplicated 5x
- **Locations:** `src/pages/JobsPage.tsx:104-136` · `JobApplicantsPage.tsx:168-203` · `UsersPage.tsx:86-120` · `ApplicationsPage.tsx:105-141` · `BlogsPage.tsx:87-119`
- **Issue:** ~30-line layout (Card + CardHeader + search + select + filter button) duplicated.
- **Fix:** Extract a reusable `<FilterBar>` or `<ListFilters>` component.

### A-H03 — API CRUD hook file is 551 lines of repetition
- **Location:** `src/hooks/useApi.ts`
- **Issue:** `useX / useCreateX / useUpdateX / useDeleteX` for every entity follows identical pattern. ~400 lines of repetition.
- **Fix:** Create a factory function: `createCrudHooks(entityName, endpoint)`.

### A-H04 — Dual token storage (Zustand persist + localStorage)
- **Location:** `src/lib/store.ts:32` + `src/lib/api.ts:27`
- **Issue:** Auth token stored in both Zustand (persisted) AND `localStorage`. Axios interceptor reads from `localStorage` directly. If one gets out of sync, auth breaks.
- **Fix:** Single source of truth — read from Zustand store in the Axios interceptor.

### A-H05 — Raw HTML elements vs Design System components
- **Locations:** `PlansPage.tsx`, `SubscriptionsPage.tsx`, `SponsoredCompaniesPage.tsx`, `JobApprovalsPage.tsx`, `LoginPage.tsx`, `UsersPage.tsx` use raw `<input>`, `<select>`, `<button>` — while `JobsPage.tsx`, `JobFormPage.tsx`, etc. use shadcn components.
- **Issue:** Inconsistent UI; raw elements miss design system styling and accessibility.
- **Fix:** Convert all raw HTML elements to the corresponding design system components.

### A-H06 — Inconsistent delete patterns (native `confirm()` vs `AlertDialog`)
- **Locations:** `JobsPage.tsx:287-307` uses `AlertDialog` (correct). `UsersPage.tsx:62`, `UserViewPage.tsx:68`, `BlogsPage.tsx:49`, `PlansPage.tsx:141`, `SponsoredCompaniesPage.tsx:113` use native `confirm()`.
- **Issue:** Breaks modal UX; cannot be styled.
- **Fix:** Replace all native `confirm()` with shadcn `AlertDialog`.

### A-H07 — Loading skeleton pattern duplicated 10+ times
- **Locations:** Every list page — `[...Array(5)].map((_, i) => (...))`
- **Issue:** Identical inline skeleton markup repeated.
- **Fix:** Extract a `<TableSkeleton rows={5} />` component.


## 🟡 MEDIUM

### A-M01 — Monolithic useApi.ts should be split
- **Location:** `src/hooks/useApi.ts` (551 lines)
- **Issue:** All CRUD hooks for all entities in one file. Hard to navigate and maintain.
- **Fix:** Split by domain: `useJobsApi.ts`, `useUsersApi.ts`, `useBlogsApi.ts`, etc.

### A-M02 — Inline navigation array recreated every render
- **Location:** `src/components/Layout.tsx:34-47`
- **Issue:** The `navigation` array is defined inside the component body, recreated on every render.
- **Fix:** Define as a `const` outside the component.

### A-M03 — Inline component defined inside render
- **Location:** `src/pages/AnalyticsPage.tsx:32-72`
- **Issue:** `StatCard` component defined inside `AnalyticsPage` function, recreated every render.
- **Fix:** Move to module level.

### A-M04 — Client-side filtering of audit logs (inefficient)
- **Location:** `src/pages/AuditLogsPage.tsx:31-34`
- **Issue:** `JSON.stringify(log).toLowerCase().includes(search.toLowerCase())` — filters up to 100 logs in the browser.
- **Fix:** Send search query to the API for server-side filtering.

### A-M05 — Synthetic event dispatch for form submission
- **Location:** `src/pages/BlogFormPage.tsx:98-110`
- **Issue:** `document.getElementById('blog-form')?.dispatchEvent(new Event('submit', ...))` — fragile and unidiomatic.
- **Fix:** Make `handleSubmit` accept a parameter for publish mode.

### A-M06 — Missing SEO fields in BlogForm
- **Location:** `src/pages/BlogFormPage.tsx`
- **Issue:** Blog model supports `metaTitle`, `metaDescription`, `metaKeywords`, `structuredData` but the form doesn't include these fields. `BlogViewPage` attempts to display them.
- **Fix:** Add SEO fields to the form.

### A-M07 — Missing suspend/unsuspend in UserViewPage
- **Location:** `src/pages/UserViewPage.tsx:382-401`
- **Issue:** Quick Actions card shows "Send Email" and "View Resume" but no suspend/unsuspend options, even though the API supports them.
- **Fix:** Add suspend/unsuspend buttons with confirmation.

### A-M08 — Plans/Subscriptions/Sponsored pages have minimal loading states
- **Locations:** `src/pages/PlansPage.tsx:114-115` · `SubscriptionsPage.tsx:14-15` · `SponsoredCompaniesPage.tsx:85-86`
- **Issue:** Just `<p>Loading...</p>` text instead of skeleton/spinner. Also missing error states.
- **Fix:** Add proper skeleton loading and error UI.

### A-M09 — Dual API naming conventions
- **Location:** `src/lib/api.ts`
- **Issue:** `jobsAPI`, `usersAPI`, etc. use descriptive names (`getJobs`, `createJob`). `plansAPI`, `subscriptionsAPI`, `sponsoredAPI` use generic names (`getAll`, `getById`, `create`, `update`, `delete`).
- **Fix:** Standardize on one convention.

### A-M10 — Polymorphic API response handling
- **Location:** `src/pages/SubscriptionsPage.tsx:8` · `SponsoredCompaniesPage.tsx:17`
- **Issue:** `data?.data ?? data ?? []` trying to handle multiple response shapes. Suggests inconsistent API contract.
- **Fix:** Standardize the API response format (fix at source, not consumer).

### A-M11 — BlogFormPage leftover console logs
- **Location:** `src/pages/BlogFormPage.tsx:13,81`
- **Issue:** `console.log("Adding new blog post")` and `console.log('Blog data being sent:', blogData)` — debug statements.
- **Fix:** Remove.

### A-M12 — Inconsistent `cn()` import paths
- **Location:** `src/components/ui/button.tsx:5` uses `@/lib/utils` (alias), while all other UI components use `../../lib/utils` (relative path).
- **Issue:** Inconsistent. If alias resolution breaks, only `button.tsx` will be affected.
- **Fix:** Standardize on one import style.

### A-M13 — Login/Register validation is silent
- **Location:** `src/pages/LoginPage.tsx:27-29` · `RegisterPage.tsx:32-42`
- **Issue:** Empty fields just `return` without user feedback (no toast, no inline error).
- **Fix:** Show validation errors to the user.

### A-M14 — Missing Global Error Boundary
- **Location:** `src/App.tsx` or `main.tsx`
- **Issue:** The Vite Admin app lacks a global error boundary. If a component throws, the entire dashboard crashes to a blank white screen.
- **Fix:** Wrap the Admin `<App />` in a React Error Boundary.


## 🟢 LOW

### A-L01 — Dead CSS and assets (App.css, react.svg)
- **Location:** `src/App.css` (Vite boilerplate, never applied), `src/assets/react.svg` (unreferenced)
- **Issue:** Leftover default Vite template files.
- **Fix:** Delete both.

### A-L02 — `dashboardAPI.getRecentActivity` never called
- **Location:** `src/lib/api.ts:68-70`
- **Issue:** API function exists but `DashboardPage.tsx` uses hardcoded mock data instead.
- **Fix:** Either call the real API or remove the mock and the unused function.

### A-L03 — `usePlan` hook never imported
- **Location:** `src/hooks/useApi.ts:409-415`
- **Issue:** `usePlan` hook exported but never used by any page.
- **Fix:** Either use it in PlansPage or remove.

### A-L04 — `getStatusColor` defined in utils but never imported
- **Location:** `src/lib/utils.ts:39-54`
- **Issue:** Utility function exists but each page defines its own local version.
- **Fix:** Import from utils and remove local copies.

### A-L05 — Hardcoded mock data in DashboardPage
- **Location:** `src/pages/DashboardPage.tsx:18-34`
- **Issue:** `recentActivity` is hardcoded with a comment "Mock recent activity data for now". Real API exists.
- **Fix:** Wire to the real API endpoint.

### A-L06 — System Status section is completely fake
- **Location:** `src/pages/DashboardPage.tsx:229-246`
- **Issue:** Always shows green checkmarks for "Database: Online", "API: Operational", "Storage: Available" — no real monitoring.
- **Fix:** Either implement real health checks or remove the section.

### A-L07 — Missing `services/` directory
- **Location:** `src/services/` (doesn't exist)
- **Issue:** `AGENTS.md` mentions "Alternative fetch-based API wrappers" in `services/` but the directory doesn't exist on disk.
- **Fix:** Remove from docs or create the directory.

### A-L08 — `ImageUpload` uses `alert()` and `console.error()` instead of toast
- **Location:** `src/components/ImageUpload.tsx:59,65,77`
- **Issue:** Uses native `alert()` for validation errors and `console.error()` for upload failure instead of `react-hot-toast`.
- **Fix:** Replace with toast notifications.

### A-L09 — `sanitize.ts` doesn't restrict `href` protocols
- **Location:** `src/lib/sanitize.ts:12`
- **Issue:** `<a>` tags allowed but `ALLOWED_URI_REGEXP` not configured. DOMPurify's default may allow `javascript:` URLs.
- **Fix:** Explicitly set `ALLOWED_URI_REGEXP` or `FORBID_PROTOCOLS`.

---

## Summary

| Service | 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW | Total |
|---------|:-----------:|:-------:|:---------:|:------:|:-----:|
| **Server** | 7 | 12 | 14 | 4 | **37** |
| **Portal** | 6 | 8 | 16 | 7 | **37** |
| **Admin** | 7 | 7 | 14 | 9 | **37** |
| **Total** | **20** | **27** | **44** | **20** | **111** |

### Estimated effort by service
| Service | Estimate |
|---------|----------|
| **Server** | ~8-10 days |
| **Portal** | ~5-7 days |
| **Admin** | ~4-6 days |
| **Total** | **~17-23 days** |

### Quick wins by service (1-2 hours each)

**Server:**
- S-C07: Import pagination helper instead of local copy
- S-M03: Delete dead code files (`index-minimal.ts`, `test-db.js`, unused imports)
- S-L01: Rename migration folder for correct chronology
- S-L03: Create `.env.example`

**Portal:**
- P-H06: Remove stale console.logs
- P-L01: Remove unused Zustand dependency
- P-L06: Extract magic number constant

**Admin:**
- A-C05: Fix non-functional buttons
- A-M11: Remove debug console.logs
- A-L01: Delete App.css and react.svg
- A-L04: Import getStatusColor from utils
