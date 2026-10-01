// Mock data that powers the admin dashboard.
// The real backend doesn't expose admin endpoints yet, so this local,
// in-memory dataset lets every screen (issues, users, categories,
// analytics) be fully interactive during development. Swapping this for
// real `/api/admin/...` calls later shouldn't require touching the pages
// themselves — read from here the same way the rest of the app reads
// from `mockData.js` via a service layer.

export const STATUS_OPTIONS = ['Open', 'In progress', 'Resolved', 'Rejected']

export const initialCategories = [
  { id: 'cat-1', name: 'Roads & Infrastructure', color: '#C8102E', issueCount: 42 },
  { id: 'cat-2', name: 'Street Lights', color: '#E8A33D', issueCount: 18 },
  { id: 'cat-3', name: 'Water Logging', color: '#2E8B57', issueCount: 26 },
  { id: 'cat-4', name: 'Public Safety', color: '#8C0B22', issueCount: 33 },
  { id: 'cat-5', name: 'Garbage & Sanitation', color: '#6B5D5A', issueCount: 21 },
  { id: 'cat-6', name: 'Other', color: '#9C8D8A', issueCount: 9 },
]

export const initialIssues = [
  { id: 'adm-1', title: 'Large pothole on Mirpur Road causing accidents', area: 'Mirpur 10', reporter: 'Abrar Bin Patwary', category: 'Roads & Infrastructure', statusLabel: 'In progress', priority: 'High', flagged: false, up: 342, down: 11, comments: 47, date: '2026-09-12' },
  { id: 'adm-2', title: 'Street lights out on entire Green Road stretch', area: 'Dhanmondi', reporter: 'Farhana Rahman', category: 'Street Lights', statusLabel: 'Open', priority: 'Medium', flagged: false, up: 215, down: 8, comments: 31, date: '2026-09-14' },
  { id: 'adm-3', title: 'Sewage overflow near Hatirjheel lake inlet', area: 'Hatirjheel', reporter: 'Farhana Rahman', category: 'Water Logging', statusLabel: 'Resolved', priority: 'Medium', flagged: false, up: 489, down: 21, comments: 62, date: '2026-09-02' },
  { id: 'adm-4', title: 'Noise pollution from construction site at night', area: 'Bnasree', reporter: 'Abrar Bin Patwary', category: 'Public Safety', statusLabel: 'Open', priority: 'Low', flagged: false, up: 12, down: 2, comments: 9, date: '2026-09-17' },
  { id: 'adm-5', title: 'Stealing cases gradually increasing near market', area: 'Mohammadpur', reporter: 'Farhana Rahman', category: 'Public Safety', statusLabel: 'In progress', priority: 'High', flagged: true, up: 178, down: 5, comments: 44, date: '2026-09-10' },
  { id: 'adm-6', title: 'Overflowing garbage bins for two weeks', area: 'Uttara', reporter: 'Rafiul Islam', category: 'Garbage & Sanitation', statusLabel: 'Open', priority: 'Medium', flagged: false, up: 96, down: 3, comments: 15, date: '2026-09-16' },
  { id: 'adm-7', title: 'Broken footpath tiles causing falls', area: 'Banani', reporter: 'Nusrat Jahan', category: 'Roads & Infrastructure', statusLabel: 'Rejected', priority: 'Low', flagged: false, up: 6, down: 14, comments: 3, date: '2026-08-29' },
  { id: 'adm-8', title: 'Water logging after light rain blocks main road', area: 'Jatrabari', reporter: 'Rafiul Islam', category: 'Water Logging', statusLabel: 'In progress', priority: 'High', flagged: false, up: 267, down: 9, comments: 38, date: '2026-09-11' },
  { id: 'adm-9', title: 'Suspicious posts spamming the feed', area: 'Gulshan', reporter: 'Unknown User', category: 'Other', statusLabel: 'Open', priority: 'Low', flagged: true, up: 2, down: 31, comments: 1, date: '2026-09-18' },
  { id: 'adm-10', title: 'Faulty transformer sparking near school', area: 'Mirpur 2', reporter: 'Nusrat Jahan', category: 'Public Safety', statusLabel: 'Resolved', priority: 'High', flagged: false, up: 401, down: 6, comments: 71, date: '2026-08-20' },
]

export const initialUsers = [
  { id: 'u-1', name: 'Abrar Bin Patwary', email: 'abrar.patwary@example.com', role: 'Citizen', status: 'Active', reports: 14, joined: '2025-11-02' },
  { id: 'u-2', name: 'Farhana Rahman', email: 'farhana.rahman@example.com', role: 'Citizen', status: 'Active', reports: 22, joined: '2025-09-18' },
  { id: 'u-3', name: 'Rafiul Islam', email: 'rafiul.islam@example.com', role: 'Moderator', status: 'Active', reports: 8, joined: '2025-06-30' },
  { id: 'u-4', name: 'Nusrat Jahan', email: 'nusrat.jahan@example.com', role: 'Citizen', status: 'Active', reports: 19, joined: '2025-12-05' },
  { id: 'u-5', name: 'Tanvir Ahmed', email: 'tanvir.ahmed@example.com', role: 'Citizen', status: 'Suspended', reports: 3, joined: '2026-01-14' },
  { id: 'u-6', name: 'Admin Nagorik', email: 'admin@nagorik.app', role: 'Admin', status: 'Active', reports: 0, joined: '2025-05-01' },
]

export const activityLog = [
  { id: 'a-1', text: 'Resolved "Sewage overflow near Hatirjheel lake inlet"', time: '2 hours ago' },
  { id: 'a-2', text: 'Suspended user Tanvir Ahmed for repeated spam reports', time: '5 hours ago' },
  { id: 'a-3', text: 'Added new category "Garbage & Sanitation"', time: '1 day ago' },
  { id: 'a-4', text: 'Flagged "Suspicious posts spamming the feed" for review', time: '1 day ago' },
  { id: 'a-5', text: 'Rejected "Broken footpath tiles causing falls" (duplicate)', time: '3 days ago' },
]
