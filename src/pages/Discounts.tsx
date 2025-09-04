import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Percent, Euro, Save, Check, Info, X } from 'lucide-react';
import { RootState } from '../store';
import { useGetProductsQuery, useGetProductByIdQuery } from '../store/services/catalogApi';
import { useCreateDiscountMutation, useGetDiscountsQuery, useDeleteDiscountMutation } from '../store/services/discountApi';
import {
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
  resetForm
} from '../store/slices/discountSlice';

interface Product {
  id: string;
  name: string;
  nameAr: string;
  nameDe: string;
  categoryId: string;
  description: string;
  descriptionAr: string;
  descriptionDe: string;
  price: number;
  ingredients: string;
  ingredientsAr: string;
  ingredientsDe: string;
  image?: string;
  isAvailable: boolean;
  isNew: boolean;
}


const Discounts: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Get authenticated user and restaurant ID
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authToken = useSelector((state: RootState) => state.auth.token);
  const restaurantId: string = typeof authUser?.restaurantId === 'object'
    ? (authUser?.restaurantId?._id || '')
    : (authUser?.restaurantId || '');

  // Fetch products from API using real restaurant ID
  const { data: backendProducts = [], isLoading: productsLoading } = useGetProductsQuery(
    restaurantId ? { restaurantId } : undefined,
    { skip: !authToken || !restaurantId }
  );
  
  // Transform backend products to frontend format
  // Note: isAvailable is checked from both product.availability.isAvailable (new backend structure) and product.isAvailable (legacy)
  const products: Product[] = backendProducts.map((product: any) => {
    // Debug: Log product availability info
    console.log('Product:', product.name?.en || product.name, 'Availability:', {
      'availability.isAvailable': product.availability?.isAvailable,
      'isAvailable': product.isAvailable,
      'final': product.availability?.isAvailable === true || product.isAvailable === true
    });
    
    return {
    id: product._id,
    name: product.name?.en || product.name || 'Unknown Product',
    nameAr: product.name?.ar || product.name || 'منتج غير معروف',
    nameDe: product.name?.de || product.name || 'Unbekanntes Produkt',
    categoryId: product.categoryId || '',
    description: product.description?.en || product.description || '',
    descriptionAr: product.description?.ar || product.description || '',
    descriptionDe: product.description?.de || product.description || '',
    price: product.price || 0,
    ingredients: product.allergens?.join(', ') || 'No ingredients listed',
    ingredientsAr: product.allergens?.join('، ') || 'لا توجد مكونات مدرجة',
    ingredientsDe: product.allergens?.join(', ') || 'Keine Zutaten aufgelistet',
    image: product.images?.[0],
    isAvailable: product.availability?.isAvailable === true || product.isAvailable === true,
    isNew: false
  };
  });

  // Redux state and actions
  const dispatch = useDispatch();
  const {
    form: { name: discountName, fromDate, toDate, discountType, discountValue, selectedProducts },
    showSuccess,
    searchTerm,
    showCount
  } = useSelector((state: RootState) => state.discount);
  
  // API mutations and queries using real restaurant ID
  const [createDiscount, { isLoading: isCreating }] = useCreateDiscountMutation();
  const [deleteDiscount, { isLoading: isDeleting }] = useDeleteDiscountMutation();
  const { data: existingDiscounts, isLoading: discountsLoading, refetch: refetchDiscounts } = useGetDiscountsQuery(
    { restaurantId: restaurantId || '' },
    { skip: !authToken || !restaurantId }
  );
  
  // Product detail fetching state
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { data: productDetail, isLoading: isLoadingProductDetail } = useGetProductByIdQuery(
    selectedProductId || '', 
    { skip: !selectedProductId }
  );

  // Delete confirmation state
  const [discountToDelete, setDiscountToDelete] = useState<string | null>(null);

  // Date formatting helpers

  // Handle product selection
  const handleProductToggle = (productId: string) => {
    dispatch(toggleProductSelection(productId));
  };

  // Handle product detail view
  const handleViewProductDetail = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleCloseProductDetail = () => {
    setSelectedProductId(null);
  };

  // Handle discount deletion
  const handleDeleteDiscount = async (discountId: string) => {
    try {
      await deleteDiscount(discountId).unwrap();
      refetchDiscounts(); // Refresh the discounts list
      setDiscountToDelete(null); // Close confirmation dialog
    } catch (error: any) {
      console.error('Failed to delete discount:', error);
      alert(error?.data?.error || 'Failed to delete discount. Please try again.');
    }
  };

  const handleConfirmDelete = () => {
    if (discountToDelete) {
      handleDeleteDiscount(discountToDelete);
    }
  };

  const handleCancelDelete = () => {
    setDiscountToDelete(null);
  };


  // فلترة المنتجات حسب البحث والتوفر
  // تأكد من أن المنتج متاح ولديه اسم صحيح وسعر صحيح وفئة صحيحة
  const filteredProducts = products.filter(product =>
    product.isAvailable && 
    product.name && 
    product.name !== 'Unknown Product' && 
    product.price > 0 && 
    product.categoryId && (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );
  const visibleProducts = filteredProducts.slice(0, showCount);

  // Reset showCount when search changes
  useEffect(() => {
    if (searchTerm) {
      // Search term is managed by Redux, no need to reset here
    }
  }, [searchTerm]);

  // Handle form submission
  const handleSaveDiscount = async () => {
    if (!authToken || !restaurantId) {
      alert('Please log in to create discounts');
      return;
    }

    if (!discountName || !fromDate || !toDate || !discountValue || selectedProducts.length === 0) {
      alert('Please fill in all required fields and select at least one product');
      return;
    }

    try {
      await createDiscount({
        name: discountName,
        fromDate,
        toDate,
        discountType,
        discountValue: parseFloat(discountValue),
        selectedProducts,
        isActive: true,
        restaurantId: restaurantId
      }).unwrap();

      dispatch(setShowSuccess(true));
      dispatch(resetForm());
      refetchDiscounts(); // Refresh the discounts list
      setTimeout(() => dispatch(setShowSuccess(false)), 3000);
    } catch (error: any) {
      console.error('Failed to create discount:', error);
      alert(error?.data?.error || 'Failed to create discount. Please try again.');
    }
  };

  // Show authentication message if not logged in
  if (!authToken || !restaurantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="p-3 bg-red-100 rounded-xl mx-auto mb-4 w-fit">
            <Percent className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('pages.discounts.authenticationRequired', { defaultValue: 'Authentication Required' })}
          </h1>
          <p className="text-gray-600">
            {t('pages.discounts.pleaseLogin', { defaultValue: 'Please log in to access the discounts page.' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className={`flex items-center space-x-4 mb-6 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className="p-3 bg-primary-100 rounded-xl">
            <Percent className="w-8 h-8 text-primary-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">
              {t('pages.discounts.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('pages.discounts.description')}
            </p>
          </div>
        </div>

        
      </div>

      {/* Existing Discounts */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t('discounts.existingDiscounts', { defaultValue: 'Existing Discounts' })}
        </h2>
        
        {discountsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading discounts...</p>
          </div>
        ) : existingDiscounts?.discounts && existingDiscounts.discounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {existingDiscounts.discounts.map((discount: any) => (
              <div key={discount._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {typeof discount.name === 'string' ? discount.name : discount.name?.en || 'Unnamed Discount'}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        discount.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {discount.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        discount.isPublic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {discount.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {discount.rule?.type === 'percentage' ? `${discount.rule.value}%` : `€${discount.rule?.value}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {discount.rule?.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </div>
                    </div>
                    <button
                      onClick={() => setDiscountToDelete(discount._id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete discount"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>{new Date(discount.schedule?.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span>{new Date(discount.schedule?.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Products:</span>
                    <span>{discount.target?.productIds?.length || 0} products</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usage Count:</span>
                    <span>{discount.usageCount || 0}</span>
                  </div>
                </div>
                
                {discount.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      {typeof discount.description === 'string' ? discount.description : discount.description?.en || ''}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="p-3 bg-gray-100 rounded-xl mx-auto mb-4 w-fit">
              <Percent className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discounts created yet</h3>
            <p className="text-gray-600">Create your first discount using the form below.</p>
          </div>
        )}
      </div>

      {/* Discount Configuration Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-6">{t('discounts.createNewDiscount', { defaultValue: 'Create New Discount' })}</h2>
        
        <div className="space-y-8">
          {/* Discount Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('discounts.discountName', { defaultValue: 'Discount Name' })} *
            </label>
            <input
              type="text"
              value={discountName}
              onChange={(e) => dispatch(setDiscountName(e.target.value))}
              placeholder={t('discounts.discountNamePlaceholder', { defaultValue: 'Enter discount name' })}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            />
          </div>

          {/* Discount Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              {t('discounts.discountDuration', { defaultValue: 'Discount Duration' })} *
            </label>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'md:grid-cols-2' : ''}`}>
              <div>
                <label className="block text-xs text-gray-500 mb-2">{t('discounts.fromDate', { defaultValue: 'From Date' })}</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => dispatch(setFromDate(e.target.value))}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">{t('discounts.toDate', { defaultValue: 'To Date' })}</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => dispatch(setToDate(e.target.value))}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Discount Type & Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              {t('discounts.discountTypeAndAmount', { defaultValue: 'Discount Type & Amount' })} *
            </label>
            <div className="space-y-4">
              {/* Discount Type Selection */}
              <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}> 
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    value="percentage"
                    checked={discountType === 'percentage'}
                    onChange={(e) => dispatch(setDiscountType(e.target.value as 'percentage' | 'fixed'))}
                    className="sr-only peer"
                  />
                  <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                    discountType === 'percentage' ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                  }`}>
                    {discountType === 'percentage' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{t('discounts.percentageDiscount', { defaultValue: 'Percentage Discount' })}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    value="fixed"
                    checked={discountType === 'fixed'}
                    onChange={(e) => dispatch(setDiscountType(e.target.value as 'percentage' | 'fixed'))}
                    className="sr-only peer"
                  />
                  <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                    discountType === 'fixed' ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                  }`}>
                    {discountType === 'fixed' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{t('discounts.fixedAmountDiscount', { defaultValue: 'Fixed Amount Discount' })}</span>
                </label>
              </div>

              {/* Discount Value Input */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  {discountType === 'percentage' ? t('discounts.percentage', { defaultValue: 'Percentage (%)' }) : t('discounts.amount', { defaultValue: 'Amount (€)' })}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    value={discountValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/,/g, '.');
                      if (/^\d*(\.|،)?\d*$/.test(val)) {
                        dispatch(setDiscountValue(val));
                      }
                    }}
                    placeholder={discountType === 'percentage' ? '10' : '€'}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      isRTL ? 'text-right pr-10' : 'text-left pl-10'
                    }`}
                  />
                  <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`}>
                    {discountType === 'percentage' ? (
                      <Percent className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Euro className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              {t('discounts.selectProducts', { defaultValue: 'Select Products' })} *
            </label>
            <div className="space-y-4">
              {/* Select All + Search */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={() => {
                        dispatch(selectAllProducts(filteredProducts.map(p => p.id)));
                      }}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {t('discounts.selectAllProducts', { defaultValue: 'Select All Products' })} ({filteredProducts.length})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => dispatch(setSearchTerm(e.target.value))}
                    placeholder={t('discounts.searchMeals', { defaultValue: 'Search meals...' })}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    style={{ minWidth: 180 }}
                  />
                </div>
                <div className="text-center font-bold py-2 text-xl text-black uppercase tracking-wider">{t('discounts.mealsList', { defaultValue: 'MEALS LIST' })}</div>
                <div className="text-center text-sm text-gray-500 mb-4">
                  {t('discounts.availableProductsOnly', { defaultValue: 'Showing available products only' })}
                  <br />
                  <span className="text-xs text-gray-400">
                    {t('discounts.availabilityNote', { defaultValue: 'Products are filtered by availability status' })}
                  </span>
                  <br />
                  <span className="text-xs text-blue-600 font-medium">
                    {t('discounts.productsCount', { defaultValue: 'Available' })}: {filteredProducts.length} / {products.length} {t('discounts.totalProducts', { defaultValue: 'total' })}
                  </span>
                </div>
              </div>

              {/* Product List - Showing Available Products Only */}
              {productsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-gray-600">{t('common.loading', { defaultValue: 'Loading products...' })}</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {t('discounts.noAvailableProducts', { defaultValue: 'No available products found for this restaurant.' })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {t('discounts.addAvailableProductsFirst', { defaultValue: 'Please add some available products first before creating discounts.' })}
                  </p>
                </div>
              ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {visibleProducts.map((product) => (
                  <div key={product.id} className="flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <label className="flex items-center cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductToggle(product.id)}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {i18n.language === 'ar' ? product.nameAr : i18n.language === 'de' ? product.nameDe : product.name}
                          </h4>
                          {product.isNew && (
                            <span className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                              {t('productManagement.new')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {i18n.language === 'ar' ? product.descriptionAr : i18n.language === 'de' ? product.descriptionDe : product.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-primary-600">€{product.price.toFixed(2)}</span>
                            <span className="text-xs text-gray-400">• {
                              (i18n.language === 'ar' ? product.ingredientsAr : i18n.language === 'de' ? product.ingredientsDe : product.ingredients)
                                .split(',').slice(0, 2).join(', ')
                            }</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProductDetail(product.id);
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors"
                            title={t('discounts.viewProductDetails', { defaultValue: 'View Details' })}
                          >
                            <Info className="w-3 h-3" />
                            {t('discounts.details', { defaultValue: 'Details' })}
                          </button>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
                {showCount < filteredProducts.length && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium uppercase"
                      onClick={() => dispatch(increaseShowCount())}
                    >
                      {t('discounts.seeMore', { defaultValue: 'See more' })}
                    </button>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveDiscount}
              disabled={!discountName || !fromDate || !toDate || !discountValue || selectedProducts.length === 0 || isCreating || filteredProducts.length === 0}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <Save className="w-5 h-5" />
              {isCreating ? t('discounts.saving', { defaultValue: 'Saving...' }) : t('discounts.saveAndApplyDiscount', { defaultValue: 'Save & Apply Discount' })}
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50">
          <Check className="w-5 h-5" />
          {t('discounts.discountSavedSuccessfully', { defaultValue: 'Discount saved successfully!' })}
        </div>
      )}

      {/* Product Detail Modal - Demonstrates GET /api/products/:id */}
      {selectedProductId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('discounts.productDetails', { defaultValue: 'Product Details' })}
                </h2>
                <button
                  onClick={handleCloseProductDetail}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Product Detail Content */}
              {isLoadingProductDetail ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600">
                    {t('discounts.loadingProductDetails', { defaultValue: 'Loading product details...' })}
                  </span>
                </div>
              ) : productDetail ? (
                <div className="space-y-6">
                  {/* API Endpoint Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">
                      API Endpoint Used:
                    </h3>
                    <code className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      GET /api/products/{selectedProductId}
                    </code>
                  </div>

                  {/* Product Image */}
                  {productDetail.images && productDetail.images.length > 0 && (
                    <div className="text-center">
                      <img
                        src={productDetail.images[0]}
                        alt={productDetail.name?.en || productDetail.name}
                        className="w-48 h-48 object-cover rounded-xl mx-auto shadow-lg"
                      />
                    </div>
                  )}

                  {/* Product Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {t('discounts.basicInfo', { defaultValue: 'Basic Information' })}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Product ID:</label>
                          <p className="text-gray-900 font-mono text-sm">{productDetail._id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Name:</label>
                          <p className="text-gray-900">{productDetail.name?.en || productDetail.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Price:</label>
                          <p className="text-gray-900 font-semibold">€{productDetail.price?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Category ID:</label>
                          <p className="text-gray-900 font-mono text-sm">{productDetail.categoryId}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Available:</label>
                          <p className="text-gray-900">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              productDetail.isAvailable !== false 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {productDetail.isAvailable !== false ? 'Yes' : 'No'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {t('discounts.additionalInfo', { defaultValue: 'Additional Information' })}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Description:</label>
                          <p className="text-gray-900 text-sm">
                            {productDetail.description?.en || productDetail.description || 'No description available'}
                          </p>
                        </div>
                        {productDetail.allergens && productDetail.allergens.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Allergens:</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {productDetail.allergens.map((allergen: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                                >
                                  {allergen}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-600">Restaurant ID:</label>
                          <p className="text-gray-900 font-mono text-sm">{productDetail.restaurantId}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Raw API Response */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      Raw API Response:
                    </h3>
                    <pre className="text-xs text-gray-700 bg-white p-3 rounded border overflow-x-auto">
                      {JSON.stringify(productDetail, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {t('discounts.productNotFound', { defaultValue: 'Product not found' })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {discountToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="p-3 bg-red-100 rounded-xl mx-auto mb-4 w-fit">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('discounts.deleteConfirmation', { defaultValue: 'Delete Discount' })}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('discounts.deleteMessage', { 
                  defaultValue: 'Are you sure you want to delete this discount? This action cannot be undone.' 
                })}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCancelDelete}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isDeleting}
                >
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('common.deleting', { defaultValue: 'Deleting...' })}
                    </div>
                  ) : (
                    t('common.delete', { defaultValue: 'Delete' })
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discounts;