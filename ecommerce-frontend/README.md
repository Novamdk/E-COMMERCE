# SK Envision — Storefront

A complete, responsive storefront for a natural hair & body care brand. Built as a
ground-up rebuild of [skenvisiontime.com](https://skenvisiontime.com/) — same catalog, same
copy, new front end.

Real product data (13 products, 9 collections, real prices, descriptions, ratings and review
counts) was pulled from the source site's WooCommerce Store API. Every image was downloaded
from the source site and re-encoded to responsive AVIF locally: **62.4 MB of JPEG/PNG became
4.37 MB of AVIF across 172 files, a 93% reduction.** No videos were copied.

---

## Setup

Requires **Node ≥ 20.19** (built and verified on Node 24.16, npm 11.13).

Package manager is **pnpm** (`pnpm-lock.yaml` is the lockfile).

```bash
pnpm install
pnpm run dev        # http://localhost:5173
```

| Script                  | What it does                                                      |
| ----------------------- | ----------------------------------------------------------------- |
| `pnpm run dev`          | Vite dev server with HMR                                          |
| `pnpm run build`        | Production build into `dist/`                                     |
| `pnpm run preview`      | Serve the production build locally                                |
| `pnpm run lint`         | ESLint, fails on any warning (`--max-warnings=0`)                 |
| `pnpm run format`       | Prettier write, including Tailwind class sorting                  |
| `pnpm run format:check` | Prettier check only                                               |
| `pnpm run data`         | Regenerate the data layer from the captured API payloads          |
| `pnpm run images`       | Re-download and re-encode every image to AVIF (`--force` to redo) |

Both generators are deterministic: running them repeatedly produces byte-identical output, so
they never create noise in a diff. Their output is listed in `.prettierignore` for the same
reason — the generator's formatting is the canonical formatting.

### Stack

Vite 8 · React 19 · react-router-dom 7 · Tailwind CSS 4 · Framer Motion 14 · react-icons 5 ·
Lenis 1.3 · ESLint 10 · Prettier 3.

Those six are the only runtime dependencies. Everything else — forms, validation, focus
traps, scroll locking, debouncing, dropdowns, accordions, money math — is hand-rolled in
`src/hooks` and `src/lib`.

### Three framework gotchas worth knowing before you touch this

> **Tailwind v4 install path.** The `@tailwindcss/vite` plugin plus a single
> `@import "tailwindcss";` in `src/styles/index.css`. There is deliberately **no**
> `tailwind.config.js` and **no** `postcss.config.js` — design tokens live in the `@theme`
> block in that CSS file.

> **Tailwind v4 dropped `cursor: pointer` on buttons.** Its preflight no longer sets it, so
> without help every button shows a text caret. `styles/index.css` restores it with one
> `:where(button, [role="button"], a[href], summary, …)` rule. Do not delete it.

> **Lenis owns the scroll position.** Two consequences. (1) Any nested scroll container needs
> `data-lenis-prevent`, or Lenis swallows its wheel events for the page scroll and it cannot
> be scrolled at all — this is why the cart drawer, modal body and dropdown list carry that
> attribute. (2) `body` uses `overflow-x: clip`, **not** `hidden`: `hidden` forces
> `overflow-y: auto`, which turns `<body>` into a scroll container and breaks Lenis outright.
> `html` also deliberately has no `scroll-behavior: smooth`, which would fight it.

---

## Folder structure

Feature-first. Shared primitives live in `components/`; anything domain-specific lives inside
its feature folder.

```
src/
  app/              App, router, providers, ErrorBoundary, RouteError
  components/
    ui/             Button Input Dropdown Checkbox FormField Badge Modal Drawer Overlay
                    Skeleton Rating QuantityStepper Spinner EmptyState ErrorPanel
                    Pagination Image VisuallyHidden      (dumb, no domain logic)
    layout/         RootLayout Header MobileNav Footer Container PageShell PageHeader
                    BrandMark CategoryMenu AccountMenu AuthShell RouteFallback
  features/
    catalog/        ProductCard ProductGrid Filters SortSelect SearchField Gallery
                    VariantPicker ProductPurchasePanel RelatedProducts
                    useProducts useProductFilters
    cart/           CartContext CartProvider cartReducer useCart useCartLines + components
    wishlist/       WishlistContext WishlistProvider wishlistReducer useWishlist + components
    checkout/       useCheckoutForm + ShippingStep PaymentStep ReviewStep CheckoutStepper
    auth/           AuthContext AuthProvider authReducer useAuth ProtectedRoute + forms
    orders/         useOrders OrderCard
    marketing/      Hero BenefitsStrip CategoryTiles FeaturedProducts
                    IngredientsSection Testimonials FaqSection
  pages/            one file per route, composition only
  hooks/            useAsync useLocalStorage useDebouncedCallback useForm useFocusTrap
                    useScrollLock useOnClickOutside useScrollToTopOnNavigate
  lib/              constants cn formatCurrency calculateTotals filterProducts
                    validators storage productImage cartLine motion  (pure, no React)
  services/         productService orderService authService   (the only data access)
  data/             products.json categories.json content.json images.json  (generated)
  styles/           index.css — Tailwind entry + design tokens
scripts/
  generate-data.mjs     API payloads → products/categories/content + image manifest
  build-images.mjs      the AVIF pipeline
  image-manifest.json   79 source URLs → asset names (committed, so the build replays)
  source/               the captured WooCommerce Store API responses (committed)
```

### Module boundaries

`@/` is aliased to `src/` in both `vite.config.js` and `jsconfig.json`. There are no
`../../../` imports.

Each feature exposes an `index.js` barrel that is its **only** public surface. A feature
reaches its own internals with relative paths and other features only through their barrel.
This is enforced, not just documented — `eslint.config.js` bans the import pattern
`@/features/*/*`, so a deep cross-feature import fails `npm run lint`.

Pages are the one layer allowed to compose across features. `WishlistPage`, for example,
pairs `useWishlist` with the catalog's `ProductGrid` — neither feature knows about the other.

---

## Routes

Route paths are referenced through `ROUTES` in `lib/constants.js`, never typed as string
literals.

| Path                   | Page                   | Notes                                        |
| ---------------------- | ---------------------- | -------------------------------------------- |
| `/`                    | HomePage               | hero, best sellers, collections, FAQ         |
| `/shop`                | ShopPage               | all filter state in the query string         |
| `/shop/:slug`          | ProductDetailPage      | gallery, variants, stock, related            |
| `/cart`                | CartPage               |                                              |
| `/wishlist`            | WishlistPage           |                                              |
| `/checkout/:step`      | CheckoutLayout         | guest checkout · shipping → payment → review |
| `/orders`              | OrdersPage             | **protected** (history list)                 |
| `/orders/:orderId`     | OrderConfirmationPage  | public, so guests see their confirmation     |
| `/about`, `/contact`   | AboutPage, ContactPage |                                              |
| `/sign-in`, `/sign-up` | auth                   | returns you to where you were headed         |
| `*`                    | NotFoundPage           |                                              |

**Checkout does not require an account.** Pressing Checkout goes straight to the shipping
address; signing in is an optional convenience, not a gate on buying. A guest is given a
stable per-browser id (`getGuestId()` in `orderService`) so their orders still group
together, and only the order _history list_ sits behind `ProtectedRoute`.

Every page is `React.lazy`-loaded behind one `<Suspense>` in `RootLayout`, so a route change
swaps a skeleton in without blanking the header and footer. Inside that boundary an
`AnimatePresence` keyed on `pathname` cross-fades between pages — keyed on pathname only, so
changing a filter rewrites the query string without re-animating the whole page.

---

## State architecture

One provider per concern, composed in `app/providers.jsx`. No god-context.

| Concern         | Shape                                                     | Persisted as             | Hook                  |
| --------------- | --------------------------------------------------------- | ------------------------ | --------------------- |
| Cart            | `{ items: [{ productId, size, color, qty }], promoCode }` | `skenvision.cart.v1`     | `useCart()`           |
| Wishlist        | `{ productIds: string[] }`                                | `skenvision.wishlist.v1` | `useWishlist()`       |
| Auth            | `{ user, status, isSubmitting, error }`                   | `skenvision.session.v1`  | `useAuth()`           |
| Checkout draft  | local to `CheckoutLayout`, not a context                  | `skenvision.checkout.v1` | `useCheckoutForm()`   |
| Orders          | read through a service, never in context                  | `skenvision.orders.v1`   | `useOrders()`         |
| Catalog filters | **the URL**                                               | —                        | `useProductFilters()` |

Each context lives in a plain `.js` module and its provider in a separate `.jsx` file, so
every component file exports only components and fast refresh keeps working.

Each hook throws a named error when used outside its provider. Components never call
`useContext` directly.

### Derived data is computed, never stored

The cart holds only what the shopper chose. Price, line totals, subtotal, discount, shipping,
tax, total and item count are all derived at render:

- `lib/calculateTotals.js` — all order money math, pure, no React, integer cents only.
- `lib/cartLine.js` — `getLineId()` derives a line's identity from `productId + size + color`.
  It is not stored, and it is the React `key` for cart rows, because the same product can
  legitimately sit in the cart twice in two sizes.
- `useCartLines()` joins stored ids to the catalog and produces priced lines. The drawer, the
  cart page and the checkout review step all read it, which is why their totals cannot drift
  apart.

**All money is integer minor units (cents).** `price: 3995` renders as `$39.95` through
`formatCurrency`. This avoids float drift in tax and percentage-discount math. Rates live in
`lib/constants.js`: free shipping over $75, $6.90 flat below that, 8.25% tax, promo code
`SKGLOW10` for 10% off.

### Async data

Every fetch goes through one hook, `useAsync`, returning `{ data, loading, error, refetch }`.
Every consumer renders all three states — there are no silent failures and no
`loading && <div>Loading</div>` afterthoughts. Server data never goes into context.

---

## Swapping the mock service for a real API

`src/services/` is the only place data is accessed. Components never import from `src/data/`.

**Catalog** — `services/productService.js` has one private `request()` helper that currently
resolves local JSON after a simulated 180–520 ms delay. Replace its body with `fetch` and
keep the exported signatures:

```js
async function request(path) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`);
  if (!res.ok) throw new ServiceError(res.statusText, res.status);
  return res.json();
}

