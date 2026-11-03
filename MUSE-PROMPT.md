# Prompt for Muse: load The Vial Vault rebuild

Copy everything below the line into Muse.

---

You're deploying a finished website rebuild for **The Vial Vault** (thevialvault843.com). The code is done and tested. Your job is to load it, connect its backend, and put up a **preview link for Tristan's approval**. Do not design, rewrite or "improve" anything.

**Inputs you have:** this zip (the full project), the 32 finished product photos (`vial-<product>-<size>.webp`), `label-master.png`, and the admin password Tristan gives you.

## Hard rules
- The Vial Vault gets its **own NEW Supabase project**. Never connect to, copy from, or write to TruPep's Supabase project.
- Never hardcode or commit the admin password. Enter it only in the Supabase dashboard.
- Never put TruPep's payment handles (Zelle/Venmo/PayPal) anywhere in this build.
- Never edit, regenerate or redraw product photos. If image work is ever needed, `label-master.png` is the reference.
- **Preview first:** work on a branch. Nothing merges to main or goes live until Tristan approves the preview link.
- Do not commit `.env`, `node_modules` or `dist`.

## Steps
1. **Branch.** In GitHub repo `trupepwellness/TheVialVault`, create branch `vialvault-rebuild`. Replace the old files with this zip's contents: delete the old `main.jsx`, `vite_config.js`, `vite.config.js` and any other old files, then add the new ones. The root should hold: `index.html, main.jsx, i18n.js, catalog.js, logoData.js, package.json, package-lock.json, vite.config.js, vercel.json, vialvault-setup.sql, api/, public/, scripts/, SETUP.md, MUSE-PROMPT.md, PART-D-REPORT.md, .env.example, .gitignore`.
2. **Photos.** Put all 32 WebPs in `public/products/`. Run `node scripts/check-images.mjs`; it must end with "All product photos are in place." If a file name doesn't match, rename the **file** to the expected name, but only after confirming the label on that photo shows that exact product and size. Report any photo whose label doesn't match its name instead of using it.
3. **Supabase (new project, name it "the-vial-vault").**
   a. **First:** Authentication → URL Configuration. Site URL = `https://www.thevialvault843.com`. Redirect URLs = `https://www.thevialvault843.com/**`, `https://thevialvault843.com/**`, and this Vercel project's preview domain with `/**`.
   b. SQL Editor → run the whole of `vialvault-setup.sql`. It should finish with no errors.
   c. Authentication → Users → Add user → `thevialvault843@gmail.com` + Tristan's password, Auto Confirm ON. Then run only the section-9 statement from the SQL file (`insert into public.admins …`).
   d. Check: Table Editor → `products` has 26 rows; `site_settings` has 1 row; `admins` has 1 row.
4. **Vercel** (the existing The Vial Vault project, which serves thevialvault843.com): add env vars for **Production and Preview**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (from the NEW project → Settings → API), and `ANTHROPIC_API_KEY`. Push the branch and get the **preview URL**.
5. **Test on the preview, on an Android phone too.** Use email `vvtest@example.com` for every test order.
   - Pages: open every page in EN and ES, light and dark.
   - Order: add BPC-157 10mg. The BAC Water add-on appears; add it ($30) and it disappears. Total = $120.00 with Standard shipping.
   - Apply `WELCOME10` → 10% off → submit as a guest. You should get a **VV-** order number, and the order appears in Supabase `orders`. Your email app opens with the order (this is expected until Formspree is added).
   - Second order with the same email + `WELCOME10` must be **blocked**.
   - Run in SQL: `insert into discount_codes (code, kind, amount, note) values ('VVTEST5','flat',5,'throwaway test');` Order with `VVTEST5` → $5 off, and the row disappears from `discount_codes`. Using it again must say "Invalid code."
   - Submit a homepage review with a photo, named "Linny Test". It must NOT show publicly. In `/admin`, the Reviews tab shows Pending (1); approve it and it appears on the homepage. Then delete it.
   - `/admin`: log in as thevialvault843@gmail.com. All 5 tabs load (Products, Orders, Customers, Reviews, Analytics). The red badges on Orders/Reviews clear once each tab is opened. The Settings button opens the payment-handle form.
   - Account page → "Forgot password" for thevialvault843@gmail.com. The email link must open thevialvault843.com (or the preview), **not localhost**, and a new password must save. (Then give the password back to Tristan's chosen one.)
   - Chat bubble: ask "What is BPC-157?" and "Can I get a COA?". The COA answer should say it's available on request.
   - Calculator: pick a dose, vial and water → the syringe drawing fills. "Take a tour" runs all 6 steps.
6. **Clean up all test data**, then confirm the tables are clean:
   ```sql
   delete from public.orders  where customer_email ilike 'vvtest%';
   delete from public.reviews where name ilike '%test%';
   delete from public.discount_codes where code like 'VVTEST%';
   ```
7. **Send Tristan** the preview link plus a pass/fail list for step 5. Wait for his explicit approval, then merge `vialvault-rebuild` into main and confirm https://www.thevialvault843.com shows the new site.

## Left for later (do NOT invent values)
- Payment handles: Madre enters them in **Admin → Settings**. Until then shoppers see "payment details will be sent with your confirmation."
- Wolverine 20mg price: **Admin → Products → Wolverine → Edit**. It shows "Price coming soon" until then.
- Formspree: when her form exists, set `const FORMSPREE = "https://formspree.io/f/…";` at the top of `main.jsx`, then do a preview → approve → merge.
- Stock counts per product: Admin → Products.
