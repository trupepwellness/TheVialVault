// Checks that every product photo the catalog expects is present in public/products/.
// Run from the project folder:  node scripts/check-images.mjs
// The expected names are read straight from vialvault-setup.sql, so this can't drift.
import { readFileSync, readdirSync, existsSync } from "node:fs";

const sql = readFileSync(new URL("../vialvault-setup.sql", import.meta.url), "utf8");
const expected = [...new Set([...sql.matchAll(/\/products\/(vial-[a-z0-9-]+\.webp)/g)].map((m) => m[1]))].sort();
const dir = new URL("../public/products/", import.meta.url);
const present = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".webp")).sort() : [];

const missing = expected.filter((f) => !present.includes(f));
const extra = present.filter((f) => !expected.includes(f));
console.log(`Expected ${expected.length} photos, found ${present.length} in public/products/.`);
if (missing.length) console.log("\nMISSING (rename a file to this, or fix the name in the SQL):\n  " + missing.join("\n  "));
if (extra.length) console.log("\nNOT USED by any product (name doesn't match):\n  " + extra.join("\n  "));
if (!missing.length && !extra.length) console.log("All product photos are in place. ✓");
process.exit(missing.length ? 1 : 0);
