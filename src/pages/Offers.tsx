import React, { useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Gift, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  useGetOffersQuery,
  useGetOfferStatisticsQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useToggleOfferAvailabilityMutation,
} from '../store/services/offersApi';
import { useGetProductsQuery } from '../store/services/catalogApi';
import {
  openDrawer,
  closeDrawer,
  showDeleteConfirmation,
  hideDeleteConfirmation,
  updateFormField,
  addProductToForm,
  updateProductInForm,
  removeProductFromForm,
  setSearchTerm,
  setFilterAvailable,
  setFormErrors,
  setSubmitting,
  setDeleting,
} from '../store/slices/offersSlice';

// Get real products from API - Only available products
interface ProductOption {
  id: string;
  name: string;
}

// دالة لجلب المنتجات المتاحة فقط من API
const useRealProducts = (): ProductOption[] => {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const restaurantId: string = typeof authUser?.restaurantId === 'object'
    ? (authUser?.restaurantId?._id || '')
    : (authUser?.restaurantId || '');
  
  const { data: productsData = [] } = useGetProductsQuery(
    restaurantId ? { restaurantId } : undefined,
    { skip: !restaurantId }
  );

  // فلترة المنتجات المتاحة فقط
  const availableProducts = productsData.filter((product: any) => {
    const isAvailable = product.availability?.isAvailable === true || product.isAvailable === true;
    const hasValidName = product.name && typeof product.name === 'string' || (product.name?.en || product.name?.ar || product.name?.de);
    const hasValidPrice = product.price && product.price > 0;
    const hasValidCategory = product.categoryId;
    
    // Debug: Log product availability info (يمكن إزالته بعد التأكد من العمل)
    if (process.env.NODE_ENV === 'development') {
      console.log('Product:', product.name?.en || product.name, 'Availability:', {
        'availability.isAvailable': product.availability?.isAvailable,
        'isAvailable': product.isAvailable,
        'final': isAvailable,
        'hasValidName': hasValidName,
        'hasValidPrice': hasValidPrice,
        'hasValidCategory': hasValidCategory
      });
    }
    
    return isAvailable && hasValidName && hasValidPrice && hasValidCategory;
  });

  return availableProducts.map((product: any) => ({
    id: product._id,
    name: typeof product.name === 'string' ? product.name : (product.name?.en || product.name?.ar || product.name?.de || '')
  }));
};

const unitOptions = [
  { value: 'Number', label: 'Number' },
  { value: 'KG', label: 'KG' },
  { value: 'None', label: 'None' },
];

