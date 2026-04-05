export type TGetProvidersQuery = {
  searchTerm?: string;
  cuisineType?: string;
  page?: number;
  limit?: number;
};

export type TProviderSummary = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  restaurantName: string;
  description: string | null;
  address: string;
  cuisineType: string;
  logo: string | null;
  bannerImage: string | null;
  createdAt: Date;
};

export type TProviderDetails = TProviderSummary & {
  meals: {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string | null;
    dietaryTag: string | null;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  stats: {
    totalMeals: number;
    availableMeals: number;
  };
};

export type TGetProvidersResult = {
  data: TProviderSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};
