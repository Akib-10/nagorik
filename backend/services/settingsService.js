
import Setting from '../models/Setting.js';

// approvalMode decides what happens to a NEW report:
//   'manual' - it waits as "pending" until an admin approves it (default)
//   'all'    - every new report is approved automatically
export const APPROVAL_MODES = ['manual', 'all'];
export const DEFAULT_APPROVAL_MODE = 'manual';

export async function getApprovalMode() {
  try {
    const row = await Setting.findOne({ key: 'approvalMode' }).lean();
    return APPROVAL_MODES.includes(row?.value) ? row.value : DEFAULT_APPROVAL_MODE;
  } catch (err) {
    // If settings can't be read, fail safe: keep reports for manual review.
    console.error('[settings] could not read approvalMode:', err.message);
    return DEFAULT_APPROVAL_MODE;
  }
}

export async function setApprovalMode(mode) {
  await Setting.findOneAndUpdate(
    { key: 'approvalMode' },
    { value: mode },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return mode;
}
