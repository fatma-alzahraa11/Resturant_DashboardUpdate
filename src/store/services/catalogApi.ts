import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

export interface BackendCategory {
  _id: string;
  name: any;
  description?: any;
}

export interface BackendProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  restaurantId?: string;
  isAvailable?: boolean;
  isNewItem?: boolean;
  images?: string[];
  allergens?: string[];
}

export interface CreateCategoryRequest {
  restaurantId: string;
  name: { en: string } | string;
  description?: { en?: string } | string;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  id: string;
  restaurantId?: string;
  name?: { en?: string };
  description?: { en?: string };
  isActive?: boolean;
}

export interface CreateProductRequest {
  restaurantId: string;
  storeId?: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isAvailable?: boolean;
  isNewItem?: boolean;
  images?: string[];
  allergens?: string[];
}

export interface UpdateProductRequest {
  id: string;
  restaurantId?: string;
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  isAvailable?: boolean;
  isNewItem?: boolean;
  images?: string[];
  allergens?: string[];
}

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Categories', 'Products'],
  endpoints: (builder) => ({
    // Public endpoints for display screen (no authentication required)
    getPublicProducts: builder.query<BackendProduct[] | any, { restaurantId: string }>({
      query: ({ restaurantId }) => ({
        url: `/api/public/products/${restaurantId}`,
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.products)) return response.products;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
    }),
    getPublicCategories: builder.query<BackendCategory[] | any, { restaurantId: string }>({
      query: ({ restaurantId }) => ({
        url: `/api/public/categories/${restaurantId}`,
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.categories)) return response.categories;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
    }),
    getPublicDiscounts: builder.query<any[], { restaurantId: string }>({
      query: ({ restaurantId }) => ({
        url: `/api/public/discounts/${restaurantId}`,
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.discounts)) return response.discounts;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
    }),
    // Categories
    getCategories: builder.query<BackendCategory[] | any, { restaurantId?: string } | void>({
      query: (args) => ({
        url: '/api/categories',
        params: args?.restaurantId ? { restaurantId: args.restaurantId } : undefined,
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.categories)) return response.categories;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: (result) => {
        const items: any[] = Array.isArray(result)
          ? result
          : Array.isArray((result as any)?.categories)
          ? (result as any).categories
          : Array.isArray((result as any)?.data)
          ? (result as any).data
          : [];
        return items.length
          ? [
              ...items.map((it: any) => ({ type: 'Categories' as const, id: it?._id })),
              { type: 'Categories' as const, id: 'LIST' },
            ]
          : [{ type: 'Categories' as const, id: 'LIST' }];
      },
    }),
    getCategoriesWithCount: builder.query<any, { restaurantId?: string } | void>({
      query: (args) => ({
        url: '/api/categories/with-product-count',
        params: args?.restaurantId ? { restaurantId: args.restaurantId } : undefined,
      }),
      providesTags: [{ type: 'Categories', id: 'LIST' }],
    }),
    createCategory: builder.mutation<BackendCategory, CreateCategoryRequest>({
      query: (body) => {
        const payload: any = { ...body };
        // Prefer simple string name for broader compatibility
        if (typeof payload.name !== 'string' && payload.name?.en) {
          payload.name = payload.name.en;
        }
        if (typeof payload.description !== 'string' && payload.description?.en) {
          payload.description = payload.description.en;
        }
        if (typeof payload.isActive === 'undefined') payload.isActive = true;
        return {
          url: '/api/categories',
          method: 'POST',
          body: payload,
        };
      },
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),
    updateCategory: builder.mutation<BackendCategory, UpdateCategoryRequest>({
      query: ({ id, ...rest }) => ({
        url: `/api/categories/${id}`,
        method: 'PUT',
        body: rest,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Categories', id: arg.id },
        { type: 'Categories', id: 'LIST' },
      ],
    }),
    deleteCategory: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

    // Products
    getProducts: builder.query<BackendProduct[] | any, { restaurantId?: string } | void>({
      query: (args) => ({
        url: '/api/products',
        params: args?.restaurantId ? { restaurantId: args.restaurantId } : undefined,
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.products)) return response.products;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: (result) => {
        const items: any[] = Array.isArray(result)
          ? result
          : Array.isArray((result as any)?.products)
          ? (result as any).products
          : Array.isArray((result as any)?.data)
          ? (result as any).data
          : [];
        return items.length
          ? [
              ...items.map((it: any) => ({ type: 'Products' as const, id: it?._id })),
              { type: 'Products' as const, id: 'LIST' },
            ]
          : [{ type: 'Products' as const, id: 'LIST' }];
      },
    }),
    getProductById: builder.query<BackendProduct | any, string>({
      query: (id) => `/api/products/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: 'Products', id }],
    }),
    createProduct: builder.mutation<BackendProduct, CreateProductRequest>({
      query: (body) => ({
        url: '/api/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<BackendProduct, UpdateProductRequest>({
      query: ({ id, ...rest }) => ({
        url: `/api/products/${id}`,
        method: 'PUT',
        body: rest,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Products', id: arg.id },
        { type: 'Products', id: 'LIST' },
      ],
    }),
    updateProductAvailability: builder.mutation<any, { id: string; isAvailable: boolean; stockQuantity?: number | null; lowStockThreshold?: number | null }>({
      query: ({ id, ...body }) => ({
        url: `/api/products/${id}/availability`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Products', id: arg.id },
        { type: 'Products', id: 'LIST' },
      ],
    }),
    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPublicProductsQuery,
  useGetPublicCategoriesQuery,
  useGetPublicDiscountsQuery,
  useGetCategoriesQuery,
  useGetCategoriesWithCountQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductAvailabilityMutation,
  useDeleteProductMutation,
} = catalogApi;


