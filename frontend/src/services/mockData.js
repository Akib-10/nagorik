// Mock data for the frontend. Values shown in the UI are identical to the
// original Pages/*.html mockups. Components never import this file directly —
// they go through issuesService.js so the data source can later be swapped
// for real API calls without touching the UI.

export const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop'

export const feedIssues = [
  {
    id: 'feed-1',
    title: 'Noise pollution from construction',
    area: 'Bnasree',
    reporter: 'Abrar Bin Patwary',
    time: '1 week ago',
    statusClass: '',
    statusLabel: 'Ongoing',
    category: 'Public Safety',
    up: 12,
    down: '02',
    comments: 233,
    img: 'https://images.unsplash.com/photo-1541976590-713941681591?w=400&h=300&fit=crop',
    alt: 'Construction site',
  },
  {
    id: 'feed-2',
    title: 'Stealing cases are gradually increasing',
    area: 'Mohammadpur',
    reporter: 'Farhana Rahman',
    time: '1 week ago',
    statusClass: '',
    statusLabel: 'Ongoing',
    category: 'Public Safety',
    up: 12,
    down: '02',
    comments: 233,
    img: 'https://images.unsplash.com/photo-1590644365607-1c5a4b0f6f0e?w=400&h=300&fit=crop',
    alt: 'Construction site',
  },
  {
    id: 'feed-3',
    title: 'Price hike of daily commodities in Dhaka city',
    area: 'Dhanmondi',
    reporter: 'Farhana Rahman',
    time: '2 days ago',
    statusClass: '',
    statusLabel: 'Ongoing',
    category: 'Other',
    up: 12,
    down: '02',
    comments: 233,
    img: 'https://images.unsplash.com/photo-1541976590-713941681591?w=400&h=300&fit=crop',
    alt: 'Construction site',
  },
]

export const trendingIssues = [
  { id: 'tr-1', title: 'Gorilla ran out of from Gazipur Safari Park', votes: 12, time: '1 week ago', img: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=100&h=100&fit=crop' },
  { id: 'tr-2', title: 'Random boy drowned in Chandrima Lake', votes: '05', time: '1 week ago', img: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=100&h=100&fit=crop' },
  { id: 'tr-3', title: 'Kindergarten boy hijacked from public bus', votes: 12, time: '1 week ago', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop' },
  { id: 'tr-4', title: 'Gorilla ran out of from Gazipur Safari Park', votes: 12, time: '1 week ago', img: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=100&h=100&fit=crop' },
]

export const upvotedIssues = [
  { id: 'uv-1', title: 'Noise pollution from construction in Bnasree', area: 'Bnasree', by: 'Abrar Bin Patwary', time: '1 week ago', up: 12, down: 2, comments: 233, img: 'https://images.unsplash.com/photo-1541976590-713941681591?w=400&h=300&fit=crop' },
  { id: 'uv-2', title: 'Stealing cases are gradually increasing', area: 'Mohammadpur', by: 'Farhana Rahman', time: '1 week ago', up: 12, down: 2, comments: 233, img: 'https://images.unsplash.com/photo-1590644365607-1c5a4b0f6f0e?w=400&h=300&fit=crop' },
  { id: 'uv-3', title: 'Price hike of daily commodities in Dhaka city', area: 'Dhanmondi', by: 'Farhana Rahman', time: '2 days ago', up: 12, down: 2, comments: 233, img: 'https://images.unsplash.com/photo-1541976590-713941681591?w=400&h=300&fit=crop' },
]

// Seeded "My Reports" — same three demo reports as the original user.html,
// with their statuses merged in so every report is self-contained.
export const seedMyReports = [
  {
    id: 'rep-1',
    title: 'Large pothole on Mirpur Road causing accidents',
    area: 'Mirpur 10',
    by: 'You',
    time: '2 days ago',
    statusClass: 'st-progress',
    statusLabel: 'In progress',
    category: 'Roads & Infrastructure',
    priority: 'High / Emergency',
    date: '',
    description: '',
    address: '',
    up: 342,
    down: 11,
    comments: 47,
    photos: [],
    img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
  },
  {
    id: 'rep-2',
    title: 'Street lights out on entire Green Road stretch',
    area: 'Dhanmondi',
    by: 'You',
    time: '1 week ago',
    statusClass: '',
    statusLabel: 'Open',
    category: 'Street Lights',
    priority: 'Medium',
    date: '',
    description: '',
    address: '',
    up: 215,
    down: 8,
    comments: 31,
    photos: [],
    img: 'https://images.unsplash.com/photo-1518481852452-9415b262eba4?w=400&h=300&fit=crop',
  },
  {
    id: 'rep-3',
    title: 'Sewage overflow near Hatirjheel lake inlet',
    area: 'Hatirjheel',
    by: 'You',
    time: '2 weeks ago',
    statusClass: 'st-done',
    statusLabel: 'Resolved',
    category: 'Water Logging',
    priority: 'Medium',
    date: '',
    description: '',
    address: '',
    up: 489,
    down: 21,
    comments: 62,
    photos: [],
    img: 'https://images.unsplash.com/photo-1523867574650-fd3ee4b32e8f?w=400&h=300&fit=crop',
  },
]