export const getProducts = () => request('/products');
export const getProductBySlug = (slug) => request(`/products/${slug}`);
```

Nothing else in the app changes, as long as the product shape holds:

```
{ id, slug, title, subtitle, description, excerpt, price, compareAtPrice,
  category, categories[], images[], rating, reviewCount, stock,
  variants: { sizes[], colors[] }, tags[], isBestSeller }
```

`price` and `compareAtPrice` are integers in cents. `images[]` holds manifest keys, resolved
to URLs by `lib/productImage.js` — point its two template strings at a CDN and every `<img>`
in the app follows.

**Orders** — `services/orderService.js` reads and writes localStorage behind `getOrders`,
`getOrderById` and `createOrder`. Swap those three for `GET /orders`, `GET /orders/:id` and
`POST /orders`.

**Auth** — `services/authService.js` is the whole fake. Replace `signUp` and `signIn` with
real calls that return a session; `AuthProvider` already handles loading, error and persistence.

**Toggle the error paths.** Set `MOCK_FAILURE_RATE` in `lib/constants.js` to e.g. `0.3` to
make 30% of catalog requests fail, which exercises every `ErrorPanel` and retry button.

---

## Images

`scripts/image-manifest.json` maps 79 source URLs to stable asset names and is committed, so
`npm run images` reproduces the whole asset set from scratch. The pipeline:

1. Downloads each original into `.cache/images` (gitignored, skipped if already cached).
2. Re-encodes to AVIF at widths chosen per role — products 400/800/1200, hero 768/1280/1920,
   editorial 600/1200, avatars 96/192, logo 200/400 — **never upscaling** past the source.
3. Writes `src/data/images.json` with each asset's intrinsic size, aspect ratio and available
   widths.

The `ui/Image` component is the only place an `<img>` is written. It reads that manifest to
emit a full `srcSet`, a `sizes` attribute, explicit `width`/`height` (so nothing shifts while
loading), `loading="lazy"` by default, and a shimmer placeholder that fades out on decode.
The hero is the one asset marked `priority` — it is the LCP element and is also preloaded
from `index.html`.

`sharp` is a devDependency used only by this script; it is not shipped to the browser.

---

## Performance

Verified from `pnpm run build` — no warnings, no chunk near the 500 kB budget:

```
react-vendor            303.01 kB │ gzip: 95.72 kB   (React + router)
motion-vendor           120.21 kB │ gzip: 41.31 kB   (Framer Motion + Lenis)
index                   100.17 kB │ gzip: 28.00 kB   (app shell)
catalog                  21.08 kB │ gzip:  6.71 kB
CheckoutLayout           15.01 kB │ gzip:  4.91 kB
marketing                10.80 kB │ gzip:  3.25 kB
css                      50.60 kB │ gzip:  9.60 kB
…every page chunk ≤ 5.4 kB
```

The two vendor chunks are split out deliberately: React and the animation libraries change
far less often than app code, so a deploy invalidates only the ~28 kB app shell.

- **Framer Motion is loaded through `LazyMotion` + the `m` component**, not the full `motion`
  bundle — it ships only the features actually used (variants, exit, gestures), which cut the
  entry chunk from 261 kB to 100 kB. ESLint bans importing `motion` so this cannot silently
  regress; if a layout animation is ever needed, swap `domAnimation` for `domMax` in
  `app/providers.jsx`.
- `MotionConfig reducedMotion="user"` makes every animation respect the OS setting, matching
  what the stylesheet already does for CSS transitions.
- Route-level code splitting; the landing page never downloads the checkout flow.
- Search debounced 300 ms via `useDebouncedCallback` — fired from the event handler, so there
  is no effect syncing state to state and no extra render per keystroke.
- `useMemo` is used in four places only, each justified in a comment: the catalog
  filter/sort/paginate pass, the three context values, the wishlist `Set` for O(1) lookups,
  and the derived cart item count. Nothing is memoised reflexively.
- Keys come from `product.id` or a derived line id — never an array index.
- `react-icons` is imported only by subpath (`react-icons/fi`); ESLint blocks the barrel
  import, which would pull in a 88 MB package.

---

## Accessibility

- Mobile-first; verified at 360 / 768 / 1024 / 1440 with no horizontal scroll.
- Semantic landmarks, one `<h1>` per page, a skip link to `#main`.
- Drawer and modal share `ui/Overlay`, so both get the same focus trap, Escape, click-outside,
  scroll lock (which also pauses Lenis) and focus return to the trigger.
