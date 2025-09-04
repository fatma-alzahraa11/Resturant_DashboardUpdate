import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

export interface DiscountFormData {
  name: string;
  fromDate: string;
  toDate: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  selectedProducts: string[];
  isActive?: boolean;
}

export interface Discount {
  _id: string;
  restaurantId: string;
  name: {
    en: string;
    ar: string;
    de: string;
  };
  description: {
    en: string;
    ar: string;
    de: string;
  };
  code?: string;
  rule: {
    type: 'percentage' | 'fixed';
    value: number;
    minimumOrder?: number;
    maximumDiscount?: number;
  };
  target: {
    type: 'specific_products';
    productIds: string[];
  };
  schedule: {
    startDate: string;
    endDate: string;
    isRecurring: boolean;
  };
  image?: string;
  isActive: boolean;
  isPublic: boolean;
  usageLimit?: number;
  usageCount: number;
  customerUsageLimit?: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountStats {
  totalDiscounts: number;
  activeDiscounts: number;
  publicDiscounts: number;
  totalUsage: number;
  totalDiscountAmount: number;
}

export interface CreateDiscountResponse {
  message: string;
  discount: Discount;
}

export interface DiscountListResponse {
  discounts: Discount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const discountApi = createApi({
  reducerPath: 'discountApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/discounts`,
    prepareHeaders: (headers, { getState }) => {
      // Add auth token if available
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Discount', 'DiscountStats'],
  endpoints: (builder) => ({
    createDiscount: builder.mutation<CreateDiscountResponse, DiscountFormData & { restaurantId: string }>({
      query: (discountData) => {
        // Transform frontend data to backend format
        const backendData = {
          restaurantId: discountData.restaurantId, // Use restaurant ID from parameter
          name: {
            en: discountData.name,
            ar: discountData.name,
            de: discountData.name
          },
          description: {
            en: `Discount: ${discountData.name}`,
            ar: `خصم: ${discountData.name}`,
            de: `Rabatt: ${discountData.name}`
          },
          rule: {
            type: discountData.discountType,
            value: discountData.discountValue
          },
          target: {
            type: 'specific_products',
            productIds: discountData.selectedProducts
          },
          schedule: {
            startDate: new Date(discountData.fromDate).toISOString(),
            endDate: new Date(discountData.toDate).toISOString(),
            isRecurring: false
          },
          isActive: discountData.isActive ?? true,
          isPublic: true,
          priority: 0
        };

        return {
          url: '',
          method: 'POST',
          body: backendData,
        };
      },
      invalidatesTags: ['Discount', 'DiscountStats'],
    }),

    getDiscounts: builder.query<DiscountListResponse, {
      restaurantId: string;
      search?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/',
        params: {
          ...params,
        },
      }),
      providesTags: ['Discount'],
    }),

    getDiscountById: builder.query<Discount, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Discount', id }],
    }),

    updateDiscount: builder.mutation<CreateDiscountResponse, { id: string; data: Partial<DiscountFormData> }>({
      query: ({ id, data }) => {
        // Transform frontend data to backend format
        const backendData: any = {};
        
        if (data.name) {
          backendData.name = {
            en: data.name,
            ar: data.name,
            de: data.name
          };
        }
        
        if (data.discountType && data.discountValue !== undefined) {
          backendData.rule = {
            type: data.discountType,
            value: data.discountValue
          };
        }
        
        if (data.selectedProducts) {
          backendData.target = {
            type: 'specific_products',
            productIds: data.selectedProducts
          };
        }
        
        if (data.fromDate && data.toDate) {
          backendData.schedule = {
            startDate: new Date(data.fromDate).toISOString(),
            endDate: new Date(data.toDate).toISOString(),
            isRecurring: false
          };
        }

        return {
          url: `/${id}`,
          method: 'PUT',
          body: backendData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Discount', id },
        'Discount',
        'DiscountStats'
      ],
    }),

    deleteDiscount: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Discount', 'DiscountStats'],
    }),

    getDiscountStats: builder.query<DiscountStats, string>({
      query: (restaurantId) => ({
        url: '/stats',
        params: { restaurantId },
      }),
      providesTags: ['DiscountStats'],
    }),

    validateDiscountCode: builder.mutation<{
      discount: {
        id: string;
        name: any;
        description: any;
        code?: string;
        rule: any;
        discountAmount: number;
        isValid: boolean;
      };
    }, {
      code: string;
      customerId?: string;
      orderItems: any[];
      orderTotal: number;
    }>({
      query: (data) => ({
        url: '/validate',
        method: 'POST',
        body: data,
      }),
    }),

    getActiveDiscounts: builder.query<DiscountListResponse, { restaurantId: string }>({
      query: ({ restaurantId }) => ({
        url: '/active',
        params: { restaurantId },
      }),
      transformResponse: (response: any) => {
        // Handle different response formats
        if (response.success && response.data) {
          return response;
        }
        if (Array.isArray(response)) {
          return {
            success: true,
            data: response,
            pagination: {
              page: 1,
              limit: response.length,
              total: response.length,
              pages: 1
            }
          };
        }
        return {
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        };
      },
      providesTags: [{ type: 'Discount', id: 'ACTIVE' }],
    }),
  }),
});

export const {
  useCreateDiscountMutation,
  useGetDiscountsQuery,
  useGetDiscountByIdQuery,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useGetDiscountStatsQuery,
  useValidateDiscountCodeMutation,
  useGetActiveDiscountsQuery,
} = discountApi;
