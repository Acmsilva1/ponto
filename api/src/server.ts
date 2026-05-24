import { env } from './config/env.js';
import { createApp } from './app.js';

const app = await createApp();

app.listen(env.port, () => {
  console.log(`API pronta em http://localhost:${env.port}`);
});