- Every icon-only button has an `aria-label`; every input has a real `<label>` via `FormField`,
  which also wires `aria-describedby` to hints and errors.
- Cart count, filter result count, stock state and form errors are announced via `aria-live`.
- Visible focus rings everywhere — `outline` is never removed without a replacement.
- `prefers-reduced-motion` collapses animations and transitions.

---

## Deploying to Vercel

Import the repo and deploy — `vercel.json` carries the whole configuration. The site
builds and runs with no environment variables; Klaviyo tracking and email signups switch on
once the variables below are set (see `.env.example`).

### Klaviyo (email marketing)

| Variable                  | Where it is used       | Value                                                   |
| ------------------------- | ---------------------- | ------------------------------------------------------- |
| `VITE_KLAVIYO_PUBLIC_KEY` | browser (`klaviyo.js`) | the account's public site key (Settings > API keys)     |
| `KLAVIYO_PRIVATE_API_KEY` | `/api/subscribe` only  | a private key with Lists, Profiles, Subscriptions write |
| `KLAVIYO_LIST_ID`         | `/api/subscribe` only  | the id of the "Email List"                              |

Set `VITE_KLAVIYO_PUBLIC_KEY` for **Production** only if preview deploys should not send
events to the live account. Changing a `VITE_` variable needs a redeploy, because Vite bakes it
into the bundle.

