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
- Template Marketplace
  - URL-driven filters: `q`, `category`, `tier`, `sort`, `page` persisted via `history.replaceState`.
  - Category chips replace dropdown; tier chips implemented; clear-filters chip shown when any filter active.
  - Infinite scroll enabled: appends results when bottom sentinel enters viewport; uses `hasMore`/`loadingMore` guards.
  - Preview modal includes description, sample preview, tags, stats, Use/Upgrade actions; lock overlay on gated templates.
  - Backend `/api/templates/categories` returns counts when DB flag on; otherwise uses mock counts.

### Brand Kits (next major templates upgrade)
- Goal: Evolve "templates" into complete Brand Kits that provide a ready-to-use brand foundation, not just a slogan.
- UX
  - New page emphasis: "Brand Kits" with filters for industry, personality, color theme, tier, includes (voice/social/web copy/logo).
  - Card shows: kit name, industry/personality, color swatches, font pair, included items badges, rating/downloads, lock if gated.
  - Preview modal with tabs: Overview, Colors & Fonts, Voice & Messaging, Social Templates, Web Copy, Ads, Assets/Export.
  - Actions: Use Kit (prefills generator + brand profile), Save (favorite), Export (PDF brandbook, brand tokens JSON), Upgrade.
- Data model (Supabase)
  - `brand_kits` (id, title, description, industry, personality, tier, palette hex[], fonts jsonb {primary, secondary, sources},
    messaging jsonb {tagline, elevator_pitch, value_props[], word_bank[], dos_donts{}}, voice jsonb {tone_guidelines, sample_prompts[]},
    social jsonb {sample_posts[], hooks[]}, web_copy jsonb {hero, about, features[]}, ads jsonb {headlines[], primary_text[]},
    assets jsonb {figma_url?, canva_url?, icon_pack_url?, image_prompts_url?}, tags text[], rating numeric, downloads int,
    is_active bool, created_by, created_at, updated_at)
  - `brand_kit_categories` (optional) or reuse `template_categories`
  - `brand_kit_favorites` (user_id, kit_id)
  - `brand_kit_ratings` (user_id, kit_id, rating)
  - `brand_kit_tags` (kit_id, tag) or m2m table
- API (backend)
  - `GET /api/kits` q/category/tier/personality/color/page/pageSize/sort
  - `GET /api/kits/:id`
  - `POST /api/kits/use` → applies kit to user: prefill generator + create/update `profiles` with kit defaults; increments downloads
  - `GET /api/kits/categories` (with counts)
  - `GET /api/kits/export/:id?format=brandbook|tokens|tailwind` → PDF/ZIP/JSON
  - `GET/POST/DELETE /api/kits/favorites`
  - Feature flag: `BRAND_KITS_DB_ENABLED` (parallel to `TEMPLATES_DB_ENABLED`)
- Frontend
  - Reuse marketplace shell: swap content/filters for kits; keep URL state + infinite scroll.
  - Cards render hero tile: palette swatches + fonts; badges for included sections.
  - Preview modal shows tabbed content; Download/Export only when allowed by tier.
  - Use Kit → navigate to `/generate?kit=<id>`; `GeneratorPage` reads kit and prefills form + suggests voice toggle.
  - Brand Suite widgets consume kit data (voice, palette, fonts) for immediate utility.
- Exports (phase 2)
  - Brandbook PDF (messaging + colors/fonts + examples)
  - Brand tokens JSON (CSS variables, palette, font stacks); optional Tailwind config snippet
- Phased rollout
  1) Schema + API + mock kits; UI preview + Use Kit (no export)
  2) Exports (PDF/tokens), category counts, search facets
  3) Ratings + sorting by rating/downloads
  4) Creator pipeline (admin upload JSON kits) and moderation
  5) Monetization adjustments (tiers, add-ons)
- Safeguards
  - Keep existing `/api/templates` working; introduce `/api/kits` side-by-side.
  - Feature-flagged enablement; fallback to mock kits.
- Admin
  - `/api/admin/reset-user` protected by `ADMIN_RESET_TOKEN`: cancels subscription, deletes customer, removes profile, attempts auth user deletion.
- Logs
  - Stripe env presence is logged on server start (checks only, no secrets).
  - express-rate-limit warns about `trust proxy=true`; safe to ignore for now (behind Railway) or configure per docs later.

### Quick tests
- Logged-out: site renders (no infinite spinner). Logged-in: profile loads; navbar updated.
- Pricing: loads, shows STARTER for free; checkout opens Stripe; back nav with `?canceled=true` cleans URL and page renders.
- Template marketplace: templates and categories load; favorites require login and work with email fallback.

### Generators (2025-08-15 improvements)
- Backend endpoints added to prevent 404s:
  - Names `/api/names/*`, Logos `/api/logos/*`, Social `/api/social/*`
