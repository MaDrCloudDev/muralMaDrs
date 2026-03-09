# muralMaDrs

muralMaDrs is a server-rendered mural directory for finding public art, sharing new murals, and leaving reviews.

This version is the post-refactor codebase. The old Express app, the Bun runtime, and the one-off Vercel experiments are gone. The project now runs on Node, pnpm, Hono, and TypeScript.

## Stack
- Node 22
- pnpm
- Hono
- TypeScript
- MongoDB with Mongoose
- Tailwind CSS v4
- Mapbox GL JS
- Cloudinary for hosted uploads, with a local fallback for development

## What changed
- moved the app from npm to pnpm
- replaced Express with Hono
- converted the app from JavaScript to TypeScript
- cleaned up the project layout into `config`, `middleware`, `services`, `routes`, and `views`
- tightened environment validation and response headers
- switched Vercel to a bundled Hono serverless entry so deploys are predictable

## Requirements
- Node 22 or newer
- pnpm 9 or newer
- MongoDB
- Optional Mapbox token for maps and geocoding
- Optional Cloudinary credentials for production-safe image uploads

## Local setup
1. Install dependencies.

```bash
pnpm install
```

2. Copy the example environment file.

```bash
cp .env.example .env
```

3. Fill in your values.

At minimum you need:
- `DB_URL`
- `SECRET`

4. Start the app.

```bash
pnpm run dev
```

5. Open `http://localhost:3000`.

If you are actively changing Tailwind styles, use this instead:

```bash
pnpm run dev:full
```

## Scripts
- `pnpm run dev` starts the local server in watch mode
- `pnpm run dev:full` starts the server and the CSS watcher together
- `pnpm run start` starts the local server without watch mode
- `pnpm run typecheck` runs TypeScript checks
- `pnpm run lint` runs ESLint
- `pnpm run lint:fix` runs ESLint with automatic fixes
- `pnpm run build:css` compiles and minifies the Tailwind output
- `pnpm run build:css:watch` watches and rebuilds CSS
- `pnpm run build:vercel` builds the bundled Vercel function used in production

## Environment variables
| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | No | Defaults to `development` locally. Vercel will run with `production`. |
| `PORT` | No | Local server port. Defaults to `3000`. |
| `DB_URL` | Yes | MongoDB connection string. |
| `SECRET` | Yes | Session signing secret. Use a long random value in production. |
| `SESSION_COOKIE_NAME` | No | Cookie name for the session and flash data. |
| `SESSION_TTL_DAYS` | No | Session lifetime in days. |
| `MAPBOX_TOKEN` | No | Enables interactive maps and geocoding. Without it, the map UI falls back cleanly. |
| `CLOUDINARY_CLOUD_NAME` | No | Required if you want persistent hosted uploads. |
| `CLOUDINARY_KEY` | No | Required if you want persistent hosted uploads. |
| `CLOUDINARY_SECRET` | No | Required if you want persistent hosted uploads. |

## Project layout
```text
src/
  index.ts        # Hono app, middleware, and routes
  vercel.ts       # Vercel serverless entrypoint
  dev-server.ts   # local Node server bootstrap
  config/
  middleware/
  models/
  routes/
  services/
  views/
public/
  javascripts/
  stylesheets/
api/
  index.ts        # thin Vercel wrapper
```

`api/app.mjs` is generated during the Vercel build and is not checked in.

## Deploying to Vercel
1. Import the repository into Vercel.
2. Set `Framework Preset` to `Other`.
3. Add the environment variables from `.env.example`.
4. If you want image uploads in production, add the Cloudinary credentials. The local upload fallback writes to `public/uploads`, which is fine for local development but not for a serverless filesystem.
5. Deploy.

The repo already includes a [`vercel.json`](./vercel.json) file that:
- runs the bundle build for the Vercel function
- routes app traffic through the tracked `api/index.ts` wrapper
- leaves static assets in `public/`

You do not need to add custom install, build, or output settings in the Vercel dashboard unless you want to override what is already in the repo.

## License
ISC
