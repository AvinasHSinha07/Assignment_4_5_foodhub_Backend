import app from "./app";
import { env } from "./config/env";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`FoodHub backend running on http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server.");
  server.close(() => {
    console.log("HTTP server closed.");
  });
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection detected:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception detected:", error);
  process.exit(1);
});
