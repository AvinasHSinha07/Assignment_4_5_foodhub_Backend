import { env } from "../config/env";
import { AppError } from "../app/utils/AppError";

const Stripe = require("stripe");

let stripeInstance: any = null;

const getStripeSecretKey = () => {
  const key = env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new AppError(500, "Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }

  return key;
};

export const getStripe = () => {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getStripeSecretKey(), {
      apiVersion: "2025-03-31.basil",
    });
  }

  if (!stripeInstance) {
    throw new AppError(500, "Failed to initialize Stripe");
  }

  return stripeInstance;
};

export const getStripeWebhookSecret = () => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError(500, "Stripe webhook is not configured. Set STRIPE_WEBHOOK_SECRET.");
  }

  return env.STRIPE_WEBHOOK_SECRET;
};
