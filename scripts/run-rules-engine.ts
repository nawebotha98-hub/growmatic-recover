// Run the daily rules check by hand: `npm run rules:run`
// Useful before you've wired up a cron scheduler, or to spot-check after
// changing DEFAULT_THRESHOLDS in lib/rules-engine.ts.
import "./loadEnv";
import { runRulesEngine } from "../lib/runRulesEngine";

runRulesEngine()
  .then((summary) => {
    console.log(
      `Checked ${summary.checked} open quotes — ${summary.flagged} currently flagged, ${summary.newlyCreated} newly recorded.`
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error("Rules engine run failed:", err);
    process.exit(1);
  });