What the site sends (all in `src/lib/klaviyo.js`):

- **Viewed Product** on each product page, plus `trackViewedItem` for recently-viewed blocks.
- **Added to Cart** with the whole bag, from `CartProvider.addItem`.
- **Started Checkout** when the shopper continues past the shipping step (first point we
  have their email).
- **identify** on sign in, sign up, signups and checkout, so events reach the right profile.
- Email signups (footer, spin wheel, quiz) go to `/api/subscribe`, which subscribes the
  address to the list with email marketing consent. The text-message field is not wired.
- Event `CheckoutURL`s are cart links (`/cart?items=...`) that rebuild the bag on any device.

Order events are sent from the server (`api/_lib/klaviyo.js`) once real checkout is on:

- **Placed Order** and one **Ordered Product** per item when PayPal confirms the payment.
- **Fulfilled Order** (with carrier and tracking number) when an order is marked shipped.
- **Refunded Order** and **Cancelled Order** from PayPal's refund, reversal and denial
  webhooks. Each event carries an `OrderURL` the shopper can open without signing in.

### Accounts, orders and payments (Supabase + PayPal)

With none of these set, the site keeps the original demo sign-in and demo checkout, so this
code can be merged before the accounts exist. Variables are listed in `.env.example`.

| Variable                                                                      | Turns on                                      |
| ----------------------------------------------------------------------------- | --------------------------------------------- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`                                 | real sign up and sign in                      |
| `VITE_PAYPAL_CLIENT_ID` (plus the two above)                                  | real checkout and order history               |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`                                   | the `/api` functions' database access         |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, `PAYPAL_WEBHOOK_ID` | payments                                      |
| `SITE_URL`, `ADMIN_API_TOKEN`                                                 | order links in emails; marking orders shipped |

