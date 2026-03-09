import { handle } from '@hono/node-server/vercel';

import app from './index.js';

export default handle(app);
