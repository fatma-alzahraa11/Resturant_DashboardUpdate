import React from 'react';
import { useTranslation } from 'react-i18next';

interface Category {
  id: string;
  name: string;
}

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

interface DemoDataProps {
  onAddCategories: (categories: Category[]) => void;
  onAddProducts: (products: Product[]) => void;
}

const DemoData: React.FC<DemoDataProps> = ({ onAddCategories, onAddProducts }) => {
  const { t } = useTranslation();

  const demoCategories: Category[] = [
    { id: '1', name: 'Appetizers' },
    { id: '2', name: 'Main Courses' },
    { id: '3', name: 'Desserts' },
    { id: '4', name: 'Beverages' },
  ];

  const demoProducts: Product[] = [
    {
      id: '1',
      name: 'Bruschetta',
      categoryId: '1',
      description: 'Toasted bread topped with tomatoes, garlic, and fresh basil',
      price: 8.99,
      ingredients: 'bread, tomatoes, garlic, basil, olive oil',
      isAvailable: true,
      isNew: true,
    },
    {
      id: '2',
      name: 'Grilled Salmon',
      categoryId: '2',
      description: 'Fresh Atlantic salmon grilled to perfection with herbs',
      price: 24.99,
      ingredients: 'salmon, herbs, lemon, olive oil',
      isAvailable: true,
      isNew: false,
    },
    {
      id: '3',
      name: 'Tiramisu',
      categoryId: '3',
      description: 'Classic Italian dessert with coffee-flavored mascarpone cream',
      price: 12.99,
      ingredients: 'mascarpone, coffee, eggs, sugar, ladyfingers',
      isAvailable: true,
      isNew: true,
    },
    {
      id: '4',
      name: 'Espresso',
      categoryId: '4',
      description: 'Strong Italian coffee served in a small cup',
      price: 3.99,
      ingredients: 'coffee beans, water',
      isAvailable: true,
      isNew: false,
    },
    {
      id: '5',
      name: 'Caesar Salad',
      categoryId: '1',
      description: 'Fresh romaine lettuce with Caesar dressing and croutons',
      price: 11.99,
      ingredients: 'romaine lettuce, parmesan cheese, croutons, caesar dressing',
      isAvailable: false,
      isNew: false,
    },
  ];

  const handleAddDemoData = () => {
    onAddCategories(demoCategories);
    onAddProducts(demoProducts);
  };

  return (
    <div className="bg-gradient-to-r from-primary-100 to-primary-50 rounded-xl p-6 border border-primary-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          {t('productManagement.demoDataTitle')}
        </h3>
        <p className="text-sm text-primary-700 mb-4">
          {t('productManagement.demoDataDescription')}
        </p>
        <button
          onClick={handleAddDemoData}
          className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
        >
          {t('productManagement.loadDemoData')}
        </button>
      </div>
    </div>
  );
};

export default DemoData; 