One-time setup:

1. **Supabase** (free plan): create a project, open SQL Editor, run
   `supabase/migrations/0001_store.sql`, then run `pnpm db:seed` and paste the generated
   `supabase/seed.sql`. Under Authentication > URL Configuration set the Site URL to the
   store's address. Supabase's built-in email sender is rate limited; before launch add the
   store's own SMTP under Authentication > Emails.
2. **PayPal**: at developer.paypal.com create an app on the same business account the store
   uses (sandbox first). Add a webhook pointing at `https://<site>/api/paypal/webhook` for
   `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`,
   `PAYMENT.CAPTURE.REVERSED` and `PAYMENT.CAPTURE.DENIED`, and copy its id.
3. Add the variables in Vercel and redeploy. Place a sandbox order end to end, check it in
   Supabase's `orders` table and in Klaviyo's activity feed, then switch to the live app.

How checkout works: the browser sends only what is in the bag. `/api/checkout/create`
prices it from `products.json` with the same `calculateTotals` the storefront uses, saves a
pending order and opens a PayPal order for that exact total. After the shopper approves,
`/api/checkout/capture` captures the payment, checks the amount, marks the order paid,
lowers stock and sends the Klaviyo events. The webhook does the same if the browser closes
first, and records each PayPal event so a repeat delivery does nothing.

Marking an order shipped (until there is an admin screen):

```bash
curl -X POST https://<site>/api/admin/fulfill \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"orderNumber":"SK-XXXXXX","carrier":"USPS","trackingNumber":"9400..."}'
```

Tables have row level security on with no public policies: the browser can manage only its
own sign-in, and every read or write of orders goes through `/api` with the service key.

What that file does, and why:

- **`rewrites: /(.*) → /index.html`** (except `/api`, `/assets`, `/img`, `/og`). Routing is client-side, so without this a hard refresh
  or a shared link to `/shop/argan-shampoo` returns a 404. Vercel checks the filesystem
  _before_ applying rewrites, so real files under `/assets` and `/img` are unaffected by the
  catch-all.
- **`/assets/*` cached immutable for a year.** Vite content-hashes those filenames, so they
  can never go stale.
