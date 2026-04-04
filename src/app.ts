import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodHub backend is running",
    docs: "/api/v1/health",
  });
});

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodHub API healthy",
    timestamp: new Date().toISOString(),
  });
});

export default app;
