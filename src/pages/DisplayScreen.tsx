import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Phone, 
  Heart,
  Coffee,
  Utensils,
  Wine,
  Dessert,
  Pizza,
  Beef,
  Salad,
  ArrowLeft,
  ArrowRight,
  Percent,
  Gift,
  CheckCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/services/catalogApi';
import { useGetActiveOffersQuery } from '../store/services/offersApi';
import { useGetDiscountsQuery } from '../store/services/discountApi';

interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  nameDe: string;
  description: string;
  descriptionAr: string;
  descriptionDe: string;
  price: number;
  category: string;
  categoryAr: string;
  categoryDe: string;
  image: string;
  isNew: boolean;
  isPopular: boolean;
  allergens: string[];
  preparationTime: number;
  isAvailable?: boolean;
}

interface Category {
  id: string;
  name: string;
  nameAr: string;
  nameDe: string;
  icon: React.ReactNode;
}

const DisplayScreen: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [restaurantInfo, setRestaurantInfo] = useState<{ name?: string; phone?: string; cuisine?: string } | null>(() => {
    try {
      const cachedRaw = typeof window !== 'undefined' ? localStorage.getItem('restaurantInfo') : null;
      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const cached = cachedRaw ? JSON.parse(cachedRaw) : null;
      const localUser = userRaw ? JSON.parse(userRaw) : null;
      const name =
        cached?.name ||
        localUser?.restaurant?.name ||
        localUser?.restaurantName ||
        localUser?.businessName ||
        localUser?.name ||
        localUser?.restaurant?.displayName;
      const phone =
        cached?.phone ||
        localUser?.restaurant?.contact?.phone ||
        localUser?.contact?.phone ||
        localUser?.phone ||
        localUser?.restaurantPhone;
      const cuisine =
        cached?.cuisine ||
        localUser?.restaurant?.cuisine ||
        localUser?.cuisine ||
        localUser?.restaurant?.type;
      if (name || phone || cuisine) {
        return { name, phone, cuisine };
      }
    } catch {}
    return null;
  });

  // ابدأ الصفحة من الأعلى عند الدخول لهذه الصفحة
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Redux state
  const auth = useSelector((state: RootState) => state.auth);
  // Prefer restaurantId from logged-in user, then from localStorage user; keep legacy fallback for other data.
  const localUserForId = (() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();
  const restaurantId = auth.user?.restaurantId || localUserForId?.restaurantId || '68a46a003f923c33fd567ac0';
  const authToken = auth.token || localStorage.getItem('authToken') || undefined;
  

  // Initialize restaurant info immediately from available local user data to avoid flashing default
  useEffect(() => {
    try {
      const localUserRaw = localStorage.getItem('user');
      const localUser = auth?.user || (localUserRaw ? JSON.parse(localUserRaw) : null);
      if (localUser && !restaurantInfo) {
        const name =
          localUser?.restaurant?.name ||
          localUser?.restaurantName ||
          localUser?.businessName ||
          localUser?.name ||
          localUser?.restaurant?.displayName;
        const phone =
          localUser?.restaurant?.contact?.phone ||
          localUser?.contact?.phone ||
          localUser?.phone ||
          localUser?.restaurantPhone;
        const cuisine =
          localUser?.restaurant?.cuisine ||
          localUser?.cuisine ||
          localUser?.restaurant?.type;
        if (name || phone || cuisine) {
          setRestaurantInfo({ name, phone, cuisine });
        }
      }
    } catch {}
  }, [auth?.user]);

  // API calls using Redux Toolkit
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts 
  } = useGetProductsQuery({ restaurantId }, {
    // تحديث تلقائي كل 30 ثانية
    pollingInterval: 30000,
    // إعادة محاولة عند فشل الاتصال
    refetchOnMountOrArgChange: true,
    // إعادة جلب البيانات عند استعادة الاتصال
    refetchOnReconnect: true
  });

  // Fetch restaurant details (name, phone, cuisine)
  useEffect(() => {
    if (!restaurantId) return;
    const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'authorization': `Bearer ${authToken}` } : {}),
      },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((data) => {
        const name = data?.name || data?.restaurant?.name;
        const phone = data?.contact?.phone || data?.restaurant?.contact?.phone;
        const cuisine = data?.cuisine || data?.restaurant?.cuisine;
        const info = { name, phone, cuisine };
        setRestaurantInfo(info);
        try { localStorage.setItem('restaurantInfo', JSON.stringify(info)); } catch {}
      })
      .catch(() => {})
      .finally(() => {});
    return () => controller.abort();
  }, [restaurantId, authToken]);
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories 
  } = useGetCategoriesQuery({ restaurantId }, {
    // تحديث تلقائي كل 30 ثانية
    pollingInterval: 30000,
    // إعادة محاولة عند فشل الاتصال
    refetchOnMountOrArgChange: true,
    // إعادة جلب البيانات عند استعادة الاتصال
    refetchOnReconnect: true
  });
  const { 
    data: offersData, 
    isLoading: offersLoading, 
    error: offersError,
    refetch: refetchOffers 
  } = useGetActiveOffersQuery({ restaurantId }, {
    // تحديث تلقائي كل 30 ثانية
    pollingInterval: 30000,
    // إعادة محاولة عند فشل الاتصال
    refetchOnMountOrArgChange: true,
    // إعادة جلب البيانات عند استعادة الاتصال
    refetchOnReconnect: true
  });
  const { 
    data: discountsData, 
    isLoading: discountsLoading, 
    error: discountsError,
    refetch: refetchDiscounts 
  } = useGetDiscountsQuery({ restaurantId }, {
    // تحديث تلقائي كل 30 ثانية
    pollingInterval: 30000,
    // إعادة محاولة عند فشل الاتصال
    refetchOnMountOrArgChange: true,
    // إعادة جلب البيانات عند استعادة الاتصال
    refetchOnReconnect: true
  });

  // Transform backend data to frontend format
  const transformProducts = (): MenuItem[] => {
    if (!productsData || !Array.isArray(productsData)) return [];
    
    return productsData.map((product: any) => ({
      id: product._id || product.id,
      name: typeof product.name === 'string' ? product.name : 
            (product.name?.en || 'Product Name'),
      nameAr: typeof product.name === 'string' ? product.name : 
              (product.name?.ar || 'اسم المنتج'),
      nameDe: typeof product.name === 'string' ? product.name : 
              (product.name?.de || 'Produktname'),
      description: typeof product.description === 'string' ? product.description : 
                  (product.description?.en || 'Product description'),
      descriptionAr: typeof product.description === 'string' ? product.description : 
                    (product.description?.ar || 'وصف المنتج'),
      descriptionDe: typeof product.description === 'string' ? product.description : 
                    (product.description?.de || 'Produktbeschreibung'),
      price: product.price || 0,
      category: product.category || 'general',
      categoryAr: product.categoryAr || 'عام',
      categoryDe: product.categoryDe || 'Allgemein',
      image: product.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      isNew: Boolean(product.isNewItem ?? product.isNew ?? false),
      isPopular: product.isPopular || false,
      allergens: Array.isArray(product.allergens) ? product.allergens : [],
      preparationTime: product.preparationTime || 15,
      // دعم هيكلين من الخادم: availability.isAvailable أو isAvailable مباشرة
      isAvailable: (product.availability?.isAvailable === true) || (product.isAvailable === true)
    }));
  };

  const transformCategories = (): Category[] => {
    if (!categoriesData || !Array.isArray(categoriesData)) return [];
    
    const iconMap: { [key: string]: React.ReactNode } = {
      'coffee': <Coffee className="w-5 h-5" />,
      'food': <Utensils className="w-5 h-5" />,
      'drinks': <Wine className="w-5 h-5" />,
      'desserts': <Dessert className="w-5 h-5" />,
      'pizza': <Pizza className="w-5 h-5" />,
      'meat': <Beef className="w-5 h-5" />,
      'salads': <Salad className="w-5 h-5" />,
      'default': <Utensils className="w-5 h-5" />
    };

    return categoriesData.map((category: any) => ({
      id: category._id || category.id,
      name: typeof category.name === 'string' ? category.name : 
            (category.name?.en || 'Category'),
      nameAr: typeof category.name === 'string' ? category.name : 
              (category.name?.ar || 'فئة'),
      nameDe: typeof category.name === 'string' ? category.name : 
              (category.name?.de || 'Kategorie'),
      icon: iconMap[category.type] || iconMap.default
    }));
  };

  const transformOffers = () => {
    if (!offersData || !Array.isArray(offersData)) return [];
    
    // تصفية العروض المتاحة فقط
    const availableOffers = offersData.filter((offer: any) => 
      offer.isAvailable === true && 
      offer.isActive !== false
    );
    
    return availableOffers.map((offer: any) => ({
      id: offer._id || offer.id,
      title: typeof offer.title === 'string' ? offer.title : 
             (offer.title?.en || 'Special Offer'),
      description: typeof offer.description === 'string' ? offer.description : 
                  (offer.description?.en || 'Limited time offer'),
      image: offer.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      price: offer.price || 0,
      isAvailable: true,
      products: Array.isArray(offer.products)
        ? offer.products.map((p: any) => {
            const prod = p && typeof p.productId === 'object' ? p.productId : null;
            return {
              productId: prod ? (prod._id || prod.id) : (p.productId || ''),
              name: prod ? (typeof prod.name === 'string' ? prod.name : (prod.name?.[i18n.language] || prod.name?.en || '')) : '',
              price: prod ? (prod.price || 0) : 0,
              image: prod ? (prod.image || '') : '',
              quantity: p.quantity || 1,
              unit: p.unit || 'Number',
            };
          })
        : []
    }));
  };

  const transformDiscounts = () => {
    if (!discountsData || !Array.isArray(discountsData)) return [];
    
    return discountsData.map((discount: any) => ({
      id: discount._id || discount.id,
      name: typeof discount.name === 'string' ? discount.name : 
            (discount.name?.en || 'Discount'),
      value: discount.value || 0,
      type: discount.type || 'percentage',
      validTill: discount.validTill || 'Ongoing'
    }));
  };

  // لا نستخدم بيانات وهمية للعروض/الخصومات. المستخدم الجديد لن يرى الأقسام حتى يضيف بيانات



  // Get transformed data - use API data only. If none, keep empty arrays
  // اجلب المنتجات وحافظ فقط على المنتجات المتاحة/النشطة
  const menuItems = productsData ? transformProducts().filter((item) => item.isAvailable === true) : [];
  const categories = categoriesData ? transformCategories() : [
    { id: 'all', name: 'All', nameAr: 'الكل', nameDe: 'Alle', icon: <Utensils className="w-6 h-6" /> },
    { id: 'starters', name: 'Starters', nameAr: 'المقبلات', nameDe: 'Vorspeisen', icon: <Salad className="w-6 h-6" /> },
    { id: 'main', name: 'Main Dishes', nameAr: 'الأطباق الرئيسية', nameDe: 'Hauptgerichte', icon: <Utensils className="w-6 h-6" /> },
    { id: 'pizza', name: 'Pizza', nameAr: 'البيتزا', nameDe: 'Pizza', icon: <Pizza className="w-6 h-6" /> },
    { id: 'burgers', name: 'Burgers', nameAr: 'البرجر', nameDe: 'Burger', icon: <Beef className="w-6 h-6" /> },
    { id: 'drinks', name: 'Drinks', nameAr: 'المشروبات', nameDe: 'Getränke', icon: <Coffee className="w-6 h-6" /> },
    { id: 'desserts', name: 'Desserts', nameAr: 'الحلويات', nameDe: 'Desserts', icon: <Dessert className="w-6 h-6" /> },
  ];
  const offers = offersData ? transformOffers() : [];
  const discounts = discountsData ? transformDiscounts() : [];

  // Log API errors for debugging
  useEffect(() => {
    if (productsError) console.log('Products API Error:', productsError);
    if (categoriesError) console.log('Categories API Error:', categoriesError);
    if (offersError) console.log('Offers API Error:', offersError);
    if (discountsError) console.log('Discounts API Error:', discountsError);
    
    // Log API data for debugging
    console.log('=== API Data Debug ===');
    console.log('Raw Offers Data:', offersData);
    console.log('Raw Discounts Data:', discountsData);
    console.log('Transformed Offers:', transformOffers());
    console.log('Transformed Discounts:', transformDiscounts());
    console.log('======================');
  }, [productsError, categoriesError, offersError, discountsError, offersData, discountsData]);

  // سلايدر العروض: عرض كل الصور معًا (carousel)
  const [offerIndex] = useState(0);
  const offerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // دالة تمرير السلايدر يدويًا (حل ثابت)
  const scrollOffers = (direction: 'left' | 'right') => {
    const carousel = document.getElementById('offers-carousel');
    if (carousel) {
      let scrollAmount = 350;
      // في العربي: السهم الأيمن يمرر لليسار والعكس
      if (isRTL) {
        scrollAmount = direction === 'left' ? 350 : -350;
      } else {
        scrollAmount = direction === 'left' ? -350 : 350;
      }
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // تحريك السلايدر تلقائياً كل 4 ثواني (حل ثابت)
  useEffect(() => {
    if (offerIntervalRef.current) clearInterval(offerIntervalRef.current);
    offerIntervalRef.current = setInterval(() => {
      const carousel = document.getElementById('offers-carousel');
      if (carousel) {
        carousel.scrollBy({ left: 350, behavior: 'smooth' });
        // إذا وصل للنهاية، أرجعه للبداية
        if (carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - 10) {
          setTimeout(() => {
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
          }, 400);
        }
      }
    }, 4000);
    return () => {
      if (offerIntervalRef.current) clearInterval(offerIntervalRef.current);
    };
  }, [offers.length]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // مراقبة التغييرات في جميع البيانات وإعادة جلبها عند الحاجة
  useEffect(() => {
    // إعادة جلب جميع البيانات عند تغيير restaurantId
    if (restaurantId) {
      refetchProducts();
      refetchCategories();
      refetchOffers();
      refetchDiscounts();
    }
  }, [restaurantId, refetchProducts, refetchCategories, refetchOffers, refetchDiscounts]);

  // إعادة جلب جميع البيانات عند تغيير اللغة
  useEffect(() => {
    refetchProducts();
    refetchCategories();
    refetchOffers();
    refetchDiscounts();
  }, [i18n.language, refetchProducts, refetchCategories, refetchOffers, refetchDiscounts]);

  // مراقبة التغييرات في البيانات وإعادة جلبها عند الحاجة
  useEffect(() => {
    // إعادة جلب البيانات كل دقيقة للتأكد من التحديث
    const interval = setInterval(() => {
      refetchProducts();
      refetchCategories();
      refetchOffers();
      refetchDiscounts();
    }, 60000); // كل دقيقة

    return () => clearInterval(interval);
  }, [refetchProducts, refetchCategories, refetchOffers, refetchDiscounts]);

  // مراقبة التغييرات في بيانات العروض للتحديث الفوري
  useEffect(() => {
    if (offersData) {
      console.log('Offers data updated:', offersData);
      // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
    }
  }, [offersData]);

  // مراقبة التغييرات في بيانات الخصومات للتحديث الفوري
  useEffect(() => {
    if (discountsData) {
      console.log('Discounts data updated:', discountsData);
      // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
    }
  }, [discountsData]);

  const getLocalizedName = (item: MenuItem, field: 'name' | 'description' | 'category') => {
    const lang = i18n.language;
    switch (lang) {
      case 'ar':
        return item[`${field}Ar` as keyof MenuItem] as string;
      case 'de':
        return item[`${field}De` as keyof MenuItem] as string;
      default:
        return item[field];
    }
  };

  const getLocalizedCategoryName = (category: Category) => {
    const lang = i18n.language;
    switch (lang) {
      case 'ar':
        return category.nameAr;
      case 'de':
        return category.nameDe;
      default:
        return category.name;
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  // قائمة العروض مرتبة حسب اللغة
  const offersToShow = isRTL ? [...offers].reverse() : offers;

  // Show loading state
  if (productsLoading || categoriesLoading || offersLoading || discountsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#E85D04] mx-auto mb-4"></div>
          <p className="text-gray-600">
            {i18n.language === 'ar' ? 'جاري تحميل البيانات...' : 
             i18n.language === 'de' ? 'Daten werden geladen...' : 
             'Loading data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 font-sans">
      {/* شريط معلومات المطعم أعلى الصفحة */}
      <div className="w-full bg-white shadow-lg border-b border-orange-100 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0" style={isRTL ? {flexDirection: 'row-reverse'} : {}}>
          {/* يسار/يمين: اسم المطعم والشعار */}
          <div className="flex items-center gap-4" style={isRTL ? {flexDirection: 'row-reverse'} : {}}>
            <div className="w-16 h-16 bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-2xl flex items-center justify-center">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <div className="text-center md:text-left" style={isRTL ? {textAlign: 'right'} : {}}>
              <h1 className="text-3xl font-bold text-[#780000]">{restaurantInfo?.name || ''}</h1>
              <p className="text-gray-600 text-sm">
                {restaurantInfo?.cuisine || ''}
              </p>
            </div>
          </div>
          {/* يمين/يسار: الساعة والهاتف */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6" style={isRTL ? {flexDirection: 'row-reverse'} : {}}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#E85D04]">
                {currentTime.toLocaleTimeString(i18n.language === 'ar' ? 'ar-SA' : 
                                               i18n.language === 'de' ? 'de-DE' : 'en-US', 
                                               { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-gray-500">
                {currentTime.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 
                                               i18n.language === 'de' ? 'de-DE' : 'en-US', 
                                               { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div className="flex items-center gap-2" style={isRTL ? {flexDirection: 'row-reverse'} : {}}>
              <Phone className="w-5 h-5 text-[#E85D04]" />
              <span className="text-sm text-gray-600">{restaurantInfo?.phone || '+966 50 123 4567'}</span>
            </div>
          </div>
        </div>
      </div>
      {/* ====== أقسام احترافية للعروض والخصومات والولاء ====== */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-8 pb-4">
        {/* Offers Carousel */}
        {offers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#780000] mb-6 tracking-tight flex items-center gap-2">
            <Gift className="w-7 h-7 text-[#E85D04]" />
            {i18n.language === 'ar' ? 'العروض الحالية' : i18n.language === 'de' ? 'Aktuelle Angebote' : 'Current Offers'}
          </h2>
          <div className="relative">
            {/* أسهم التنقل */}
            <button
              onClick={() => scrollOffers('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-[#F48C06] text-[#E85D04] hover:text-white rounded-full p-2 shadow-lg transition-all duration-200"
              aria-label="Previous Offers"
              style={{ display: 'block' }}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scrollOffers('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-[#F48C06] text-[#E85D04] hover:text-white rounded-full p-2 shadow-lg transition-all duration-200"
              aria-label="Next Offers"
              style={{ display: 'block' }}
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <div
              id="offers-carousel"
              className="flex gap-6 overflow-x-auto pb-2 snap-x scroll-smooth"
              style={{ scrollbarWidth: 'none', direction: 'ltr' }}
            >
              {offersToShow.map((offer, idx) => (
                <div
                  key={offer.id}
                  className={`min-w-[320px] max-w-xs bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center snap-center hover:scale-105 transition-transform duration-300 animate-fade-in-up border-2 border-[#F48C06]/20 ${idx === offerIndex ? 'ring-4 ring-[#E85D04]/30' : ''}`}
                  style={isRTL ? { direction: 'rtl' } : {}}
                >
                  <div className="absolute top-4 left-4 animate-pulse">
                    <span className="bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg tracking-widest uppercase">
                      {i18n.language === 'ar' ? 'حصري' : i18n.language === 'de' ? 'Exklusiv' : 'Exclusive'}
                    </span>
                  </div>
                  <img src={offer.image} alt={offer.title} className="w-40 h-40 object-cover rounded-2xl mb-4 shadow-xl border-4 border-[#F48C06]/10" />
                  <div className="text-xl font-extrabold text-[#E85D04] mb-1 text-center tracking-tight">{offer.title}</div>
                  <div className="text-gray-600 text-base mb-2 text-center font-medium">{offer.description}</div>
                  {Array.isArray((offer as any).products) && (offer as any).products.length > 0 && (
                    <div className="w-full mb-3">
                      <div className="text-sm font-semibold text-[#780000] mb-2 text-center">
                        {i18n.language === 'ar' ? 'يشمل:' : i18n.language === 'de' ? 'Enthält:' : 'Includes:'}
                      </div>
                      <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {(offer as any).products.map((p: any) => (
                          <li key={`${offer.id}-${p.productId}`} className="flex items-center gap-2 text-xs text-gray-700">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-6 h-6 rounded object-cover" />
                            ) : null}
                            <span className="flex-1 truncate">{p.name}</span>
                            <span className="text-gray-500">
                              {p.quantity} {p.unit === 'KG' ? (i18n.language === 'ar' ? 'كجم' : p.unit) : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-extrabold text-[#780000]">€{offer.price.toFixed(2)}</span>
                    <span className="text-sm text-gray-400 line-through">€{(offer.price * 1.2).toFixed(2)}</span>
                  </div>
                  <button className="mt-2 px-6 py-2 bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform duration-200">
                    {i18n.language === 'ar' ? 'استفد من العرض' : i18n.language === 'de' ? 'Angebot nutzen' : 'Get Offer'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
        {/* Discounts Badges Modern */}
        {discounts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-extrabold text-[#780000] mb-6 tracking-tight flex items-center gap-2">
            <Percent className="w-7 h-7 text-[#E85D04]" />
            {i18n.language === 'ar' ? 'الخصومات' : i18n.language === 'de' ? 'Rabatte' : 'Discounts'}
          </h2>
          <div className="flex gap-6 flex-wrap justify-center">
            {discounts.map((discount) => (
              <div
                key={discount.id}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-[#F48C06] to-[#E85D04] text-white px-8 py-6 rounded-3xl shadow-2xl min-w-[220px] max-w-xs relative overflow-hidden group hover:scale-105 transition-transform duration-300 animate-pulse"
              >
                <div className="absolute -top-8 -right-8 opacity-20 group-hover:opacity-30 transition-all duration-300">
                  <CheckCircle className="w-24 h-24" />
                </div>
                <div className="rounded-full bg-white/20 p-4 mb-2 shadow-lg animate-bounce">
                  <Percent className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-extrabold tracking-wider">{discount.type === 'percentage' ? `%${discount.value}` : `€${discount.value}`}</div>
                <div className="font-bold text-lg mt-1 mb-1">{discount.name}</div>
                <div className="text-xs bg-white/20 rounded-full px-3 py-1 mt-2 font-semibold">
                  {i18n.language === 'ar' ? 'ساري حتى' : i18n.language === 'de' ? 'Gültig bis' : 'Valid till'} {discount.validTill}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Categories Navigation */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`flex items-center space-x-4 overflow-x-auto ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  isRTL ? 'flex-row-reverse space-x-reverse' : ''
                } ${
                  selectedCategory === category.id
                    ? 'bg-[#E85D04] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-[#E85D04]'
                }`}
              >
                {category.icon}
                <span>{getLocalizedCategoryName(category)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={getLocalizedName(item, 'name')}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                
                {/* Badges */}
                <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} flex flex-col gap-2`}>
                  {item.isNew && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                      {i18n.language === 'ar' ? 'جديد' : 
                       i18n.language === 'de' ? 'NEU' : 'NEW'}
                    </span>
                  )}
                  {item.isPopular && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {i18n.language === 'ar' ? 'شائع' : 
                       i18n.language === 'de' ? 'POPULAR' : 'POPULAR'}
                    </span>
                  )}
                </div>

                
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">
                    {getLocalizedName(item, 'name')}
                  </h3>
                  <div className="text-2xl font-bold text-[#E85D04] ml-3">
                    €{item.price.toFixed(2)}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {getLocalizedName(item, 'description')}
                </p>

                {/* Ingredients */}
                {item.allergens.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                      {'Ingredients:'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.allergens.map((allergen) => (
                        <span
                          key={allergen}
                          className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center">
                  <button className="bg-[#E85D04] text-white px-4 py-2 rounded-lg hover:bg-[#F48C06] transition-colors font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Make Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {i18n.language === 'ar' ? 'لا توجد عناصر في هذه الفئة' : 
               i18n.language === 'de' ? 'Keine Artikel in dieser Kategorie' : 
               'No items in this category'}
            </h3>
            <p className="text-gray-500">
              {i18n.language === 'ar' ? 'جرب اختيار فئة أخرى' : 
               i18n.language === 'de' ? 'Versuchen Sie eine andere Kategorie' : 
               'Try selecting a different category'}
            </p>
          </div>
        )}
      </div>

      {/* Footer removed as requested */}
    </div>
  );
};

export default DisplayScreen;