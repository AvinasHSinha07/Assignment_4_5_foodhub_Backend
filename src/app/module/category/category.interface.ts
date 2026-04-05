export type TCategorySummary = {
  id: string;
  name: string;
  slug: string;
  mealCount: number;
};

export type TCategoryWithMeals = TCategorySummary & {
  meals: {
    id: string;
    title: string;
    price: number;
    image: string | null;
    provider: {
      id: string;
      name: string;
      restaurantName: string | null;
    };
  }[];
};
