<p align="center">
  <img src="assets/chukanest-banner.svg" alt="ChukaNest — verified student housing" width="100%" />
</p>

<p align="center">
  <strong>A safer, simpler way for Chuka University students to find verified accommodation.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#configuration">Configuration</a> ·
  <a href="#security">Security</a> ·
  <a href="#deployment">Deployment</a>
</p>

# ChukaNest

ChukaNest is a full-stack hostel-finder platform designed for students at **Chuka University, Kenya**. Students can browse verified hostels, compare prices and amenities, save favourites, read and submit reviews, use AI-assisted search, and contact support. Owners can manage listings through a dedicated portal, while administrators can verify listings, moderate reviews, manage users, and record owner subscriptions.

## Features

- **Hostel discovery:** Browse listings with price, room type, distance, amenities, ratings, availability, and verification status.
- **Search and filtering:** Search by hostel or room type, filter by accommodation type, sort by rating, price, or distance, and use natural-language AI search.
- **Maps and saved hostels:** Explore accommodation locations and save favourites to a personal account.
- **Reviews:** Students can submit reviews; administrators can review flagged content.
- **AI assistant:** Ask questions about available hostels, compare options, and receive recommendations based on preferences.
- **Owner portal:** Owners can register, pay for listing visibility, upload media, create listings, and manage their accommodation details.
- **Administration:** Admin users can verify listings, manage users, moderate reviews, configure support information, and record offline owner payments.
- **Responsive PWA experience:** The interface works across desktop and mobile browsers and can be installed as a progressive web app.
- **Media storage:** Profile images and listing media are designed for Cloudinary-backed durable storage rather than relying on ephemeral server disks.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind utility classes, Lucide icons |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Authentication | JWT sessions, bcrypt password hashing, optional Google OAuth |
| Media | Cloudinary image and video storage |
| Payments | Safaricom M-Pesa Daraja STK Push |
| AI | OpenAI-compatible Groq API integration |
| Deployment | Railway-ready single service |

## Getting started

### Requirements

- Node.js 20 or newer
- npm
- MongoDB Atlas or a local MongoDB instance
- Cloudinary credentials for persistent uploads
- Optional: Groq, Google OAuth, and M-Pesa credentials

### Install and run locally

```bash
git clone https://github.com/njogu26713-commits/chukanest.git
cd chukanest
npm install
npm run dev
```

The development command starts:

- Vite frontend on `http://localhost:5000`
- Express API on port `3001`

The Vite development proxy forwards `/api/*` requests to the Express server.

### Production build

```bash
npm run build
npm start
```

The Express server serves the compiled frontend from `dist/` and exposes the API from the same service.

## Configuration

Create a local `.env` file, or configure the equivalent variables in Railway. Never commit real credentials to the repository.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `SESSION_SECRET` | Yes in production | Random JWT signing secret, at least 32 characters |
| `CLOUDINARY_URL` | Uploads | Standard Cloudinary URL, or use the three Cloudinary variables below |
| `CLOUDINARY_CLOUD_NAME` | Uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Uploads | Cloudinary API secret |
| `GROQ_API_KEY` | Optional | Enables AI search, recommendations, and chat |
| `GOOGLE_CLIENT_ID` | Optional | Enables Google sign-in |
| `ADMIN_INVITE_CODE` | Optional | Enables private admin registration through the API |
| `CORS_ORIGINS` | Separate frontend only | Comma-separated allowed browser origins in production |
| `MPESA_CONSUMER_KEY` | Live payments | Safaricom Daraja consumer key |
| `MPESA_CONSUMER_SECRET` | Live payments | Safaricom Daraja consumer secret |
| `MPESA_SHORTCODE` | Live payments | M-Pesa PayBill or Till shortcode |
| `MPESA_PASSKEY` | Live payments | Daraja Lipa na M-Pesa passkey |
| `MPESA_CALLBACK_URL` | Live payments | Public HTTPS callback ending in `/api/payments/callback` |
| `MPESA_ENV` | Optional | `sandbox` or `production`; defaults to `sandbox` |
| `MPESA_TEMPORARY_MODE` | Local testing only | Set explicitly to `true` only when intentionally simulating payments |

For a same-origin Railway deployment, `CORS_ORIGINS` can normally remain unset. For a separately hosted frontend, set it to the exact frontend origin, for example:

```env
CORS_ORIGINS=https://app.example.com
```

## Project structure

```text
server/
  index.js                 Express entry point and security middleware
  security.js              Shared JWT secret validation
  db.js                    MongoDB connection
  middleware/auth.js       JWT and role authorization middleware
  models/                  Mongoose schemas
  routes/                  Auth, hostels, reviews, users, AI, uploads, support, payments, owners
src/
  App.jsx                  Main screens and application navigation
  OwnerPortal.jsx          Owner dashboard
  api.js                   Frontend API client
public/                    PWA manifest and service worker
assets/                    Repository documentation assets
```

## API overview

Sensitive routes require a valid bearer token and, where applicable, the correct role.

| Area | Example routes |
| --- | --- |
| Authentication | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/google` |
| Hostels | `GET /api/hostels`, `GET /api/hostels/:id` |
| Reviews | `GET /api/hostels/:hostelId/reviews`, `POST /api/hostels/:hostelId/reviews` |
| AI | `POST /api/ai/search`, `POST /api/ai/recommend`, `POST /api/ai/chat` |
| Users | `GET /api/users/me/bookmarks`, `POST /api/users/me/bookmarks/:hostelId` |
| Owners | `GET /api/owner/listings`, `POST /api/owner/listings` |
| Payments | `POST /api/payments/stk`, `POST /api/payments/owner-stk` |
| Health | `GET /api/health` |

## Security

ChukaNest includes application-level protections for production use:

- Helmet security headers and disabled Express fingerprinting
- Strict, configurable CORS instead of unrestricted cross-origin access
- Global API rate limiting plus tighter authentication and AI limits
- Authentication required for AI endpoints and owner/admin operations
- Production enforcement of a strong `SESSION_SECRET`
- Request body size limits and constrained multipart upload limits
- Multer, Express, and `qs` dependencies kept current against known advisories
- Allowlisted fields for admin user and hostel updates to prevent mass assignment
- Explicit opt-in for temporary payment simulation
- Replay protection for completed or failed M-Pesa callbacks
- Password hashing with bcrypt and role checks on protected routes

Security is a continuing process rather than an absolute guarantee. Keep dependencies updated, use HTTPS, configure provider billing alerts, rotate secrets if exposure is suspected, and perform an independent penetration test before handling significant payment volume or sensitive personal data.

## Deployment

The repository includes Railway configuration for a single production service:

```bash
npm install
npm run build
npm start
```

Before going live:

1. Set a strong `SESSION_SECRET` of at least 32 characters.
2. Use a managed MongoDB deployment with backups enabled.
3. Configure Cloudinary for durable image and video storage.
4. Configure exact `CORS_ORIGINS` values when frontend and backend are separated.
5. Keep `MPESA_TEMPORARY_MODE` disabled in production.
6. Configure the Daraja callback URL over HTTPS.
7. Set provider usage and billing alerts.
8. Verify that no `.env` files or credentials are tracked by Git.

## Development scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite and Express together |
| `npm run dev:client` | Start only the Vite frontend |
| `npm run dev:server` | Start only the Express backend |
| `npm run build` | Create the production frontend build |
| `npm start` | Run the production server |

## License

This project is private software. Add the appropriate license before distributing or open-sourcing the code.
