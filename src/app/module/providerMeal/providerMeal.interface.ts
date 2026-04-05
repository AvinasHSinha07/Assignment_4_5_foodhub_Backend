export type TProviderMealPayload = {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string;
  dietaryTag?: string;
  isAvailable?: boolean;
};

export type TProviderMealUpdatePayload = Partial<TProviderMealPayload>;
