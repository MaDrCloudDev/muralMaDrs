import { handle } from 'hono/vercel';

import app from '../src/app.tsx';

export default handle(app);