- **`/img/*` cached a week with `stale-while-revalidate`, deliberately not immutable.** AVIF
  filenames are stable rather than hashed, so re-running `pnpm run images` would otherwise be
  invisible to returning visitors for a year.

A few things that are easy to get wrong here:

- **`public/img` must stay committed.** `pnpm run images` is _not_ part of the build — it
  downloads 62 MB from the source site and needs `sharp`. Vercel serves exactly the 172 AVIFs
  in the repo (4.4 MB). The downloaded originals live in `.cache/` and are gitignored.
- **Node is pinned to `24.x`** via `engines.node`, which overrides the Vercel project
  setting. That is the version this was built and verified on. Vercel currently offers 22.x,
  24.x and 26.x — Node 20 is no longer supported there, so do not lower it.
- **pnpm is detected from `pnpm-lock.yaml`** (lockfileVersion 9.0). Keep that file committed;
  it is the only reason Vercel uses pnpm instead of npm.
- `sharp` is a devDependency and will be installed on the build machine, but nothing in
  `vite build` imports it, so it never reaches the browser bundle.

---

## Known limitations

1. **Auth is fake in demo mode.** (With Supabase configured, see Deploying.) Accounts and sessions live in localStorage in plain text and anyone can
   read or edit them from devtools. It exists so the order history has something to hang off,
   and it is labelled as such on the sign-in page. Checkout does not require it — see Routes.
   A guest who places an order and _then_ registers does not get that order linked to the new
   account.
2. **No payment processing in demo mode.** (With PayPal configured, see Deploying.) The payment step validates card numbers with a Luhn checksum and
   masks input, but nothing is transmitted. Only the last four digits are ever stored, and card
   fields are deliberately kept in memory — never written to localStorage — so a refresh
   mid-checkout clears them while the shipping address survives.
3. **Demo orders are per-browser.** Clearing site data loses order history.
4. **Stock numbers are synthesised.** The source API exposes only an in-stock boolean, so a
   deterministic per-product count is generated to exercise in-stock / low-stock / sold-out
   states. Prices, ratings, review counts, descriptions and variants are all real.
5. **Product titles were edited.** The source titles are SEO keyword dumps (e.g. _"Shampoo
   &#038; Conditioner For Silky Smooth For All Hair Types, haircare with Natural Argan
   Conditioner &#038; Oil shampoo"_). They are mapped to readable names in
   `scripts/generate-data.mjs`'s override table; descriptions are the originals, minus the `.mp4`
   URLs that were embedded in them.
6. **Size variants are inferred** for the argan haircare line from the bottle sizes shown on
   the product packaging. The colour axis on the Magic Hair Dye Shampoo is real API data.
7. **No scroll restoration on back/forward.** Navigation resets to the top through Lenis.
   React Router's `<ScrollRestoration>` fights Lenis for ownership of the scroll position, so
   it was left out in favour of predictable behaviour.
8. **The sort control is a custom listbox, not a `<select>`.** Native selects cannot be
   animated or styled, so `ui/Dropdown` implements the ARIA listbox pattern by hand
   (`aria-activedescendant`, arrow/Home/End/Enter/Escape, click-outside, focus return). It is
   keyboard-complete but, unlike a native select, it does not get the OS picker on mobile and
   has no type-ahead.
9. **Two Google Fonts are loaded** (Inter + Instrument Serif) with `preconnect` and
   `display=swap`. Self-hosting them would remove a third-party request.
10. **No automated tests.** `lib/` is written as pure functions specifically so
    `calculateTotals`, `validators` and `filterProducts` can be unit-tested without React, but
    no test runner is wired up.
11. **Light theme only.** Semantic tokens are defined in `@theme static` so they are always
    emitted as real custom properties on `:root`; adding a dark theme means redefining ~14
    variables under a `[data-theme="dark"]` selector, not touching component code.

---

## Attribution

Product data, copy, testimonials and imagery originate from
[skenvisiontime.com](https://skenvisiontime.com/) and belong to SK Envision. This is a
front-end rebuild for portfolio purposes. No orders are placed, no payments are processed,
and no email is sent.
