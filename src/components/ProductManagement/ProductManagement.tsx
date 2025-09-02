import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Plus, Search, Trash2 } from 'lucide-react';
import CategoryForm from './CategoryForm';
import CategoryList from './CategoryList';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import IngredientsModal from './IngredientsModal';
import DemoData from './DemoData';
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useLazyGetProductByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductAvailabilityMutation,
  useDeleteProductMutation,
} from '../../store/services/catalogApi';
import { extractApiError } from '../../utils/apiError';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface Category { id: string; name: string; }
interface Product { id: string; name: string; categoryId: string; description: string; price: number; ingredients: string; image?: string; isAvailable: boolean; isNew: boolean; }

const ProductManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Backend data (replace demo state)
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authToken = useSelector((state: RootState) => state.auth.token);
  const restaurantId: string = typeof authUser?.restaurantId === 'object'
    ? (authUser?.restaurantId?._id || '')
    : (authUser?.restaurantId || '');
  const { data: categoriesData } = useGetCategoriesQuery(
    restaurantId ? { restaurantId } : undefined,
    { skip: !authToken }
  );
  const { data: productsData } = useGetProductsQuery(
    restaurantId ? { restaurantId } : undefined,
    { skip: !authToken }
  );
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateAvailability] = useUpdateProductAvailabilityMutation();
  const [triggerGetProductById] = useLazyGetProductByIdQuery();

  const categories: Category[] = useMemo(() =>
    (categoriesData || []).map((c: any) => ({ id: c._id, name: typeof c.name === 'string' ? c.name : (c.name?.en || c.name?.ar || c.name?.de || '') })),
  [categoriesData]);

  const products: Product[] = useMemo(() =>
    (productsData || []).map((p: any) => {
      const nameStr = typeof p.name === 'string' ? p.name : (p.name?.en || p.name?.ar || p.name?.de || '');
      const descStr = typeof p.description === 'string' ? p.description : (p.description?.en || p.description?.ar || p.description?.de || '');
      const isAvailable = typeof p.availability === 'object' && p.availability
        ? Boolean(p.availability.isAvailable)
        : Boolean(p.isAvailable ?? true);
      const ingredientsStr = Array.isArray(p.allergens)
        ? p.allergens.join(', ')
        : Array.isArray(p.ingredients)
          ? p.ingredients.join(', ')
          : (p.ingredients || '');
      return {
        id: p._id,
        name: nameStr,
        categoryId: typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId,
        description: descStr,
        price: Number(p.price) || 0,
        ingredients: ingredientsStr,
        image: Array.isArray(p.images) && p.images[0] ? p.images[0] : undefined,
        isAvailable,
        isNew: Boolean(p.isNewItem ?? p.isNew ?? false),
      };
    }),
  [productsData]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [, setSelectedCategoryId] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState('');
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [filterNew, setFilterNew] = useState<boolean | null>(null);

  // Category management
  const handleAddCategory = async (name: string) => {
    try {
      await createCategory({ restaurantId, name }).unwrap();
      setShowCategoryForm(false);
    } catch (error) {
      const parsed = extractApiError(error);
      alert(parsed.message);
    }
  };

  const handleEditCategory = async (id: string, newName: string) => {
    try {
      await updateCategory({ id, restaurantId, name: { en: newName } }).unwrap();
    } catch (error) {
      const parsed = extractApiError(error);
      alert(parsed.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id).unwrap();
    } catch (error) {
      const parsed = extractApiError(error);
      alert(parsed.message);
    }
  };

  const handleAddDemoCategories = () => {};
  const handleAddDemoProducts = () => {};

  // Product management
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      await createProduct({
        restaurantId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        categoryId: productData.categoryId,
        isAvailable: productData.isAvailable,
        isNewItem: productData.isNew,
        allergens: productData.ingredients ? productData.ingredients.split(',').map(s => s.trim()).filter(Boolean) : [],
        images: productData.image ? [productData.image] : [],
      }).unwrap();
      setShowProductForm(false);
      setSelectedCategoryId('');
    } catch (error) {
      const parsed = extractApiError(error);
      alert(parsed.message);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await updateProduct({
        id: updatedProduct.id,
        restaurantId,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        categoryId: updatedProduct.categoryId,
        isAvailable: updatedProduct.isAvailable,
        isNewItem: updatedProduct.isNew,
        allergens: updatedProduct.ingredients ? updatedProduct.ingredients.split(',').map(s => s.trim()).filter(Boolean) : [],
        images: updatedProduct.image ? [updatedProduct.image] : [],
      }).unwrap();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      const parsed = extractApiError(error);
      alert(parsed.message);
    }
  };

  // Handler for deleting products
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteProductDialog(true);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id).unwrap();
      setShowDeleteProductDialog(false);
      setProductToDelete(null);
    } catch (error) {
      const parsed = extractApiError(error);
      alert(parsed.message);
    }
  };

  const handleCancelDeleteProduct = () => {
    setShowDeleteProductDialog(false);
    setProductToDelete(null);
  };

  // Handler for toggling availability instantly
  const handleToggleProductAvailability = async (updatedProduct: Product) => {
    try {
      await updateAvailability({ id: updatedProduct.id, isAvailable: updatedProduct.isAvailable }).unwrap();
    } catch (error) {
      const parsed = extractApiError(error);
      alert(parsed.message);
    }
  };

  // Handler for opening the edit modal
  const handleEditProduct = async (product: Product) => {
    try {
      // Validate ID and token before fetching
      const id = (product.id || '').trim();
      const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(id);
      const shouldFetchOnEdit = (import.meta as any).env?.VITE_FETCH_PRODUCT_ON_EDIT === 'true';
      let fresh: any = null;
      if (shouldFetchOnEdit && authToken && isValidObjectId) {
        // Fetch latest data by ID then open form
        fresh = await triggerGetProductById(id).unwrap();
      }
      if (fresh) {
        const nameStr = typeof fresh.name === 'string' ? fresh.name : (fresh.name?.en || fresh.name?.ar || fresh.name?.de || '');
        const descStr = typeof fresh.description === 'string' ? fresh.description : (fresh.description?.en || fresh.description?.ar || fresh.description?.de || '');
        const isAvailable = typeof fresh.availability === 'object' && fresh.availability
          ? Boolean(fresh.availability.isAvailable)
          : Boolean(fresh.isAvailable ?? true);
        const ingredientsStr = Array.isArray(fresh.allergens)
          ? fresh.allergens.join(', ')
          : Array.isArray(fresh.ingredients)
            ? fresh.ingredients.join(', ')
            : (fresh.ingredients || '');
        const mapped = {
          id: fresh._id,
          name: nameStr,
          categoryId: typeof fresh.categoryId === 'object' ? fresh.categoryId?._id : fresh.categoryId,
          description: descStr,
          price: Number(fresh.price) || 0,
          ingredients: ingredientsStr,
          image: Array.isArray(fresh.images) && fresh.images[0] ? fresh.images[0] : undefined,
          isAvailable,
          isNew: Boolean(fresh.isNewItem ?? fresh.isNew ?? false),
        } as Product;
        setEditingProduct(mapped);
      } else {
        // Fallback to the item we have
        setEditingProduct(product);
      }
      setShowProductForm(true);
    } catch (error) {
      const parsed = extractApiError(error);
      alert(parsed.message);
      // Fallback to existing item if fetch fails
      setEditingProduct(product);
      setShowProductForm(true);
    }
  };

  const handleShowProductForm = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleQuickAddProduct = () => {
    setSelectedCategoryId('');
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleShowIngredients = (ingredients: string) => {
    setSelectedIngredients(ingredients);
    setShowIngredientsModal(true);
  };

  const handleCancelProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setSelectedCategoryId('');
  };

  // Filter and search
  const filteredProducts = products.filter(product => {
    const term = (searchTerm || '').toLowerCase();
    const nameText = product.name || '';
    const descText = product.description || '';
    const matchesSearch = !term || nameText.toLowerCase().includes(term) || descText.toLowerCase().includes(term);
    const matchesAvailable = filterAvailable === null || product.isAvailable === filterAvailable;
    const matchesNew = filterNew === null || product.isNew === filterNew;
    return matchesSearch && matchesAvailable && matchesNew;
  });

  // Statistics
  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.isAvailable).length;
  const newProducts = products.filter(p => p.isNew).length;
  const averagePrice = products.length > 0 
    ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className={`flex items-center space-x-4 mb-6 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className="p-3 bg-primary-100 rounded-xl">
            <Package className="w-8 h-8 text-primary-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">
              {t('pages.productList.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('pages.productList.description')}
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#E85D04] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8" />
              <span className="text-2xl font-bold">{totalProducts}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{t('productManagement.totalProducts')}</h3>
            <p className="text-sm text-white/80"></p>
          </div>

          <div className="bg-[#F48C06] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8" />
              <span className="text-2xl font-bold">{availableProducts}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{t('productManagement.availableProducts')}</h3>
            <p className="text-sm text-white/80"></p>
          </div>

          <div className="bg-[#E85D04] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8" />
              <span className="text-2xl font-bold">{newProducts}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{t('productManagement.newProducts')}</h3>
            <p className="text-sm text-white/80"></p>
          </div>

          <div className="bg-[#F48C06] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8" />
              <span className="text-2xl font-bold">{averagePrice.toFixed(2)}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{t('productManagement.averagePrice')}</h3>
            <p className="text-sm text-white/80"></p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${
              isRTL ? 'right-3' : 'left-3'
            }`} />
            <input
              type="text"
              placeholder={t('productManagement.searchProducts')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                isRTL ? 'text-right pr-10 pl-4' : 'text-left'
              }`}
            />
          </div>

          {/* Filter Buttons */}
          <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => setFilterAvailable(filterAvailable === true ? null : true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterAvailable === true
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('productManagement.available')}
            </button>
            <button
              onClick={() => setFilterNew(filterNew === true ? null : true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterNew === true
                  ? 'bg-primary-100 text-primary-800 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('productManagement.new')}
            </button>
            {(filterAvailable !== null || filterNew !== null) && (
              <button
                onClick={() => {
                  setFilterAvailable(null);
                  setFilterNew(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {t('productManagement.clearFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-3 items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={handleQuickAddProduct}
            className={`flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <Plus className="w-5 h-5" />
            {t('productManagement.addProduct')}
          </button>
          <button
            onClick={() => setShowCategoryForm(true)}
            className={`flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <Plus className="w-5 h-5" />
            {t('productManagement.addCategory')}
          </button>
        </div>
      </div>

      {/* Demo Data Section */}
      {categories.length === 0 && products.length === 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <DemoData
            onAddCategories={handleAddDemoCategories}
            onAddProducts={handleAddDemoProducts}
          />
        </div>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#780000' }}>
            {t('productManagement.categories')}
          </h2>
          <CategoryList
            categories={categories}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddProduct={handleShowProductForm}
          />
        </div>
      )}

      {/* Products Section */}
      {products.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-2xl font-bold" style={{ color: '#780000' }}>
              {t('productManagement.products')}
            </h2>
            {searchTerm || filterAvailable !== null || filterNew !== null ? (
              <span className="text-sm text-gray-500">
                {t('productManagement.showingResults', { count: filteredProducts.length, total: products.length })}
              </span>
            ) : null}
          </div>
          <ProductList
            products={filteredProducts}
            categories={categories}
            onEditProduct={handleToggleProductAvailability}
            onShowIngredients={handleShowIngredients}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </div>
      )}

      {/* Modals */}
      <CategoryForm
        isVisible={showCategoryForm}
        onAddCategory={handleAddCategory}
        onCancel={() => setShowCategoryForm(false)}
      />

      <ProductForm
        isVisible={showProductForm}
        categories={categories}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onCancel={handleCancelProductForm}
        editingProduct={editingProduct}
      />

      <IngredientsModal
        isVisible={showIngredientsModal}
        ingredients={selectedIngredients}
        onClose={() => setShowIngredientsModal(false)}
      />

      {/* Delete Product Confirmation Dialog */}
      {showDeleteProductDialog && productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('productManagement.deleteProductTitle')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('productManagement.confirmDeleteProduct', { name: productToDelete.name })}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDeleteProduct}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleConfirmDeleteProduct}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;