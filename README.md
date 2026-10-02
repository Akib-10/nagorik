# nagorik

NAGORIK (নাগরিক) is a modern civic-tech platform for reporting, discussing, and tracking local community issues such as potholes, garbage, power outages, water problems, and safety hazards. Built as a university project, it connects citizens through community engagement and helps prioritize issues based on public feedback.

## Project structure

```text
nagorik/
├── frontend/                  # Vite + React frontend (active development)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/        # logos, map, artwork
│   │   ├── components/        # headers, footer, icons, auth-gated links
│   │   ├── hooks/             # usePageStyles
│   │   ├── pages/             # Home, Login, BrowseFeed, UserProfile, ReportIssue
│   │   ├── services/          # mock data + issue/session services (future API layer)
│   │   ├── styles/            # landing.css + style.css (used verbatim)
│   │   ├── App.jsx            # routes
│   │   └── main.jsx           # entry + BrowserRouter
│   ├── index.html
│   └── vite.config.js         # /api proxy -> http://localhost:5000
├── backend/                   # Express backend — placeholder structure only,
│   ├── routes/                # to be implemented in a later phase
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── server.js              # minimal placeholder server (health route)
│   └── package.json
└── README.md
```

## Routes

| Route           | Page                                   |
|-----------------|----------------------------------------|
| `/`             | Landing page                           |
| `/login`        | Log in / Register (`?next=` supported) |
| `/browse_feed`  | Civic issues feed (search, tabs, voting) |
| `/user`         | Profile (reports / upvoted / settings) |
| `/report`       | Report-an-issue wizard (3 steps, edit supported via profile) |
| `/settings`     | Settings (appearance/dark mode, notifications, privacy) |

## Run the frontend

```bash
cd frontend
npm install
npm run dev      # dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint     # eslint
```

## Run the backend

```bash
cd backend
npm install
copy .env.example .env   # cp on macOS/Linux — then fill in the values
npm start                # Express on http://localhost:5000
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000`, so frontend API calls target relative `/api/...` paths during development.

## Media storage (Cloudinary)

All user media (profile pictures, issue photos and videos) is stored in **Cloudinary**;
MongoDB only keeps metadata references (`publicId`, `url`, `resourceType`, dimensions).
Nothing is written to disk and no base64 blobs are stored in the database.

Set the following in `backend/.env` (see `backend/.env.example`):

```text
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MAX_IMAGE_SIZE_MB=10
MAX_VIDEO_SIZE_MB=200
MAX_ISSUE_MEDIA_COUNT=5
```

- Small images upload through the backend (`POST /api/issues`, `PUT /api/issues/:id`, `POST /api/profile/picture`).
- Large videos use a signed **browser → Cloudinary** direct upload via `POST /api/upload/signature`, so they never pass through Express.
- Files are validated server-side by magic-byte sniffing, not client MIME type.
- Folders: `nagorik/users/profile`, `nagorik/issues/images`, `nagorik/issues/videos`.
- If Cloudinary env vars are missing, the server still boots but media routes return `503`.
- To migrate legacy base64 / `/uploads` media into Cloudinary, run `node scripts/migrateMediaToCloudinary.js` (requires credentials).



## Architecture notes

- **Service layer:** components never touch data directly. All issue/report data flows through `src/services/issuesService.js`, which currently serves mock data (`src/services/mockData.js`) plus `localStorage`. When the Node.js backend arrives, the function bodies become `fetch('/api/...')` calls and no component needs to change.
- **Demo session/auth** uses the original `localStorage` keys (`nagorik_auth`, `nagorik_user`, `nagorik_settings`) so behaviour matches the legacy pages exactly.
- The two stylesheets are intentionally loaded **one per page** (landing pages → `landing.css`, app pages → `style.css`), exactly like the original multi-page site, because both files define rules for the same class names. See `src/hooks/usePageStyles.js`.
- Submitted reports persist in `localStorage` (`nagorik_user_reports`) and appear both in the browse feed and under "My Reports" on the profile page.
