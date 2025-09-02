import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Offer } from '../services/offersApi';

// Form state interface
export interface OfferFormState {
  title: string;
  description: string;
  image: string;
  imageFile: File | null;
  price: string;
  originalPrice: string;
  currency: string;
  products: Array<{
    productId: string;
    quantity: string;
    unit: string;
  }>;
  isAvailable: boolean;
  validFrom: string;
  validUntil: string;
  maxRedemptions: string;
  tags: string[];
  storeId: string;
}

// Main offers state interface
interface OffersState {
  // UI State
  showDrawer: boolean;
  showDeleteConfirm: boolean;
  editingOffer: Offer | null;
  offerToDelete: string | null;
  
  // Form State
  form: OfferFormState;
  formErrors: Record<string, string>;
  
  // Filters & Search
  searchTerm: string;
  filterAvailable: boolean | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  
  // Selected offers for bulk operations
  selectedOffers: string[];
  
  // Loading states for specific operations
  isSubmitting: boolean;
  isDeleting: boolean;
  isToggling: boolean;
}

const initialFormState: OfferFormState = {
  title: '',
  description: '',
  image: '',
  imageFile: null,
  price: '',
  originalPrice: '',
  currency: 'EUR',
  products: [],
  isAvailable: true,
  validFrom: '',
  validUntil: '',
  maxRedemptions: '',
  tags: [],
  storeId: '',
};

const initialState: OffersState = {
  showDrawer: false,
  showDeleteConfirm: false,
  editingOffer: null,
  offerToDelete: null,
  form: initialFormState,
  formErrors: {},
  searchTerm: '',
  filterAvailable: null,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  currentPage: 1,
  itemsPerPage: 20,
  selectedOffers: [],
  isSubmitting: false,
  isDeleting: false,
  isToggling: false,
};

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    // UI State Management
    openDrawer: (state, action: PayloadAction<Offer | null>) => {
      state.showDrawer = true;
      state.editingOffer = action.payload;
      
      if (action.payload) {
        // Editing existing offer
        state.form = {
          title: action.payload.title,
          description: action.payload.description || '',
          image: action.payload.image || '',
          imageFile: null,
          price: action.payload.price.toString(),
          originalPrice: action.payload.originalPrice?.toString() || '',
          currency: action.payload.currency,
          products: action.payload.products.map(p => ({
            productId: p.productId._id,
            quantity: p.quantity.toString(),
            unit: p.unit,
          })),
          isAvailable: action.payload.isAvailable,
          validFrom: action.payload.validFrom || '',
          validUntil: action.payload.validUntil || '',
          maxRedemptions: action.payload.maxRedemptions?.toString() || '',
          tags: action.payload.tags,
          storeId: action.payload.storeId || '',
        };
      } else {
        // Creating new offer
        state.form = initialFormState;
      }
      
      state.formErrors = {};
    },

    closeDrawer: (state) => {
      state.showDrawer = false;
      state.editingOffer = null;
      state.form = initialFormState;
      state.formErrors = {};
    },

    showDeleteConfirmation: (state, action: PayloadAction<string>) => {
      state.showDeleteConfirm = true;
      state.offerToDelete = action.payload;
    },

    hideDeleteConfirmation: (state) => {
      state.showDeleteConfirm = false;
      state.offerToDelete = null;
    },

    // Form State Management
    updateFormField: (state, action: PayloadAction<{ field: keyof OfferFormState; value: any }>) => {
      const { field, value } = action.payload;
      (state.form as any)[field] = value;
      
      // Clear error for this field
      if (state.formErrors[field]) {
        delete state.formErrors[field];
      }
    },

    setFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.formErrors = action.payload;
    },

    clearFormErrors: (state) => {
      state.formErrors = {};
    },

    // Product Management in Form
    addProductToForm: (state, action: PayloadAction<{ productId: string; quantity: string; unit: string }>) => {
      const { productId, quantity, unit } = action.payload;
      
      // Check if product already exists
      const existingIndex = state.form.products.findIndex(p => p.productId === productId);
      
      if (existingIndex === -1) {
        state.form.products.push({ productId, quantity, unit });
      }
    },

    updateProductInForm: (state, action: PayloadAction<{ index: number; field: 'quantity' | 'unit'; value: string }>) => {
      const { index, field, value } = action.payload;
      if (state.form.products[index]) {
        state.form.products[index][field] = value;
      }
    },

    removeProductFromForm: (state, action: PayloadAction<number>) => {
      state.form.products.splice(action.payload, 1);
    },

    // Search & Filter Management
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },

    setFilterAvailable: (state, action: PayloadAction<boolean | null>) => {
      state.filterAvailable = action.payload;
      state.currentPage = 1; // Reset to first page when filtering
    },

    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing items per page
    },

    // Selection Management
    toggleOfferSelection: (state, action: PayloadAction<string>) => {
      const offerId = action.payload;
      const index = state.selectedOffers.indexOf(offerId);
      
      if (index === -1) {
        state.selectedOffers.push(offerId);
      } else {
        state.selectedOffers.splice(index, 1);
      }
    },

    selectAllOffers: (state, action: PayloadAction<string[]>) => {
      state.selectedOffers = action.payload;
    },

    clearSelection: (state) => {
      state.selectedOffers = [];
    },

    // Loading States
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },

    setDeleting: (state, action: PayloadAction<boolean>) => {
      state.isDeleting = action.payload;
    },

    setToggling: (state, action: PayloadAction<boolean>) => {
      state.isToggling = action.payload;
    },

    // Reset all filters and search
    resetFilters: (state) => {
      state.searchTerm = '';
      state.filterAvailable = null;
      state.sortBy = 'createdAt';
      state.sortOrder = 'desc';
      state.currentPage = 1;
    },

    // Reset entire state (useful for logout or navigation)
    resetOffersState: () => initialState,
  },
});

export const {
  // UI Actions
  openDrawer,
  closeDrawer,
  showDeleteConfirmation,
  hideDeleteConfirmation,
  
  // Form Actions
  updateFormField,
  setFormErrors,
  clearFormErrors,
  
  // Product Actions
  addProductToForm,
  updateProductInForm,
  removeProductFromForm,
  
  // Search & Filter Actions
  setSearchTerm,
  setFilterAvailable,
  setSorting,
  setCurrentPage,
  setItemsPerPage,
  
  // Selection Actions
  toggleOfferSelection,
  selectAllOffers,
  clearSelection,
  
  // Loading Actions
  setSubmitting,
  setDeleting,
  setToggling,
  
  // Reset Actions
  resetFilters,
  resetOffersState,
} = offersSlice.actions;

export default offersSlice.reducer;