const Offers: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check authentication
  const authToken = localStorage.getItem('authToken');
  const user = useSelector((state: RootState) => state.auth.user);

  // Redux state
  const {
    showDrawer,
    showDeleteConfirm,
    editingOffer,
    offerToDelete,
    form,
    formErrors,
    searchTerm,
    filterAvailable,
    currentPage,
    itemsPerPage,
    isSubmitting,
    isDeleting,
  } = useSelector((state: RootState) => state.offers);

  // API hooks
  const {
    data: offersResponse,
    isLoading: isLoadingOffers,
  } = useGetOffersQuery(
    {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      isAvailable: filterAvailable ?? undefined,
    },
    {
      skip: !authToken,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    }
  );

  const {
    data: statisticsResponse,
  } = useGetOfferStatisticsQuery();

  const [createOffer] = useCreateOfferMutation();
  const [updateOffer] = useUpdateOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();
  const [toggleAvailability, { isLoading: isToggling }] = useToggleOfferAvailabilityMutation();

  // Get real products - Only available products (filtered by availability, name, price, and category)
  const products = useRealProducts();

  // أضف هذا الكود ليجعل الصفحة تبدأ من الأعلى عند الفتح
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show authentication message if not logged in
  if (!authToken || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="p-3 bg-red-100 rounded-xl mx-auto mb-4 w-fit">
            <Gift className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('pages.offers.authenticationRequired', { defaultValue: 'Authentication Required' })}
          </h1>
          <p className="text-gray-600">
            {t('pages.offers.pleaseLogin', { defaultValue: 'Please log in to access the offers page.' })}
          </p>
        </div>
      </div>
    );
  }

  // Extract data from API responses
  const offers = offersResponse?.data || [];
  const statistics = statisticsResponse?.data || {
    totalOffers: 0,
    availableOffers: 0,
    totalValue: 0,
    averagePrice: 0,
  };

  // Open drawer for add/edit
  const handleOpenDrawer = (offer?: any) => {
    dispatch(openDrawer(offer || null));
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        dispatch(updateFormField({ field: 'imageFile', value: file }));
        const reader = new FileReader();
        reader.onload = ev => {
          dispatch(updateFormField({ field: 'image', value: ev.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      dispatch(updateFormField({ field: name as any, value }));
    }
  };

  // Handle product selection
  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    if (!form.products.some(p => p.productId === selectedId)) {
      dispatch(addProductToForm({
        productId: selectedId,
        quantity: '',
        unit: 'Number'
      }));
    }
  };

  // Handle quantity/unit change for a product
  const handleProductField = (idx: number, field: 'quantity' | 'unit', value: string) => {
    dispatch(updateProductInForm({ index: idx, field, value }));
  };

  // Remove product from offer
  const handleRemoveProduct = (idx: number) => {
    dispatch(removeProductFromForm(idx));
  };

  // Validate form
  const validate = () => {
    const errs: any = {};
    if (!form.title.trim()) errs.title = t('common.required');
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price = t('common.required');
    if (form.products.length === 0) errs.products = t('offers.selectAtLeastOneProduct');
    form.products.forEach((p, i) => {
      if (!p.quantity || isNaN(Number(p.quantity)) || Number(p.quantity) <= 0) {
        errs[`product-qty-${i}`] = t('common.required');
      }
    });
    return errs;
  };

  // Add or update offer
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    dispatch(setFormErrors(errs));
    if (Object.keys(errs).length > 0) return;

    dispatch(setSubmitting(true));

    try {
      const offerData = {
        title: form.title,
        description: form.description,
        image: form.image,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        currency: form.currency || 'EUR',
        products: form.products.map(p => ({
          productId: p.productId,
          quantity: Number(p.quantity),
          unit: p.unit as 'Number' | 'KG' | 'None',
        })),
        isAvailable: form.isAvailable,
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || undefined,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
        tags: form.tags,
        storeId: form.storeId || undefined,
      };

      console.log('Sending offer data:', offerData);

      if (editingOffer) {
        await updateOffer({ id: editingOffer._id, ...offerData }).unwrap();
      } else {
        await createOffer(offerData).unwrap();
      }

      dispatch(closeDrawer());
    } catch (error: any) {
      console.error('Submit error:', error);
      // Handle error and show user-friendly message
      const errorMessage = error?.data?.error || error?.data?.errors?.[0]?.message || 'Failed to save offer';
      alert(errorMessage);
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  // Show delete confirmation
  const handleShowDeleteConfirmation = (id: string) => {
    dispatch(showDeleteConfirmation(id));
  };

  // Delete offer
  const handleDelete = async () => {
    if (!offerToDelete) return;

    dispatch(setDeleting(true));
    
    try {
      await deleteOffer(offerToDelete).unwrap();
      dispatch(hideDeleteConfirmation());
    } catch (error: any) {
      console.error('Delete error:', error);
      // Handle error - you might want to show a toast notification
    } finally {
      dispatch(setDeleting(false));
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    dispatch(hideDeleteConfirmation());
  };

  // Toggle offer availability
  const handleToggleAvailability = async (id: string) => {
    try {
      await toggleAvailability(id).unwrap();
    } catch (error: any) {
      console.error('Toggle availability error:', error);
      // Handle error and show user-friendly message
      const errorMessage = error?.data?.error || error?.data?.errors?.[0]?.message || 'Failed to toggle offer availability';
      alert(errorMessage);
    }
  };

  // Handle search and filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleFilterChange = (available: boolean | null) => {
    dispatch(setFilterAvailable(available));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className={`flex items-center space-x-4 mb-6 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className="p-3 bg-primary-100 rounded-xl">
            <Gift className="w-8 h-8 text-primary-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">
              {t('pages.offers.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('pages.offers.description')}
            </p>
          </div>
        </div>

        {/* Statistics Cards removed as per request */}

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${
              isRTL ? 'right-3' : 'left-3'
            }`} />
            <input
              type="text"
              placeholder={t('offers.searchOffers')}
              value={searchTerm}
              onChange={handleSearchChange}
              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                isRTL ? 'text-right pr-10 pl-4' : 'text-left'
              }`}
            />
          </div>

          {/* Filter Buttons */}
          <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => handleFilterChange(filterAvailable === true ? null : true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterAvailable === true
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('offers.available')}
            </button>
            {(filterAvailable !== null) && (
              <button
                onClick={() => handleFilterChange(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {t('offers.clearFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={() => handleOpenDrawer()}
            className={`flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
        >
          <Plus className="w-5 h-5" />
          {t('offers.addOffer')}
        </button>
          
          {searchTerm || filterAvailable !== null ? (
            <span className="text-sm text-gray-500">
              {t('offers.showingResults', { count: offers.length, total: offersResponse?.pagination.total || 0 })}
            </span>
          ) : null}
        </div>
      </div>

      {/* Offers List Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-3xl font-bold" style={{ color: '#780000' }}>
            {t('offers.currentOffers')}
          </h2>
          {searchTerm || filterAvailable !== null ? (
            <span className="text-sm text-gray-500">
              {t('offers.showingResults', { count: offers.length, total: offersResponse?.pagination.total || 0 })}
            </span>
          ) : null}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingOffers ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('common.loading') || 'Loading...'}</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm || filterAvailable !== null ? t('offers.noResultsFound') : t('offers.noOffersYet')}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterAvailable !== null ? t('offers.tryDifferentSearch') : t('offers.createFirstOffer')}
              </p>
              
          </div>
        ) : (
            offers.map(offer => (
            <div
              key={offer._id}
                className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100 hover:border-orange-300 group relative overflow-hidden"
            >
                {/* Image */}
              {offer.image && (
                  <div className="relative h-48 overflow-hidden rounded-t-2xl">
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}
                
                                 {/* Content */}
                 <div className="p-4">
                   <div className="flex items-center justify-between mb-3">
                     <h3 className="font-bold text-2xl text-orange-900 truncate flex-1 mr-3">
                       {offer.title}
                     </h3>
                     <span className="text-2xl font-extrabold text-orange-600 drop-shadow-sm whitespace-nowrap">
                       {offer.price}€
                     </span>
                   </div>

                   {/* Actions */}
                   <div className="flex items-center justify-between">
                     {/* Availability Toggle */}
                     <button
                       className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                       onClick={() => handleToggleAvailability(offer._id)}
                       disabled={isToggling}
                       title={offer.isAvailable ? t('offers.available') : t('offers.unavailable')}
                     >
                       <div className="relative">
                         <div className={`w-10 h-6 rounded-full transition-all duration-300 shadow-inner ${
                           offer.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                         }`}>
                           <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 transform ${
                             offer.isAvailable ? 'translate-x-4' : 'translate-x-0.5'
                           }`}>
                             {offer.isAvailable && (
                               <div className="w-2 h-2 bg-green-500 rounded-full m-auto mt-1.5"></div>
                             )}
                           </div>
                         </div>
                       </div>
                       <span className={`text-sm font-semibold transition-colors ${
                         offer.isAvailable ? 'text-green-700' : 'text-gray-500'
                       }`}>
                         {offer.isAvailable ? t('offers.available') : t('offers.unavailable')}
                       </span>
                     </button>

                     {/* Edit/Delete Buttons */}
                     <div className="flex gap-2">
                       <button
                         className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors"
                         onClick={() => handleOpenDrawer(offer)}
                         title={t('Edit')}
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button
                         className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors"
                         onClick={() => handleShowDeleteConfirmation(offer._id)}
                         title={t('Delete')}
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* Add/Edit Offer Modal */}
      {showDrawer && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <form
            className={`bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative animate-slideInUp flex flex-col ${isRTL ? 'rtl' : ''}`}
            onSubmit={handleSubmit}
            autoComplete="off"
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ maxHeight: '90vh' }}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
              onClick={e => { e.preventDefault(); dispatch(closeDrawer()); }}
              aria-label={t('Close')}
              type="button"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4 text-primary-900 flex items-center gap-2">
              {editingOffer ? t('offers.editOffer') : t('offers.addOffer')}
            </h2>
            <div className="text-xs text-gray-500 mb-4 text-center bg-blue-50 p-2 rounded-lg border border-blue-200">
              {t('offers.availabilityNote', { defaultValue: 'Note: Only available products are shown in the product list below' })}
            </div>
            {/* Scrollable Content */}
            <div className="space-y-4 flex-1 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              {/* Offer Title */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('offers.offerTitle')}</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 ${formErrors.title ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder={t('offers.offerTitle') as string}
                />
                {formErrors.title && <div className="text-xs text-red-500 mt-1">{formErrors.title}</div>}
              </div>
              {/* Offer Image */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('offers.offerImage')}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    name="image"
                    ref={fileInputRef}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 text-gray-700 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-4 h-4" />
                    {form.image ? t('offers.changeImage') : t('offers.uploadImage')}
                  </button>
                  {form.image && (
                    <img src={form.image} alt="Offer" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                  )}
                </div>
              </div>
              {/* Price */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('offers.price')}</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 ${formErrors.price ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="€"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  style={{ MozAppearance: 'textfield' } as any}
                  onWheel={e => (e.target as HTMLInputElement).blur()}
                />
                {formErrors.price && <div className="text-xs text-red-500 mt-1">{formErrors.price}</div>}
              </div>
              {/* Products List */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('offers.productsList')}</label>
                <div className="text-xs text-gray-500 mb-2">
                  {t('offers.availableProductsOnly', { defaultValue: 'Showing available products only' })}
                  <br />
                  <span className="text-blue-600 font-medium">
                    {t('offers.productsCount', { defaultValue: 'Available' })}: {products.length} {t('offers.products', { defaultValue: 'products' })}
                  </span>
                  {products.length === 0 && (
                    <div className="text-red-500 mt-1 font-medium">
                      {t('offers.addAvailableProductsFirst', { defaultValue: 'Please add some available products first' })}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mb-2">
                  <select
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 border-gray-300 text-xs"
                    onChange={handleProductSelect}
                    value=""
                    disabled={products.length === 0}
                  >
                    <option value="">
                      {products.length === 0 
                        ? t('offers.noAvailableProducts', { defaultValue: 'No available products' })
                        : t('offers.selectProduct', { defaultValue: 'Select Product' })
                      }
                    </option>
                    {products.filter(mp => !form.products.some(p => p.productId === mp.id)).map(mp => (
                      <option key={mp.id} value={mp.id}>{mp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  {/* Labels Row for Quantity and Unit */}
                  {form.products.length > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex-1" />
                      <label className="w-14 text-[10px] text-gray-500 font-semibold text-center">{t('offers.quantity')}</label>
                      <label className="w-20 text-[10px] text-gray-500 font-semibold text-center">{t('offers.unit')}</label>
                      <span className="w-6" />
                    </div>
                  )}
                  {form.products.map((p, idx) => {
                    const prod = products.find(mp => mp.id === p.productId);
                    return (
                      <div key={p.productId} className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 flex-1 truncate text-xs">{prod?.name}</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className={`w-14 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-xs ${formErrors[`product-qty-${idx}`] ? 'border-red-400' : 'border-gray-300'}`}
                          placeholder={t('offers.qty') as string}
                          value={p.quantity}
                          onChange={e => handleProductField(idx, 'quantity', e.target.value)}
                        />
                        <select
                          className="px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 border-gray-300 text-xs w-20"
                          value={p.unit}
                          onChange={e => handleProductField(idx, 'unit', e.target.value)}
                        >
                          {unitOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="ml-1 text-red-500 hover:text-red-700 text-base font-bold"
                          onClick={() => handleRemoveProduct(idx)}
                          title={t('offers.remove') as string}
                        >
                          ×
                        </button>
                        {formErrors[`product-qty-${idx}`] && <div className="text-xs text-red-500 mt-1">{formErrors[`product-qty-${idx}`]}</div>}
                      </div>
                    );
                  })}
                </div>
                {formErrors.products && <div className="text-xs text-red-500 mt-1">{formErrors.products}</div>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('offers.description')}</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 border-gray-300 min-h-[60px] text-xs"
                  placeholder={t('offers.descriptionPlaceholder') as string}
                  rows={2}
                />
              </div>
            </div>
            {/* Actions always visible */}
            <div className="flex gap-2 mt-6 sticky bottom-0 bg-white pt-4 z-10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-base transition-all duration-200 hover:scale-105 hover:bg-red-700 focus:scale-105 focus:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('common.saving') || 'Saving...' : (editingOffer ? t('offers.saveChanges') : t('offers.addOffer'))}
              </button>
              {editingOffer && (
                <button
                  type="button"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-red-600 font-bold text-base border border-red-200 hover:bg-red-50 transition-all duration-200"
                  onClick={() => handleShowDeleteConfirmation(editingOffer._id)}
                >
                  {t('offers.deleteOffer')}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('offers.deleteOffer')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('offers.areYouSureDelete')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? t('common.deleting') || 'Deleting...' : t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;