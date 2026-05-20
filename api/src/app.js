import { createServer } from "node:http";

import { env } from "./config/env.js";
import { createContainer } from "./shared/container.js";
import { AppError } from "./shared/domain/app-error.js";
import { json } from "./shared/http/json.js";
import { notFoundHandler } from "./shared/http/not-found-handler.js";
import { createRateLimiter } from "./shared/http/rate-limit.js";
import { createRouter } from "./shared/http/router.js";
import { withSecurityHeaders } from "./shared/http/security.js";
import { registerHealthRoutes } from "./features/health/health.routes.js";
import { registerTimeEntriesRoutes } from "./features/time-entries/time-entry.routes.js";

export function createApp() {
  const container = createContainer();
  const router = createRouter();
  const rateLimiter = createRateLimiter();

  registerHealthRoutes(router, env.API_PREFIX);
  registerTimeEntriesRoutes(router, env.API_PREFIX, container);

  return createServer(async (req, res) => {
    const startedAt = Date.now();
    const correlationId = req.headers["x-correlation-id"] ?? crypto.randomUUID();
    const origin = req.headers.origin;

    withSecurityHeaders(res, origin);
    res.setHeader("x-correlation-id", correlationId);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      const requestIp = req.socket.remoteAddress ?? "unknown";
      const rateLimitResult = rateLimiter.check(requestIp);

      if (!rateLimitResult.allowed) {
        json(res, 429, {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests"
          },
          correlationId
        });
        return;
      }

      const handled = await router.handle(req, res, {
        correlationId,
        startedAt,
        requestIp
      });

      if (!handled) {
        notFoundHandler(req, res, correlationId);
      }
    } catch (error) {
      const normalizedError =
        error instanceof AppError
          ? error
          : new AppError("Unexpected internal error", 500, "INTERNAL_SERVER_ERROR");

      json(res, normalizedError.statusCode, {
        error: {
          code: normalizedError.code,
          message: normalizedError.message,
          details: normalizedError.details ?? null
        },
        correlationId
      });
    }
  });
}
