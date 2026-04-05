import { env } from "../../config/env";

export const getHealthStatus = () => ({
  status: "ok",
  environment: env.NODE_ENV,
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
});
