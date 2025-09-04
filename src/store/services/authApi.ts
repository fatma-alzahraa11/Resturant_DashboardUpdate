import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

export interface RegisterOwnerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  restaurantName: string;
  cuisine: string;
}

export interface RegisterOwnerResponse {
  user: any;
  token?: string;
  restaurant?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: any;
  token: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    registerOwner: builder.mutation<RegisterOwnerResponse, RegisterOwnerRequest>({
      query: (body) => ({
        url: '/api/auth/register/restaurant-owner',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/api/auth/login',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useRegisterOwnerMutation, useLoginMutation } = authApi;


