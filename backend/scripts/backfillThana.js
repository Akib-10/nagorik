// One-off backfill: reports used to store the location only inside the free-text
// `address` field ("Road: 27, Area: Dhanmondi, Thana: Dhanmondi, City: Dhaka").
// Pull the thana/city out of that string so Top reporting areas has data for
// reports filed before the Issue schema gained its own `thana`/`city` fields.
import '../config/env.js';
import mongoose from 'mongoose';
import Issue from '../models/Issue.js';

const pick = (address, label) => {
  const match = String(address || '').match(new RegExp(`${label}:\\s*([^,]+)`, 'i'));
  return match ? match[1].trim() : '';
};

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  await mongoose.connect(process.env.MONGO_URI);

  // Only reports missing the structured fields are touched.
  const stale = await Issue.find({
    $or: [{ thana: { $in: [null, ''] } }, { city: { $in: [null, ''] } }],
  })
    .select('address thana city')
    .lean();

  let updated = 0;
  for (const issue of stale) {
    const thana = issue.thana || pick(issue.address, 'Thana');
    const city = issue.city || pick(issue.address, 'City');
    if (!thana && !city) continue;
    if (dryRun) {
      console.log(`${issue._id}: thana="${thana}" city="${city}"`);
      updated += 1;
      continue;
    }
    await Issue.updateOne({ _id: issue._id }, { $set: { thana, city } });
    updated += 1;
  }

  console.log(
    dryRun
      ? `${updated} report(s) would gain a thana/city.`
      : `Backfilled thana/city on ${updated} report(s).`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('backfillThana error:', err.message);
  process.exit(1);
});