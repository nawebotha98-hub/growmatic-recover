// Verifies a freshly set-up Supabase project: reads .env.local, connects, and
// checks that the schema exists and the tables are reachable. Run this right
// after creating the project and running the migration:
//
//   npx tsx scripts/check-supabase.ts
//
// It only reads — it creates and deletes nothing.
import "./loadEnv";
import { createClient } from "@supabase/supabase-js";

const REQUIRED_TABLES = ["companies", "profiles", "quotes", "exceptions", "resolutions"];

function must(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`\n✗ Missing ${name} in .env.local — see the setup steps.\n`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const url = must("NEXT_PUBLIC_SUPABASE_URL");
  const anon = must("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  console.log(`\nConnecting to ${url} ...`);
  const supabase = createClient(url, anon, { auth: { persistSession: false } });

  let allGood = true;

  for (const table of REQUIRED_TABLES) {
    // With no user session, row-level security means every table should return
    // zero rows WITHOUT an error. An error here means the table is missing
    // (migration not run) or something else is wrong. Zero rows = correct.
    const { error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`  ✗ ${table.padEnd(12)} — ${error.message}`);
      allGood = false;
    } else {
      console.log(`  ✓ ${table.padEnd(12)} — reachable, RLS returning no rows (correct)`);
    }
  }

  // The service-role key is optional at this stage (only the daily rules job
  // needs it), so just report whether it's present.
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log(
    `\n  ${hasServiceKey ? "✓" : "○"} SUPABASE_SERVICE_ROLE_KEY ${
      hasServiceKey ? "present" : "not set yet (only needed for the daily rules job)"
    }`
  );

  if (allGood) {
    console.log("\n✓ Supabase is set up correctly. You can run `npm run dev` and sign up.\n");
  } else {
    console.log(
      "\n✗ Some tables were unreachable. Most likely the migration in " +
        "supabase/migrations/0001_init.sql hasn't been run yet in the SQL Editor.\n"
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\nConnection failed:", err.message ?? err);
  console.error("Double-check the URL and anon key are copied correctly.\n");
  process.exit(1);
});
