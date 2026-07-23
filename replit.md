# ChukaNest

A hostel-finder web app for Chuka University students in Kenya. Students can browse, filter, bookmark, and review verified student accommodations near campus.

## Stack

- **Frontend**: React 18 + Vite (port 5000)
- **Backend**: Node.js + Express (port 3001)
- **Database**: MongoDB (via Mongoose)
- **Auth**: JWT (`SESSION_SECRET` env var)

## Running the app

```bash
npm install
npm run dev
```

Both the Vite dev server (port 5000) and Express API (port 3001) start concurrently. The Vite proxy forwards all `/api/*` requests to Express.

## Environment secrets

| Key | Description |
|-----|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `SESSION_SECRET` | JWT signing secret |

## Project structure

```
server/
  index.js          — Express entry point
  db.js             — MongoDB connection
  seed.js           — Seed data (runs on first boot)
  middleware/
    auth.js         — JWT requireAuth / requireAdmin middleware
  models/
    Hostel.js       — Hostel schema
    Review.js       — Review schema
    User.js         — User schema (bcrypt passwords)
  routes/
    auth.js         — POST /api/auth/login|signup
    hostels.js      — CRUD /api/hostels
    reviews.js      — /api/hostels/:id/reviews + flagged
    users.js        — /api/users + bookmarks
src/
  main.jsx          — React entry
  App.jsx           — All screens and components
  api.js            — Fetch wrapper for all API calls
```

## Demo accounts (seeded on first boot)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@chukanest.co.ke | Admin1234! |
| Student | faith@students.chuka.ac.ke | Student123! |

## Key API routes

- `POST /api/auth/login` — returns JWT + user
- `POST /api/auth/signup` — creates account + returns JWT
- `GET /api/hostels` — active listings; `?status=pending` for admin
- `GET /api/hostels/:id/reviews` — reviews for a hostel
- `POST /api/hostels/:id/reviews` — add review (auth required)
- `GET /api/reviews/flagged` — flagged reviews (admin only)
- `GET /api/users` — user list (admin only)
- `POST /api/users/me/bookmarks/:hostelId` — toggle bookmark

## Notes

- The seed script uses `User.collection.insertMany()` (not `User.insertMany()`) to bypass the Mongoose `pre('save')` hook and avoid double-hashing passwords.
- Hostels with `status: "pending"` appear in the admin Verifications tab.
- Bookmarks are stored per-user in MongoDB and synced to the frontend on login.

## User preferences

- Keep existing project structure; do not migrate or restructure without being asked.
