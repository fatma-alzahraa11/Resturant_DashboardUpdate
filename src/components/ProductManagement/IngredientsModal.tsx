import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle } from 'lucide-react';

interface IngredientsModalProps {
  ingredients: string;
  isVisible: boolean;
  onClose: () => void;
}

const IngredientsModal: React.FC<IngredientsModalProps> = ({ ingredients, isVisible, onClose }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  if (!isVisible) return null;

  const ingredientsList = ingredients.split(',').map(item => item.trim()).filter(item => item);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-3 bg-orange-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-primary-900">
              {t('productManagement.allergensAndIngredients')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          {ingredientsList.length > 0 ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-orange-800 font-medium mb-2">
                {t('productManagement.allergenWarning')}
              </p>
            </div>
          ) : null}
          
          {ingredientsList.length > 0 ? (
            <ul className="space-y-3">
              {ingredientsList.map((ingredient, index) => (
                <li 
                  key={index}
                  className={`flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{ingredient}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {t('productManagement.noAllergensListed')}
            </p>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-colors font-medium"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IngredientsModal;