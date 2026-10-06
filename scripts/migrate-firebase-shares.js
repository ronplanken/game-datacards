#!/usr/bin/env node

/**
 * One-time migration script: Firebase Firestore shares -> Supabase category_shares
 *
 * Prerequisites:
 *   1. Set environment variables:
 *      - GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
 *      - SUPABASE_URL=https://your-project.supabase.co
 *      - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *   2. Install dev dependency: yarn add --dev firebase-admin
 *
 * Usage:
 *   node scripts/migrate-firebase-shares.js
 *   node scripts/migrate-firebase-shares.js --dry-run
 */

const admin = require("firebase-admin");
const { createClient } = require("@supabase/supabase-js");

const BATCH_SIZE = 500;
const FIREBASE_COLLECTION = "shares";
const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  console.log(`Firebase -> Supabase category_shares migration${DRY_RUN ? " (DRY RUN)" : ""}`);
  console.log("=".repeat(60));

  // Initialize Firebase Admin
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error("Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set");
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  const db = admin.firestore();

  // Initialize Supabase with service role key
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Count total documents
  const collectionRef = db.collection(FIREBASE_COLLECTION);
  const snapshot = await collectionRef.count().get();
  const totalDocs = snapshot.data().count;
  console.log(`Found ${totalDocs} documents in Firebase "${FIREBASE_COLLECTION}" collection`);

  let processed = 0;
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  let lastDoc = null;

  while (true) {
    // Paginate through Firebase documents
    let query = collectionRef.orderBy("__name__").limit(BATCH_SIZE);
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const batch = await query.get();
    if (batch.empty) break;

    const rows = [];

    for (const doc of batch.docs) {
      const data = doc.data();
      const categoryUuid = data.category?.uuid || null;

      rows.push({
        share_id: doc.id,
        user_id: null,
        category: data.category || {},
        description: data.description || null,
        likes: data.likes || 0,
        views: data.views || 0,
        version: data.version || null,
        category_uuid: categoryUuid,
        is_public: true,
        deleted: false,
        version_number: 1,
        created_at: data.createdAt || new Date().toISOString(),
      });

      lastDoc = doc;
    }

    processed += rows.length;

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would insert ${rows.length} rows (${processed}/${totalDocs})`);
      inserted += rows.length;
    } else {
      // Insert with ON CONFLICT DO NOTHING (via upsert with ignoreDuplicates)
      const { data: result, error } = await supabase
        .from("category_shares")
        .upsert(rows, { onConflict: "share_id", ignoreDuplicates: true })
        .select("share_id");

      if (error) {
        console.error(`Batch error at ${processed}/${totalDocs}:`, error.message);
        errors += rows.length;
      } else {
        const insertedCount = result?.length || 0;
        inserted += insertedCount;
        skipped += rows.length - insertedCount;
        console.log(`Inserted ${insertedCount} / ${rows.length} rows (${processed}/${totalDocs}, ${skipped} skipped)`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Migration complete:");
  console.log(`  Total processed: ${processed}`);
  console.log(`  Inserted:        ${inserted}`);
  console.log(`  Skipped:         ${skipped}`);
  console.log(`  Errors:          ${errors}`);

  // Verify count
  if (!DRY_RUN) {
    const { count, error } = await supabase.from("category_shares").select("*", { count: "exact", head: true });

    if (!error) {
      console.log(`  Supabase total:  ${count}`);
    }
  }

  process.exit(errors > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
