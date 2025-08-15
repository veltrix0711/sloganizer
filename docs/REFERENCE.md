## LaunchZone Engineering Reference (Sloganiser)

### Guardrails
- Do not break login or navigation.
- Keep Vite env handling unchanged: Dockerfile builds with `ARG` and `ENV` for all `VITE_*` vars; `railway.json` passes build args.
- No auto-signout on timeouts; rely on `onAuthStateChange` in `authContext.jsx`.

### Services and URLs
- **Frontend**: `sloganizer-frontend` at [www.launchzone.space](https://www.launchzone.space)
- **Backend**: `sloganixerbackend` at Railway production URL (see variables output)

### Environment variables
- Frontend (Vite; injected at build-time via Docker build args)
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL` (points to backend public URL)
  - `VITE_APP_NAME`, `VITE_APP_DESCRIPTION`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_NODE_ENV`
  - Files: `frontend/Dockerfile` (ARG/ENV for VITE_*), `frontend/railway.json` (`build.buildArgs`)
- Backend
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_*_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
  - `FRONTEND_URL`
  - `ADMIN_RESET_TOKEN` (secret for admin reset endpoint)

### Authentication flow
- File: `frontend/src/services/authContext.jsx`
  - Source of truth: `supabase.auth.onAuthStateChange`
  - Soft timeout: clears `loading` only; never calls `signOut` automatically
  - Single-flight profile fetch: prevents concurrent fetches; uses cache; `AbortController` timeout ~12s
  - Exposes `user`, `session`, `profile`, `loading`, `signIn/Up/Out`, `updateProfile`, etc.
- File: `frontend/src/services/supabase.js`
  - Creates client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Pricing page behavior
- File: `frontend/src/pages/NewPricingPage.jsx`
  - Uses `hasFetchedRef` to avoid repeated `/api/billing/subscription` calls
  - Derives plan from `currentPlan` or `profile.subscription_plan`
  - Safe default: `STARTER` if plan unknown
  - Shows loading UI while `authLoading || planLoading`

### Activation checklist
- File: `frontend/src/components/Widgets/ActivationChecklist.jsx`
  - Temporal dead zone fixed by declaring `session` and function before use
  - Safe completion percentage calculation

### Admin operations
- Endpoint: `POST /api/admin/reset-user`
  - Headers: `x-admin-token: <ADMIN_RESET_TOKEN>`
  - Body: `{ userId?: string, email?: string }` (one required)
  - Actions: cancel Stripe subscription (if exists), delete Stripe customer (if exists), delete `profiles` row, attempt auth user deletion
  - Files: `backend/src/server.js`, `backend/src/services/stripeService.js`
  - Note: treat `ADMIN_RESET_TOKEN` as secret; never log or commit its value

### Pre-task checklist (reference before any change)
1. Login works and site navigation is intact
2. `/pricing` loads; no console errors about auth/profile/plan
3. `railway variables` show required envs for both services
4. For env or build changes: confirm `frontend/railway.json` buildArgs and `frontend/Dockerfile` ARG/ENV blocks are preserved

### Post-task checklist (run after changes)
1. Re-test login, logout, and general navigation
2. Re-test `/pricing` and ensure plan detection works and no repeated fetch logs
3. Check browser console for errors or warnings
4. If backend changed: hit `/api/health` and a known endpoint (e.g., `/api/billing/subscription`) with a valid token

### Common commands
```bash
# Frontend service variables (from frontend/)
railway service
railway variables

# Backend service variables (from backend/)
railway service
railway variables

# Deploy
cd frontend && railway up
cd backend && railway up
```

### Troubleshooting notes
- Vite envs must exist at build time. Ensure `railway.json` passes `VITE_*` as Docker build args and `Dockerfile` maps ARG→ENV before `npm run build`.
- Session timeouts: allowed to soft-fail loading; never auto sign-out.
- Repeated plan fetches: guarded via `hasFetchedRef` and `user?.id`-scoped effect.
- ActivationChecklist TDZ: ensure `session` and function declarations precede usage.

### Current status (2025-08-15)
- Auth
  - App sets `loading=false` immediately after initial `getSession()`; profile fetch is fire-and-forget.
  - `onAuthStateChange` also sets `loading=false` immediately; profile fetch does not block UI.
  - Single-flight profile fetch with 12s abort; cached results reused.
- Pricing/Checkout
  - Frontend sends only `planId` to `/api/billing/checkout`; backend derives Stripe `priceId`.
  - Backend returns `sessionUrl` and an alias `url` for redirect; frontend uses either.
  - Pricing page handles `?canceled=true`: shows a brief toast and cleans the URL via `history.replaceState`.
- Stripe price IDs (backend env)
  - `STRIPE_STARTER_PRICE_ID=price_1Rv6l6GdU41U3RDABW3PJgU3`
  - `STRIPE_PRO_50_PRICE_ID=price_1Rv6sTGdU41U3RDAMU7CB5Vf`
  - `STRIPE_PRO_200_PRICE_ID=price_1Rv6u0GdU41U3RDAqLI5XEde`
  - `STRIPE_PRO_500_PRICE_ID=price_1Rv6uvGdU41U3RDAjMpsNLkm`
  - Add-ons set: `STRIPE_CREDITS_500_PRICE_ID`, `STRIPE_POSTS_1000_PRICE_ID`, `STRIPE_VIDEO_60_PRICE_ID`, `STRIPE_EXTRA_BRAND_PRICE_ID`, `STRIPE_EXTRA_SEAT_PRICE_ID`.
- Templates favorites
  - Backend `templates` routes attempt to attach user from Authorization if present; also accept `email` in query/body.
  - Frontend passes `?email=` for GET/DELETE and `{ email }` for POST to avoid 401 when token absent.
- Admin
  - `/api/admin/reset-user` protected by `ADMIN_RESET_TOKEN`: cancels subscription, deletes customer, removes profile, attempts auth user deletion.
- Logs
  - Stripe env presence is logged on server start (checks only, no secrets).
  - express-rate-limit warns about `trust proxy=true`; safe to ignore for now (behind Railway) or configure per docs later.

### Quick tests
- Logged-out: site renders (no infinite spinner). Logged-in: profile loads; navbar updated.
- Pricing: loads, shows STARTER for free; checkout opens Stripe; back nav with `?canceled=true` cleans URL and page renders.
- Template marketplace: templates and categories load; favorites require login and work with email fallback.


