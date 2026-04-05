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

export type TMealSummary = {
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
};

export type TMealReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  customer: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

export type TMealDetails = TMealSummary & {
  provider: {
    id: string;
    name: string;
    restaurantName: string | null;
    cuisineType: string | null;
    description: string | null;
    address: string | null;
  };
  rating: {
    average: number;
    totalReviews: number;
  };
  reviews: TMealReview[];
};

export type TGetMealsResult = {
  data: TMealSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};
