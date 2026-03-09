# muralMaDrs

muralMaDrs is a community mural directory for discovering, sharing, and reviewing street art.

## Stack
- Runtime: Bun
- Server: Hono
- Language: TypeScript
- Database: MongoDB with Mongoose
- Views: Server-rendered TSX
- Styling: Tailwind CSS v4
- Maps: Mapbox GL JS
- Uploads: Cloudinary with local fallback

## Requirements
- Bun 1.2+
- MongoDB instance
- Optional Mapbox token for maps and geocoding
- Optional Cloudinary credentials for hosted image uploads

## Local setup
1. Install dependencies:
```bash
bun install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your values.

4. Start development server:
```bash
bun run dev
```

5. Open:
- `http://localhost:3000`

## Scripts
- `bun run dev`: start server in watch mode
- `bun run dev:full`: start server and CSS watcher
- `bun run start`: start server without watch mode
- `bun run typecheck`: TypeScript check
- `bun run lint`: ESLint check
- `bun run lint:fix`: ESLint auto-fix
- `bun run build:css`: compile and minify CSS
- `bun run build:css:watch`: watch and rebuild CSS

## Environment variables
| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | No | `development`, `test`, or `production` |
| `PORT` | No | HTTP port, default `3000` |
| `DB_URL` | Yes | MongoDB connection string |
| `SECRET` | Yes | Session signing secret |
| `SESSION_COOKIE_NAME` | No | Session cookie key |
| `SESSION_TTL_DAYS` | No | Session TTL in days |
| `MAPBOX_TOKEN` | Optional | Enables map rendering and geocoding |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary uploads |
| `CLOUDINARY_KEY` | Optional | Cloudinary uploads |
| `CLOUDINARY_SECRET` | Optional | Cloudinary uploads |

## Project layout
```text
src/
  app.tsx             # Hono app and middleware
  index.ts            # Vercel Hono entrypoint
  dev-server.ts       # local Bun runtime bootstrap
  config/
  middleware/
  models/
  routes/
  services/
  views/
public/
  javascripts/
  stylesheets/
```

## Deployment (Vercel)
This project deploys through Vercel's zero-config Hono support using `src/index.ts`.

Current `vercel.json` behavior:
- disables framework preset auto-detection so Vercel does not treat the repo as an old Express app
- lets Vercel serve `public/**` assets directly and route application requests to the Hono entrypoint

## Notes
- If Cloudinary is not configured, uploads are written to `public/uploads`.
- If Mapbox is not configured, map UI falls back gracefully.
- Keep `NODE_ENV=development` for local work unless you are testing production behavior.

## License
ISC
