import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  ingredients: string;
  image?: string;
  isAvailable: boolean;
  isNew: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface ProductListProps {
  products: Product[];
  categories: Category[];
  onEditProduct: (product: Product) => void;
  onShowIngredients: (ingredients: string) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  onEditProduct,
  onShowIngredients,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();
  const [newlyAddedProducts, setNewlyAddedProducts] = useState<Set<string>>(new Set());
  const [previousProductsCount, setPreviousProductsCount] = useState(products.length);

  // Track newly added products
  useEffect(() => {
    if (products.length > previousProductsCount) {
      // Find the new product(s)
      const newProductIds = products
        .filter(product => !Array.from(newlyAddedProducts).includes(product.id))
        .map(product => product.id);
      
      if (newProductIds.length > 0) {
        setNewlyAddedProducts(prev => new Set([...prev, ...newProductIds]));
        
        // Remove from newly added after 5 seconds
        setTimeout(() => {
          setNewlyAddedProducts(prev => {
            const updated = new Set(prev);
            newProductIds.forEach(id => updated.delete(id));
            return updated;
          });
        }, 5000);
      }
    }
    setPreviousProductsCount(products.length);
  }, [products.length, previousProductsCount, newlyAddedProducts]);

  const getProductsByCategory = (categoryId: string) => {
    return products.filter(product => product.categoryId === categoryId);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '';
  };

  // Handler to toggle product availability
  const handleToggleAvailable = useCallback((product: Product) => {
    onEditProduct({ ...product, isAvailable: !product.isAvailable });
  }, [onEditProduct]);

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{t('productManagement.noProductsYet')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 overflow-x-hidden px-2 sm:px-0">
      {categories.map(category => {
        const categoryProducts = getProductsByCategory(category.id);
        
        if (categoryProducts.length === 0) return null;

        return (
          <div key={category.id} className="space-y-4 min-w-0">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-900 border-b border-gray-200 pb-2 px-2 md:px-0 min-w-0 break-words">
              {category.name} ({categoryProducts.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-w-0">
              {categoryProducts.map((product) => (
                <div key={product.id} className="min-w-0 break-words">
                  <ProductCard
                    product={product}
                    onEdit={onEdit}
                    onShowIngredients={onShowIngredients}
                    categoryName={getCategoryName(product.categoryId)}
                    onToggleAvailable={handleToggleAvailable}
                    onDelete={onDelete}
                    bgClass={'bg-white'}
                    isNewlyAdded={newlyAddedProducts.has(product.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;