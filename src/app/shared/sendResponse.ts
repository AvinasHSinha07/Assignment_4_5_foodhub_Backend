import type { Response } from "express";

type TMeta = Record<string, unknown>;

type TResponse<T> = {
  success: boolean;
  httpStatusCode: number;
  message: string;
  data?: T;
  meta?: TMeta;
};

export const sendResponse = <T>(res: Response, payload: TResponse<T>) => {
  const { httpStatusCode, ...responseData } = payload;
  return res.status(httpStatusCode).json(responseData);
};
