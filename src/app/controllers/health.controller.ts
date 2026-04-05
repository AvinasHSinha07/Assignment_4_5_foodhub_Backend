import type { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service";
import { sendResponse } from "../shared/sendResponse";

const getHealth = (_req: Request, res: Response) => {
  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "FoodHub API healthy",
    data: getHealthStatus(),
  });
};

export const HealthController = {
  getHealth,
};

export { getHealth };
