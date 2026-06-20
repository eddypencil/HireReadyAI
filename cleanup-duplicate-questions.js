/**
 * cleanup-duplicate-questions.js
 *
 * Finds all (application_stage_id, order_index) slots with more than one row
 * in application_questions and deletes the extras, keeping the "best" row:
 *   - Prefer rows that have an answer (answer_text != null)
 *   - Prefer rows that have a score
 *   - Tie-break: keep the oldest (lowest created_at)
 *
 * Run with: node cleanup-duplicate-questions.js [optional_stage_id]
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl  = process.env.VITE_SUPABASE_URL;
const supabaseKey  = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const stageFilter  = process.argv[2] ?? null; // optional: filter to a single stage

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching all application_questions with answers...");

  let query = supabase
    .from("application_questions")
    .select(`
      id, application_stage_id, order_index, question_text,
      application_answers ( answer_text, score )
    `)
    .order("order_index", { ascending: true });

  if (stageFilter) {
    query = query.eq("application_stage_id", stageFilter);
    console.log("Filtering to stage:", stageFilter);
  }

  const { data: rows, error } = await query;
  if (error) { console.error("Fetch error:", error); process.exit(1); }

  console.log(`Found ${rows.length} total question rows.`);

  // Group by (stage_id, order_index)
  const groups = {};
  for (const row of rows) {
    const key = `${row.application_stage_id}::${row.order_index}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }

  const toDelete = [];

  for (const [key, group] of Object.entries(groups)) {
    if (group.length <= 1) continue; // no duplicates

    // Score each row: 0 = unanswered, 1 = answered, 2 = answered+scored
    const scored = group.map((r) => {
      const ans = r.application_answers;
      const ansObj = Array.isArray(ans) ? ans[0] : ans;
      const hasAnswer = ansObj?.answer_text != null;
      const hasScore  = ansObj?.score != null;
      return { ...r, _priority: hasAnswer ? (hasScore ? 2 : 1) : 0 };
    });

    // Sort descending by priority (best first)
    scored.sort((a, b) => b._priority - a._priority);

    const [keep, ...discard] = scored;
    console.log(`\nSlot [${key}]: ${group.length} rows → keeping id=${keep.id} (priority=${keep._priority})`);
    discard.forEach((d) => console.log(`  DELETE id=${d.id} (priority=${d._priority})`));
    toDelete.push(...discard.map((d) => d.id));
  }

  if (toDelete.length === 0) {
    console.log("\nNo duplicates found. Database is clean!");
    return;
  }

  console.log(`\nDeleting ${toDelete.length} duplicate rows...`);

  // Delete in batches of 50
  for (let i = 0; i < toDelete.length; i += 50) {
    const batch = toDelete.slice(i, i + 50);
    const { error: delError } = await supabase
      .from("application_questions")
      .delete()
      .in("id", batch);
    if (delError) {
      console.error("Delete error:", delError);
    } else {
      console.log(`  Deleted batch ${i / 50 + 1}: ${batch.length} rows`);
    }
  }

  console.log("\nDone! Run again to verify there are no more duplicates.");
}

main().catch(console.error);
