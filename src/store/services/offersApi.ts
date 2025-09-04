import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

// Interfaces for Offers API
export interface OfferProduct {
  productId: string;
  quantity: number;
  unit: 'Number' | 'KG' | 'None';
}

export interface CreateOfferRequest {
  title: string;
  description?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  products: OfferProduct[];
  isAvailable?: boolean;
  validFrom?: string;
  validUntil?: string;
  maxRedemptions?: number;
  tags?: string[];
  storeId?: string;
}

export interface UpdateOfferRequest extends Partial<CreateOfferRequest> {
  id: string;
}

export interface Offer {
  _id: string;
  restaurantId: string;
  storeId?: string;
  title: string;
  description?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  products: Array<{
    productId: {
      _id: string;
      name: string;
      price: number;
      image?: string;
    };
    quantity: number;
    unit: string;
  }>;
  isAvailable: boolean;
  validFrom?: string;
  validUntil?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
  tags: string[];
  sortOrder: number;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  discountPercentage?: number;
  savingsAmount?: number;
  isValid?: boolean;
}

export interface OffersListResponse {
  success: boolean;
  data: Offer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  statistics: {
    total: number;
    available: number;
    totalValue: number;
    averagePrice: number;
    totalRedemptions: number;
  };
}

export interface OfferResponse {
  success: boolean;
  data: Offer;
  message?: string;
}

export interface OffersListParams {
  page?: number;
  limit?: number;
  search?: string;
  isAvailable?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  storeId?: string;
}

export interface OfferStatistics {
  success: boolean;
  data: {
    totalOffers: number;
    availableOffers: number;
    totalValue: number;
    averagePrice: number;
    totalRedemptions: number;
    totalSavings: number;
  };
}

export interface ToggleAvailabilityResponse {
  success: boolean;
  data: {
    isAvailable: boolean;
  };
  message: string;
}

export const offersApi = createApi({
  reducerPath: 'offersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Offer', 'OfferStatistics'],
  endpoints: (builder) => ({
    // Get all offers with filtering and pagination
    getOffers: builder.query<OffersListResponse, OffersListParams | void>({
      query: (params) => ({
        url: '/api/offers',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Offer' as const, id: _id })),
              { type: 'Offer', id: 'LIST' },
            ]
          : [{ type: 'Offer', id: 'LIST' }],
    }),

    // Get single offer by ID
    getOffer: builder.query<OfferResponse, string>({
      query: (id) => `/api/offers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Offer', id }],
    }),

    // Get offer statistics
    getOfferStatistics: builder.query<OfferStatistics, void>({
      query: () => '/api/offers/statistics',
      providesTags: [{ type: 'OfferStatistics', id: 'STATS' }],
    }),

    // Create new offer
    createOffer: builder.mutation<OfferResponse, CreateOfferRequest>({
      query: (body) => ({
        url: '/api/offers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Offer', id: 'LIST' },
        { type: 'OfferStatistics', id: 'STATS' },
      ],
    }),

    // Update existing offer
    updateOffer: builder.mutation<OfferResponse, UpdateOfferRequest>({
      query: ({ id, ...body }) => ({
        url: `/api/offers/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Offer', id },
        { type: 'Offer', id: 'LIST' },
        { type: 'OfferStatistics', id: 'STATS' },
      ],
    }),

    // Delete offer
    deleteOffer: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/offers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Offer', id },
        { type: 'Offer', id: 'LIST' },
        { type: 'OfferStatistics', id: 'STATS' },
      ],
    }),

    // Toggle offer availability
    toggleOfferAvailability: builder.mutation<ToggleAvailabilityResponse, string>({
      query: (id) => ({
        url: `/api/offers/${id}/toggle-availability`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Offer', id },
        { type: 'Offer', id: 'LIST' },
        { type: 'OfferStatistics', id: 'STATS' },
      ],
    }),

    // Get active offers (public endpoint)
    getActiveOffers: builder.query<OfferResponse[], { restaurantId: string; storeId?: string }>({
      query: ({ restaurantId, storeId }) => {
        const url = storeId 
          ? `/api/offers/public/restaurant/${restaurantId}/store/${storeId}`
          : `/api/offers/public/restaurant/${restaurantId}`;
        return url;
      },
      transformResponse: (response: any) => {
        // Handle different response formats
        if (Array.isArray(response)) {
          return response;
        }
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: [{ type: 'Offer', id: 'ACTIVE' }],
    }),

    // Redeem offer (public endpoint)
    redeemOffer: builder.mutation<OfferResponse, { id: string; customerId?: string }>({
      query: ({ id, customerId }) => ({
        url: `/api/offers/public/${id}/redeem`,
        method: 'POST',
        body: customerId ? { customerId } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Offer', id },
        { type: 'Offer', id: 'LIST' },
        { type: 'Offer', id: 'ACTIVE' },
        { type: 'OfferStatistics', id: 'STATS' },
      ],
    }),
  }),
});

export const {
  useGetOffersQuery,
  useGetOfferQuery,
  useGetOfferStatisticsQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useToggleOfferAvailabilityMutation,
  useGetActiveOffersQuery,
  useRedeemOfferMutation,
} = offersApi;

