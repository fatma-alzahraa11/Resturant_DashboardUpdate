import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Percent,
  Package,
  QrCode,
  Gift,
  Monitor,

} from 'lucide-react';
import { Copy, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import DashboardCard from '../components/Dashboard/DashboardCard';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const auth = useSelector((state: RootState) => state.auth);
  const [restaurantCode, setRestaurantCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  

  // Derive any code that may already exist on the user payload
  const initialCode = useMemo(() => {
    const u: any = auth?.user || {};
    return (
      u?.restaurantCode ||
      u?.restaurant?.restaurantCode ||
      null
    );
  }, [auth?.user]);

  useEffect(() => {
    if (initialCode) {
      setRestaurantCode(initialCode);
      return;
    }
    const restaurantId: string | undefined = (auth?.user as any)?.restaurantId;
    if (!restaurantId) return;
    // Fallback fetch to get restaurant code by id
    const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';
    fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/code`, {
      headers: {
        'Content-Type': 'application/json',
        'authorization': auth?.token ? `Bearer ${auth.token}` : ''
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        const code = data?.restaurantCode || data?.restaurant?.restaurantCode;
        if (code) setRestaurantCode(code);
      })
      .catch(() => {});
  }, [initialCode, auth?.user, auth?.token]);

  const onCopy = async () => {
    if (!restaurantCode) return;
    try {
      await navigator.clipboard.writeText(restaurantCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {}
  };

  

  const dashboardCards = [
    {
      title: t('nav.loyaltyCard'),
      description: t('dashboard.cardDescriptions.loyaltyCard'),
      icon: CreditCard,
      to: '/loyalty-card',
      gradient: 'bg-[#E85D04]', // برتقالي غامق
    },
    {
      title: t('nav.discounts'),
      description: t('dashboard.cardDescriptions.discounts'),
      icon: Percent,
      to: '/discounts',
      gradient: 'bg-[#F48C06]', // برتقالي فاتح
    },
    {
      title: t('nav.productList'),
      description: t('dashboard.cardDescriptions.productList'),
      icon: Package,
      to: '/product-list',
      gradient: 'bg-[#E85D04]',
    },
    {
      title: t('nav.qrPrinting'),
      description: t('dashboard.cardDescriptions.qrPrinting'),
      icon: QrCode,
      to: '/qr-printing',
      gradient: 'bg-[#F48C06]',
    },
    {
      title: t('nav.offers'),
      description: t('dashboard.cardDescriptions.offers'),
      icon: Gift,
      to: '/offers',
      gradient: 'bg-[#E85D04]',
    },
    {
      title: t('nav.displayScreen'),
      description: t('dashboard.cardDescriptions.displayScreen'),
      icon: Monitor,
      to: '/admin/display-screen',
      gradient: 'bg-[#F48C06]',
    },

  ];

  return (
    <div className="space-y-8">
      {/* Restaurant Code Banner */}
      {restaurantCode && (
        <div className={`rounded-2xl border p-4 sm:p-5 md:p-6 shadow-sm bg-amber-50 border-amber-200 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-amber-900 mb-1">{t('dashboard.restaurantCode.title')}</div>
              <div className="text-amber-800 text-sm sm:text-base mb-3">
                {t('dashboard.restaurantCode.description')}
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <code className="px-3 py-2 rounded-lg bg-white border border-amber-200 text-amber-900 font-mono text-sm">{restaurantCode}</code>
                <button onClick={onCopy} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t('dashboard.restaurantCode.copied') : t('dashboard.restaurantCode.copy')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-900 mb-4">
          {t('dashboard.welcome')}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('dashboard.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-900 mb-4 md:mb-6">
          {t('dashboard.quickAccess')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-w-0">
          {dashboardCards.map((card) => (
            <div className="min-w-0 break-words">
              <DashboardCard
                key={card.to}
                title={card.title}
                description={card.description}
                icon={card.icon}
                to={card.to}
                gradient={card.gradient}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;