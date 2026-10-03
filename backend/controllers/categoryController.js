import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Issue from '../models/Issue.js';

const CASE_INSENSITIVE = { locale: 'en', strength: 2 };
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// Used only when the collection is empty (first run), so the report form never
// ends up with an empty dropdown. After that, the admin owns the list.
export const DEFAULT_CATEGORIES = [
  { name: 'Roads & Transportation', color: '#C8102E' },
  { name: 'Water Logging', color: '#2E8B57' },
  { name: 'Waste Management', color: '#6B5D5A' },
  { name: 'Street Lights', color: '#E8A33D' },
  { name: 'Public Safety', color: '#8C0B22' },
  { name: 'Other', color: '#9C8D8A' },
];

async function ensureSeeded() {
  if ((await Category.estimatedDocumentCount()) > 0) return;
  try {
    // ordered:false + the unique index make a race between two first requests harmless.
    await Category.insertMany(DEFAULT_CATEGORIES, { ordered: false });
  } catch (err) {
    if (err?.code !== 11000 && !err?.writeErrors) throw err;
  }
}

const serialize = (c, issueCount) => ({
  id: c._id,
  name: c.name,
  color: c.color,
  ...(issueCount !== undefined ? { issueCount } : {}),
});

// True when `name` is one of the categories a reporter may currently choose.
// Skipped (returns true) when no categories exist at all.
export async function isSelectableCategory(name) {
  await ensureSeeded();
  const clean = String(name || '').trim();
  if (!clean) return false;
  return !!(await Category.exists({ name: clean }).collation(CASE_INSENSITIVE));
}

// Canonical spelling for a category name (so "water logging" is stored as "Water Logging").
export async function canonicalCategoryName(name) {
  const row = await Category.findOne({ name: String(name || '').trim() })
    .collation(CASE_INSENSITIVE)
    .select('name')
    .lean();
  return row?.name || null;
}

// GET /api/categories — public; feeds the report form's dropdown.
export async function listCategories(req, res) {
  try {
    await ensureSeeded();
    const rows = await Category.find().sort({ createdAt: 1, _id: 1 }).lean();
    res.json(rows.map((c) => serialize(c)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET /api/admin/categories — same list plus how many reports use each one.
export async function listCategoriesAdmin(req, res) {
  try {
    await ensureSeeded();
    const [rows, usage] = await Promise.all([
      Category.find().sort({ createdAt: 1, _id: 1 }).lean(),
      Issue.aggregate([{ $group: { _id: { $toLower: { $ifNull: ['$category', ''] } }, count: { $sum: 1 } } }]),
    ]);
    const usageMap = Object.fromEntries(usage.map((u) => [u._id, u.count]));
    res.json(rows.map((c) => serialize(c, usageMap[c.name.toLowerCase()] || 0)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

function readBody(body = {}, { partial = false } = {}) {
  const out = {};
  if (!partial || body.name !== undefined) {
    const name = String(body.name ?? '').trim().replace(/\s+/g, ' ');
    if (!name) return { error: 'Category name is required.' };
    if (name.length > 40) return { error: 'Category name must be 40 characters or fewer.' };
    out.name = name;
  }
  if (body.color !== undefined) {
    if (!HEX_COLOR.test(String(body.color))) return { error: 'Color must be a hex value like #C8102E.' };
    out.color = String(body.color);
  }
  return { value: out };
}

// POST /api/admin/categories  body: { name, color }
export async function createCategory(req, res) {
  try {
    const { value, error } = readBody(req.body);
    if (error) return res.status(400).json({ message: error });
    await ensureSeeded();
    const created = await Category.create(value);
    res.status(201).json(serialize(created, 0));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'A category with that name already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// PATCH /api/admin/categories/:id  body: { name?, color? }
// Renaming also renames the tag on existing reports so they stay in the category.
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid category id' });
    const { value, error } = readBody(req.body, { partial: true });
    if (error) return res.status(400).json({ message: error });

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Not found' });

    const oldName = category.name;
    if (value.name !== undefined) category.name = value.name;
    if (value.color !== undefined) category.color = value.color;
    await category.save();

    if (category.name !== oldName) {
      await Issue.updateMany({ category: oldName }, { $set: { category: category.name } });
    }
    const issueCount = await Issue.countDocuments({ category: category.name });
    res.json(serialize(category, issueCount));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'A category with that name already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE /api/admin/categories/:id — existing reports keep the name as text; it
// just stops being selectable for new reports.
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid category id' });
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    await category.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
