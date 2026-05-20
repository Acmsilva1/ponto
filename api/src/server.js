import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, env.HOST, () => {
  console.log(
    JSON.stringify({
      level: "info",
      message: "Server started",
      host: env.HOST,
      port: env.PORT
    })
  );
});
