# Part D Acceptance Checklist: Results (built 2026-11-03)

**How this was tested:**
- The setup SQL was run (twice) on a real PostgreSQL 16 with Supabase-style auth roles. Every security rule was then exercised as a guest, a logged-in customer, and the admin: 24 checks, all passed.
- The built site was driven in a real Chromium browser against a mock of her Supabase API:
  - 130 page renders (16 pages × EN/ES × light/dark × phone/desktop, plus the age gate): 0 problems. The checks were for no errors, no TruPep or location text, no untranslated keys, no $0/NaN, no sideways scroll on phone, the right language and theme, and a title on every page.
  - 27 end-to-end flows: 27/27 passed.
- Lint: 0 errors, 0 warnings. Production build: OK.

**Still has to be checked on the live preview:** anything that needs her real Supabase project, Formspree, the Anthropic key, or a real phone (see Pending).

| # | Part D item | Result | Evidence |
|---|---|---|---|
| 1 | All 16 pages render in EN + ES, light + dark, phone + desktop | **PASS** (live phone check pending) | 130 renders, 0 problems; EN/ES dictionaries 470 = 470 keys, all 369 keys used in code exist |
| 2 | Catalog matches confirmed list; every variant has a photo and a price | **PASS**: code + data. **PENDING**: the 32 WebP files | 26 products / 32 sizes; all 25 A3 prices match exactly (BAC Water $30); each size shows its own photo; Wolverine shows "Price coming soon" until priced. Run `node scripts/check-images.mjs` after adding the files |
| 3 | Cart: upsell shows/hides; standard $15 + overnight TBD math | **PASS** | BAC Water add-on shows "$30", adds it, then hides. $105 + $15 = $120.00; overnight shows "$105.00 + shipping" |
| 4 | Guest test order → `orders`, email arrives, confirmation shows VV- number | **PASS** (DB row + VV- number). **PENDING**: email, since Formspree isn't created yet | VV- number matches the order id. With no Formspree, the mailto fallback opened and was noted on the confirmation |
| 5 | Built-in % code works; second use with same email blocked | **PASS** | "The code WELCOME10 has already been used with this email." Also checked in SQL (case and spacing don't matter) |
| 6 | Throwaway DB code: flat $, burns after one order, rejected after | **PASS** | $5 off (total 80 − 5 + 15 = 90); row deleted on redemption; second try = "Invalid code." `redeem_promo` only burns a code for a real order that used it |
| 7 | WELCOME10 works in checkout | **PASS** | Real built-in 10% code: subtotal 105 → discount_amount 10.50 → total 109.50 |
| 8 | Review → hidden → admin approves → on homepage; photo; PENDING badge shows & clears | **PASS** | Pending + photo upload; hidden publicly; tab "REVIEWS · PENDING (1)" → after approve "REVIEWS"; review appears on homepage |
| 9 | Admin: 5 tabs load; badges for new orders/reviews clear once checked | **PASS** | Clean `/admin` URL; non-admin logins refused; Orders badge "2" cleared when opened (`orders_seen_at` stamped in DB) |
| 10 | Password reset link lands on thevialvault843.com and a new password can be set | **PENDING (live)** | The site asks Supabase to return to `<site>/#/account`. Needs Auth → URL Configuration set on her project first (Muse step 3a) |
| 11 | Chat answers a product question and a COA question | **PASS (widget)**. **PENDING**: live answers | Both questions sent and answers shown. Live answers need `ANTHROPIC_API_KEY` on Vercel; the prompt says a COA is "available upon request" |
| 12 | Calculator + syringe visual; tour runs start to finish | **PASS** | 0.25mg / 10mg vial / 2.0mL → 5.0 units, syringe drawn. All 6 tour steps stay on screen (bug fixed, see below) |
| 13 | No test data remains | **PASS** (nothing seeded except the catalog + placeholder settings). Live cleanup SQL is in SETUP.md | |

## Bugs found in the TruPep code and fixed here (worth porting back to TruPep)
1. **Security: any logged-in customer could change products and prices.** TruPep's `supabase-schema.sql` lets every authenticated user write to `products` and to the image/COA storage. Here, writes are admin-only via `is_admin()`. **Check TruPep's live policies.**
2. `admins` table policy queried `admins` itself (the 42P17 recursion pattern). It is replaced by `is_admin()`.
3. The seed SQL had a trailing comma before `on conflict`, so the file failed to run.
4. `check_promo_used` was called by the site but missing from the setup SQL files.
5. `redeem_promo` would delete any code without an order. It now requires a real order that used the code.
6. The storefront reads `description_es`, but no column existed. Spanish name and description are now columns, seeded and editable in the admin.
7. Closing the cart with **Escape** after ordering left the old confirmation stuck in the cart.
8. Tour step 4 ("Real customer reviews") placed its card off-screen on phone and desktop.
9. The admin panel opened for any logged-in user; data was protected but the UI wasn't. It now checks the `admins` table.
10. The guest order rule now also refuses orders pre-marked as "paid".
