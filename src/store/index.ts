import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../store/services/authApi';
import { catalogApi } from '../store/services/catalogApi';
import { discountApi } from '../store/services/discountApi';
import { offersApi } from '../store/services/offersApi';
import authReducer from '../store/slices/authSlice';
import discountReducer from '../store/slices/discountSlice';
import offersReducer from '../store/slices/offersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    discount: discountReducer,
    offers: offersReducer,
    [authApi.reducerPath]: authApi.reducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
    [discountApi.reducerPath]: discountApi.reducer,
    [offersApi.reducerPath]: offersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      catalogApi.middleware, 
      discountApi.middleware,
      offersApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


