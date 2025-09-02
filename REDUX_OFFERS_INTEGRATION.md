# Redux Offers Integration Guide

## ✅ تم ربط الفرونت إند بالباك إند بنجاح!

لقد تم ربط صفحة العروض (Offers) بالباك إند باستخدام Redux Toolkit بشكل كامل.

## 🏗️ ما تم إنجازه:

### 1. Redux API Service - `src/store/services/offersApi.ts`
- **RTK Query API slice** كامل للعروض
- **جميع العمليات CRUD**: إنشاء، قراءة، تحديث، حذف
- **عمليات إضافية**: تبديل التوفر، الإحصائيات، الاستخدام
- **Cache management** تلقائي مع invalidation
- **TypeScript interfaces** شاملة

#### المميزات:
```typescript
// API Hooks المتاحة
useGetOffersQuery()           // جلب العروض مع فلترة وترقيم
useGetOfferQuery()            // جلب عرض واحد
useGetOfferStatisticsQuery()  // جلب الإحصائيات
useCreateOfferMutation()      // إنشاء عرض جديد
useUpdateOfferMutation()      // تحديث عرض
useDeleteOfferMutation()      // حذف عرض
useToggleOfferAvailabilityMutation() // تبديل التوفر
useGetActiveOffersQuery()     // العروض النشطة (عام)
useRedeemOfferMutation()      // استخدام عرض (عام)
```

### 2. Redux State Management - `src/store/slices/offersSlice.ts`
- **إدارة حالة شاملة** للواجهة
- **إدارة النماذج** مع التحقق من الأخطاء
- **إدارة البحث والفلترة**
- **إدارة التحديد المتعدد**
- **حالات التحميل** المختلفة

#### Actions المتاحة:
```typescript
// UI Actions
openDrawer()
closeDrawer()
showDeleteConfirmation()
hideDeleteConfirmation()

// Form Actions
updateFormField()
setFormErrors()
addProductToForm()
updateProductInForm()
removeProductFromForm()

// Search & Filter Actions
setSearchTerm()
setFilterAvailable()
setSorting()
setCurrentPage()

// Loading Actions
setSubmitting()
setDeleting()
setToggling()
```

### 3. Store Integration - `src/store/index.ts`
- تم إضافة offers API و slice إلى المتجر الرئيسي
- تكوين middleware للـ API caching
- TypeScript types محدثة

### 4. Component Updates - `src/pages/Offers.tsx`
- **إزالة الحالة المحلية** بالكامل
- **استخدام Redux hooks** لجميع العمليات
- **معالجة أخطاء محسنة** مع loading states
- **تحديث تلقائي** للبيانات عبر cache invalidation

## 🎯 المميزات الجديدة:

### 📊 Real-time Data Management
- **Auto-refresh**: البيانات تتحدث تلقائياً عند التغيير
- **Optimistic updates**: تحديثات فورية في الواجهة
- **Error handling**: معالجة أخطاء شاملة مع إعادة المحاولة

### 🔍 Advanced Filtering & Search
- **Server-side filtering**: فلترة على الخادم لأداء أفضل
- **Real-time search**: بحث فوري مع debouncing
- **Pagination**: ترقيم متقدم مع معلومات الصفحات

### 💾 Smart Caching
- **Automatic caching**: تخزين مؤقت ذكي للاستعلامات
- **Cache invalidation**: إلغاء التخزين المؤقت عند التحديث
- **Background refetch**: إعادة جلب في الخلفية

### 🎨 Enhanced UX
- **Loading states**: حالات تحميل للعمليات المختلفة
- **Disabled states**: تعطيل الأزرار أثناء العمليات
- **Progress indicators**: مؤشرات التقدم للعمليات الطويلة

## 📋 كيفية الاستخدام:

### 1. جلب العروض مع الفلترة:
```typescript
const { data, isLoading, error } = useGetOffersQuery({
  page: 1,
  limit: 20,
  search: 'combo',
  isAvailable: true,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### 2. إنشاء عرض جديد:
```typescript
const [createOffer, { isLoading }] = useCreateOfferMutation();

const handleCreate = async () => {
  try {
    await createOffer({
      title: 'عرض خاص',
      price: 25.99,
      products: [
        { productId: 'id1', quantity: 2, unit: 'Number' }
      ]
    }).unwrap();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 3. إدارة حالة النموذج:
```typescript
const dispatch = useDispatch();
const { form, formErrors } = useSelector(state => state.offers);

// تحديث حقل في النموذج
dispatch(updateFormField({ field: 'title', value: 'عنوان جديد' }));

// إضافة منتج للنموذج
dispatch(addProductToForm({
  productId: 'product-id',
  quantity: '2',
  unit: 'Number'
}));
```

## 🔧 API Endpoints المستخدمة:

### Protected Endpoints (تتطلب مصادقة):
- `GET /api/offers` - جلب العروض مع فلترة
- `GET /api/offers/statistics` - الإحصائيات
- `POST /api/offers` - إنشاء عرض
- `PUT /api/offers/:id` - تحديث عرض
- `DELETE /api/offers/:id` - حذف عرض
- `PATCH /api/offers/:id/toggle-availability` - تبديل التوفر

### Public Endpoints (لا تتطلب مصادقة):
- `GET /api/offers/public/restaurant/:restaurantId` - العروض النشطة
- `POST /api/offers/public/:id/redeem` - استخدام عرض

## 🚀 الأداء والتحسينات:

### 1. Server-side Operations:
- **فلترة على الخادم**: تقليل نقل البيانات
- **ترقيم**: تحميل البيانات حسب الحاجة
- **بحث محسن**: استعلامات سريعة

### 2. Client-side Optimization:
- **Memoization**: منع إعادة الرندر غير الضرورية
- **Selective updates**: تحديث الأجزاء المتغيرة فقط
- **Smart caching**: تقليل الطلبات المكررة

### 3. User Experience:
- **Instant feedback**: ردود فعل فورية
- **Progressive loading**: تحميل تدريجي
- **Error recovery**: استرداد من الأخطاء

## 🎉 النتيجة النهائية:

### ✅ ما يعمل الآن:
- **ربط كامل** بين الفرونت إند والباك إند
- **إدارة حالة متقدمة** مع Redux Toolkit
- **أداء محسن** مع caching ذكي
- **تجربة مستخدم ممتازة** مع loading states
- **معالجة أخطاء شاملة** مع recovery
- **TypeScript support** كامل
- **Real-time updates** تلقائية

### 🔄 العمليات المتاحة:
- ✅ عرض قائمة العروض مع إحصائيات
- ✅ البحث والفلترة المتقدمة
- ✅ إنشاء عروض جديدة
- ✅ تعديل العروض الموجودة
- ✅ حذف العروض مع تأكيد
- ✅ تبديل حالة التوفر
- ✅ إدارة المنتجات في العروض
- ✅ تحميل وعرض الصور
- ✅ التحقق من صحة البيانات

النظام جاهز للاستخدام الكامل! 🎊

