# The Vial Vault: Setup & Go-Live

This is TruPep Wellness's storefront rebuilt as **The Vial Vault**. It has her name, her vault logo, rose-gold colors, her own Supabase backend and her own admin. The site does not show a physical location anywhere.

## What's in this folder

| File | What it is |
|---|---|
| `main.jsx` | The whole site: storefront, cart/checkout, account, admin dashboard |
| `i18n.js` | Every string in English + Spanish (470 keys each, matched 1:1) |
| `catalog.js` | Categories + the 7 curated stacks (shared by site and chat) |
| `logoData.js` | Her vault logo, embedded so it can't fail to load |
| `api/chat.js` | Chat assistant (Vercel function, uses `ANTHROPIC_API_KEY`) |
| `vialvault-setup.sql` | **Her entire backend in one file**: tables, security rules, promo engine, reviews, analytics, 26-product catalog |
| `public/products/` | Put the 32 finished vial WebPs here |
| `scripts/check-images.mjs` | Confirms all 32 photo names match the catalog |
| `vercel.json` | Clean `/admin` URL |
| `.env.example` | The 3 environment variables Vercel needs |

## Setup order

1. **Repo:** On a new branch of `trupepwellness/TheVialVault`, replace the old files with these. Delete the old `main.jsx`, `vite_config.js` (the misnamed duplicate), and anything else from the old build.
2. **Photos:** Copy the 32 `vial-<product>-<size>.webp` files into `public/products/`, then run `node scripts/check-images.mjs`. It must print "All product photos are in place." If a name doesn't match, rename the file. Never edit or regenerate the images. `label-master.png` is the reference if image work is ever needed.
3. **Supabase:** Create a **new** project for The Vial Vault. Never use TruPep's.
   - Do this **first**: Authentication → URL Configuration. Set Site URL to `https://www.thevialvault843.com`. Add these redirect URLs: `https://www.thevialvault843.com/**`, `https://thevialvault843.com/**`, and the Vercel preview domain `/**`.
   - SQL Editor → paste all of `vialvault-setup.sql` → Run. It is safe to run again.
   - Authentication → Users → Add user: `thevialvault843@gmail.com` with the password Tristan provides, Auto Confirm on. Then re-run only section 9 of the SQL (the `insert into public.admins …` statement).
4. **Vercel env vars** (Production + Preview): `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from her new project, plus `ANTHROPIC_API_KEY`.
5. **Preview first:** Push the branch and open the Vercel preview link. Nothing merges until Tristan approves that preview.

## Things she sets later, with no code change (Admin → Settings / Products)

- **Payment handles** (Zelle phone/email + name, Venmo, PayPal, optional Cash App). They are seeded as `PLACEHOLDER — set in Admin › Settings`. Anything still a placeholder is hidden from shoppers, who instead see "Payment details will be sent with your order confirmation."
- **Wolverine 20mg price.** It shows as "Price coming soon" and can't be bought until a price is entered.
- **Stock counts.** These start at 0, so the admin list shows "Low stock" until she sets them. Shoppers don't see that badge at 0.
- **New reward codes** (database single-use codes) need no deploy. Run one SQL line:
  `insert into discount_codes (code, kind, amount, note) values ('THANKSNAME15', 'flat', 15, 'review reward');`
  The code deletes itself the moment an order uses it.

## One code value to drop in later

**Formspree (order emails):** at the top of `main.jsx`, set
`const FORMSPREE = "https://formspree.io/f/XXXXXXXX";`
Until then, every order and contact message opens a pre-filled email to thevialvault843@gmail.com (the mailto fallback), so nothing is lost. Orders are still saved to the database either way.

## Promo codes

Built-in percent codes (each one usable once per email): WELCOME10 10%, VAULT5 5%, PEPTIDE10 10%, VAULT15 15%, INLET20 20%, VENOM25 / PRIDE25 / LUIS25 25%, ROSEGOLD30 30%, BLAZING35 35%, QUEENVAULT40 40%, GODMODE45 45%, ULTRAVIP50 50%, DIAMOND55 55%.
Edit the list in `PROMO_CODES` near the top of `main.jsx`.

## Review-reward play (same as TruPep)

Text customers: $15 off for a review, $30 total with a before & after photo. When they reply DONE, approve the review in Admin → Reviews. Then insert a named single-use code (e.g. `THANKSJANE15`, flat 15 or 30) and text it back.

## Test-data cleanup (run after preview testing)

```sql
delete from public.orders  where customer_email ilike 'vvtest%';
delete from public.reviews where name ilike '%test%';
delete from public.discount_codes where code like 'VVTEST%';
```
