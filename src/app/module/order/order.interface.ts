export type TCreateOrderItemInput = {
  mealId: string;
  quantity: number;
};

export type TCreateOrderInput = {
  deliveryAddress: string;
  items: TCreateOrderItemInput[];
};

export type TOrderItemSummary = {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  meal: {
    id: string;
    title: string;
    image: string | null;
  };
};

export type TOrderSummary = {
  id: string;
  totalPrice: number;
  deliveryAddress: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  provider: {
    id: string;
    name: string;
    restaurantName: string | null;
  };
  items: TOrderItemSummary[];
};

export type TGetMyOrdersResult = {
  data: TOrderSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};
