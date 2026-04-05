export type TGetMealsQuery = {
  searchTerm?: string;
  category?: string;
  dietaryTag?: string;
  minPrice?: number;
  maxPrice?: number;
  providerId?: string;
  page?: number;
  limit?: number;
};

export type TGetMealsResult = {
  data: {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string | null;
    dietaryTag: string | null;
    isAvailable: boolean;
    createdAt: Date;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    provider: {
      id: string;
      name: string;
      restaurantName: string | null;
      cuisineType: string | null;
    };
  }[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};
