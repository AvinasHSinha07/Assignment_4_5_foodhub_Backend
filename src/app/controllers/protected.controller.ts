import type { Request, Response } from "express";
import { sendResponse } from "../shared/sendResponse";

const getCustomerOnly = (_req: Request, res: Response) => {
  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Customer access granted",
  });
};

const getProviderOnly = (_req: Request, res: Response) => {
  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Provider access granted",
  });
};

const getAdminOnly = (_req: Request, res: Response) => {
  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Admin access granted",
  });
};

export const ProtectedController = {
  getCustomerOnly,
  getProviderOnly,
  getAdminOnly,
};

export { getAdminOnly, getCustomerOnly, getProviderOnly };
