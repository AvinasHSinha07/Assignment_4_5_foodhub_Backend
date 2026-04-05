export type TCheckoutItemInput = {
  mealId: string;
  quantity: number;
};

export type TCreatePaymentIntentInput = {
  deliveryAddress: string;
  items: TCheckoutItemInput[];
};

export type TConfirmPaymentInput = TCreatePaymentIntentInput & {
  paymentIntentId: string;
};

export type TCreateOrderPaymentIntentInput = {
  orderId: string;
};

export type TConfirmOrderPaymentInput = {
  orderId: string;
  paymentIntentId: string;
};

export type TPaymentIntentResponse = {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
};
