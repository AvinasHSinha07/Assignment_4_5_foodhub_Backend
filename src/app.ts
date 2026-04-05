import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { getBetterAuthHandler } from "./lib/betterAuth";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.all("/api/v1/auth/core/*splat", async (req, res, next) => {
  try {
    const handler = await getBetterAuthHandler();
    return handler(req, res, next);
  } catch (error) {
    return next(error);
  }
});

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodHub backend is running",
    docs: "/api/v1/health",
  });
});

app.use("/api/v1", IndexRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
