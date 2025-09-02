import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Discount } from '../services/discountApi';

export interface DiscountFormState {
  name: string;
  fromDate: string;
  toDate: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  selectedProducts: string[];
}

interface DiscountState {
  discounts: Discount[];
  currentDiscount: Discount | null;
  isLoading: boolean;
  error: string | null;
  form: DiscountFormState;
  showSuccess: boolean;
  searchTerm: string;
  showCount: number;
}

const initialState: DiscountState = {
  discounts: [],
  currentDiscount: null,
  isLoading: false,
  error: null,
  form: {
    name: '',
    fromDate: '',
    toDate: '',
    discountType: 'percentage',
    discountValue: '',
    selectedProducts: [],
  },
  showSuccess: false,
  searchTerm: '',
  showCount: 10,
};

const discountSlice = createSlice({
  name: 'discount',
  initialState,
  reducers: {
    setFormField: (state, action: PayloadAction<{ field: keyof DiscountFormState; value: any }>) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    
    setDiscountName: (state, action: PayloadAction<string>) => {
      state.form.name = action.payload;
    },
    
    setFromDate: (state, action: PayloadAction<string>) => {
      state.form.fromDate = action.payload;
    },
    
    setToDate: (state, action: PayloadAction<string>) => {
      state.form.toDate = action.payload;
    },
    
    setDiscountType: (state, action: PayloadAction<'percentage' | 'fixed'>) => {
      state.form.discountType = action.payload;
    },
    
    setDiscountValue: (state, action: PayloadAction<string>) => {
      state.form.discountValue = action.payload;
    },
    
    toggleProductSelection: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const index = state.form.selectedProducts.indexOf(productId);
      if (index >= 0) {
        state.form.selectedProducts.splice(index, 1);
      } else {
        state.form.selectedProducts.push(productId);
      }
    },
    
    selectAllProducts: (state, action: PayloadAction<string[]>) => {
      const productIds = action.payload;
      if (state.form.selectedProducts.length === productIds.length) {
        state.form.selectedProducts = [];
      } else {
        state.form.selectedProducts = [...productIds];
      }
    },
    
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.showCount = 10; // Reset show count when searching
    },
    
    increaseShowCount: (state) => {
      state.showCount += 10;
    },
    
    setShowSuccess: (state, action: PayloadAction<boolean>) => {
      state.showSuccess = action.payload;
    },
    
    resetForm: (state) => {
      state.form = initialState.form;
      state.showSuccess = false;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setCurrentDiscount: (state, action: PayloadAction<Discount | null>) => {
      state.currentDiscount = action.payload;
    },
  },
});

export const {
  setFormField,
  setDiscountName,
  setFromDate,
  setToDate,
  setDiscountType,
  setDiscountValue,
  toggleProductSelection,
  selectAllProducts,
  setSearchTerm,
  increaseShowCount,
  setShowSuccess,
  resetForm,
  setLoading,
  setError,
  setCurrentDiscount,
} = discountSlice.actions;

export default discountSlice.reducer;
