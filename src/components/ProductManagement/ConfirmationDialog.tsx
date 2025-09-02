import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isVisible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isVisible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'danger'
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600',
          bg: 'bg-red-100',
          button: 'bg-red-600 hover:bg-red-700',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          icon: 'text-orange-600',
          bg: 'bg-orange-100',
          button: 'bg-orange-600 hover:bg-orange-700',
          border: 'border-orange-200'
        };
      case 'info':
        return {
          icon: 'text-blue-600',
          bg: 'bg-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700',
          border: 'border-blue-200'
        };
      default:
        return {
          icon: 'text-red-600',
          bg: 'bg-red-100',
          button: 'bg-red-600 hover:bg-red-700',
          border: 'border-red-200'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`p-3 ${styles.bg} rounded-xl`}>
              <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
            </div>
            <h3 className="text-xl font-bold text-primary-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>

        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-3 px-4 rounded-xl transition-colors font-medium ${styles.button}`}
          >
            {confirmText || t('common.delete')}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            {cancelText || t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog; 