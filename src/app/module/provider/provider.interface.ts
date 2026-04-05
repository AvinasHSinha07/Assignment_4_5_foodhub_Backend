export type TGetProvidersQuery = {
  searchTerm?: string;
  cuisineType?: string;
  page?: number;
  limit?: number;
};

export type TGetProvidersResult = {
  data: {
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
  }[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};
