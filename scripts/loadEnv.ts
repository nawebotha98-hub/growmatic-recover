// Shared env loader for the CLI scripts. Next.js reads .env.local
// automatically, but standalone tsx scripts don't — so load it here.
// .env.local wins; .env is a fallback and never overrides an already-set var.
import { config } from "dotenv";

config({ path: ".env.local" });
config();
