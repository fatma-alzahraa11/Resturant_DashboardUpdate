import React from 'react';
import { useTranslation } from 'react-i18next';
import ProductManagement from '../components/ProductManagement/ProductManagement';

const ProductList: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ProductManagement />
  );
};

export default ProductList;