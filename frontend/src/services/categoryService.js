// Categories are managed by admins (Admin Panel -> Categories) and stored in the
// backend. The report form reads them here, so a category an admin adds shows up
// in the "Category" dropdown straight away.
import { api } from './api'

export async function getCategories() {
  return api.get('/categories') // [{ id, name, color }]
}