- Name quality
  - Backend now uses AI prompts (Claude primary, OpenAI fallback) via `aiService.generateBusinessNames` with strict JSON output and constraints (style, length, distinctiveness, no generic suffixes). Ignores brand kits; uses only Name Generator form inputs.
  - Frontend guards in `NameCard.jsx` prevent crashes when fields are missing.
- Social posts quality
  - New AI path `generateSocialPostsFromSettings` driven by Social Post form (topic, tone, platforms, post type, hashtags) to produce platform-tailored content, replacing generic templates.
- Guardrails remain: do not break login or navigation; feature-flag future brand-kit integrations.

## Social Post Generator: upgrade plan

- UX changes (frontend)
  - Add controls to `SocialPostForm.jsx`:
    - Creativity slider (0.2–1.2) → maps to temperature
    - Length: short/medium/long per platform (enforced in prompt)
    - CTA presets: none | shop now | learn more | book demo | sign up
    - Hashtag density: none | low (1–3) | normal (4–7) | high (8–12)
    - Emoji usage: none | tasteful | expressive
    - Structure: hook strength (0–2), body detail (0–2), CTA strength (0–2)
    - Brand kit toggle + kit selector (optional); defaults off
  - Display platform-character counts live; warn when over limits.

- API and prompt (backend)
  - Extend `POST /api/social/generate` request body with:
    - `creativity:number`, `length:'short'|'medium'|'long'`, `cta:string|null`, `hashtagDensity:'none'|'low'|'normal'|'high'`, `emoji:'none'|'tasteful'|'expressive'`, `structure:{hook:number,body:number,cta:number}`, `brandKitId?:string`
  - In `aiService.generateSocialPostsFromSettings`:
    - Map creativity to temperature.
    - Enforce per-platform max chars and desired length bands; truncate gracefully.
    - Produce posts keyed by platform with `text`, `hashtags`, and `estimated_chars`.
    - If `brandKitId` present and `BRAND_KITS_DB_ENABLED==='true'`, fetch kit and include palette, tone, value props, and tagline in prompt context; otherwise ignore.
  - Rate limiting: reuse existing usage logging; add `service_type='social_posts_v2'`.

- Data and feature flags
  - No schema change required for MVP. Optional future: `social_presets` table to save user presets.
  - Flag: `SOCIAL_V2_ENABLED` to toggle new controls server-side if needed.

- Acceptance
  - Posts vary with sliders; platform limits respected; hashtags/emoji density honored; optional brand kit context applied only when toggled.

## Logo Generator: upgrade plan

- Goal
  - Replace placeholder images with real AI logos; provide PNG+SVG; minimal disruption to UI.

- Provider and env
  - Use Stability AI (SD3/Stable Image) for raster generation; env: `STABILITY_API_KEY`.
  - Optional fallback: OpenAI `gpt-image-1` (`OPENAI_API_KEY`). Feature flag: `LOGO_PROVIDER` in {'stability','openai'}.

- UX changes (frontend)
  - Extend `LogoGeneratorForm` with:
    - Style: minimal, geometric, emblem, wordmark, monogram
    - Keywords (iconography), initials (for monogram), palette (primary/secondary), background (transparent/solid), aspect (1:1, 3:2, 16:9)
    - Output formats: PNG (required), SVG (attempt vectorize)
    - Variations: 1–4
  - Job UI unchanged; show “vectorizing…” step when SVG requested.

- API (backend)
  - `POST /api/logos/generate` accepts the new fields; creates a job and immediately returns jobId.
  - Worker logic (inline for MVP via setTimeout; later move to queue):
    - Call Stability with crafted prompt (style + keywords + constraints like high-contrast, flat, scalable).
    - Store PNG in Supabase Storage bucket `brand-assets` under `logos/{userId}/{jobId}.png`.
    - Vectorization: run potrace/imagetracer on PNG to produce SVG (best-effort), store as `...svg`.
    - Insert row into `brand_assets` (type='logo', urls, meta: palette, style, seed).
  - New envs: `SUPABASE_STORAGE_BUCKET=brand-assets`, `STABILITY_API_KEY`, optional `OPENAI_API_KEY`.

- Prompting (backend)
  - Style-aware system prompt: “Design a simple, scalable brand logo... avoid photorealism, ensure clean edges, vector-friendly.”
  - Enforce transparent background if requested; prefer flat colors; limit text to initials when wordmark not chosen.

- Acceptance
  - Jobs complete with real PNGs; optional SVG is usable for simple shapes; assets persist; primary logo settable; no 404s.

- Safeguards
  - Feature flag `LOGOS_REAL_ENABLED`; fallback to current mock when off.
  - Strict timeouts and error messaging; do not impact auth/nav.


