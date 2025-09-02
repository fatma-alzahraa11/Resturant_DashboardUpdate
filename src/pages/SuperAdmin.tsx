import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Users, 
  TrendingUp, 
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  rating: number;
  totalOrders: number;
  monthlyRevenue: number;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  image: string;
  cuisine: string;
  deliveryRadius: number;
}

const SuperAdmin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDeleteRestaurantDialog, setShowDeleteRestaurantDialog] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);

  // Sample restaurant data
  const [restaurants, setRestaurants] = useState<Restaurant[]>([
    {
      id: '1',
      name: 'Middle East Restaurant',
      owner: 'Ahmed Mohamed',
      email: 'ahmed@restaurant.com',
      phone: '+966 50 123 4567',
      address: 'King Fahd Street, Riyadh',
      city: 'Riyadh',
      rating: 4.8,
      totalOrders: 1250,
      monthlyRevenue: 45000,
      status: 'active',
      joinDate: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      cuisine: 'Middle Eastern',
      deliveryRadius: 5
    },
    {
      id: '2',
      name: 'Pizza Palace',
      owner: 'Sarah Johnson',
      email: 'sarah@pizzapalace.com',
      phone: '+966 55 987 6543',
      address: 'King Abdullah Road, Jeddah',
      city: 'Jeddah',
      rating: 4.6,
      totalOrders: 890,
      monthlyRevenue: 32000,
      status: 'active',
      joinDate: '2024-02-20',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      cuisine: 'Italian',
      deliveryRadius: 4
    },
    {
      id: '3',
      name: 'Burger House',
      owner: 'Mohamed Ali',
      email: 'mohamed@burgerhouse.com',
      phone: '+966 54 456 7890',
      address: 'Tahlia Street, Dammam',
      city: 'Dammam',
      rating: 4.4,
      totalOrders: 650,
      monthlyRevenue: 28000,
      status: 'pending',
      joinDate: '2024-03-10',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
      cuisine: 'Fast Food',
      deliveryRadius: 3
    },
    {
      id: '4',
      name: 'Sushi Master',
      owner: 'Yuki Tanaka',
      email: 'yuki@sushimaster.com',
      phone: '+966 56 789 0123',
      address: 'Olaya Street, Riyadh',
      city: 'Riyadh',
      rating: 4.9,
      totalOrders: 2100,
      monthlyRevenue: 68000,
      status: 'active',
      joinDate: '2023-12-05',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
      cuisine: 'Japanese',
      deliveryRadius: 6
    },
    {
      id: '5',
      name: 'Café Central',
      owner: 'Fatima Al-Zahra',
      email: 'fatima@cafecentral.com',
      phone: '+966 57 321 0987',
      address: 'Olaya Street, Riyadh',
      city: 'Riyadh',
      rating: 4.7,
      totalOrders: 1800,
      monthlyRevenue: 52000,
      status: 'active',
      joinDate: '2024-01-08',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
      cuisine: 'Café',
      deliveryRadius: 4
    },
    {
      id: '6',
      name: 'Seafood Paradise',
      owner: 'Abdullah Al-Bahr',
      email: 'abdullah@seafood.com',
      phone: '+966 58 654 3210',
      address: 'Corniche Road, Jeddah',
      city: 'Jeddah',
      rating: 4.5,
      totalOrders: 750,
      monthlyRevenue: 35000,
      status: 'suspended',
      joinDate: '2024-02-15',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      cuisine: 'Seafood',
      deliveryRadius: 5
    }
  ]);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Handler for deleting restaurants
  const handleDeleteRestaurant = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant);
    setShowDeleteRestaurantDialog(true);
  };

  const handleConfirmDeleteRestaurant = () => {
    if (restaurantToDelete) {
      setRestaurants(prev => prev.filter(restaurant => restaurant.id !== restaurantToDelete.id));
      setShowDeleteRestaurantDialog(false);
      setRestaurantToDelete(null);
    }
  };

  const handleCancelDeleteRestaurant = () => {
    setShowDeleteRestaurantDialog(false);
    setRestaurantToDelete(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className={`flex items-center space-x-4 mb-6 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className="p-3 bg-primary-100 rounded-xl">
            <Building2 className="w-8 h-8 text-primary-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">
              {t('superAdmin.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('superAdmin.description')}
            </p>
          </div>
        </div>

        {/* Total Restaurants Card */}
        <div className="mb-8">
          <div className="bg-[#E85D04] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-8 h-8" />
              <span className="text-2xl font-bold">{restaurants.length}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{t('superAdmin.totalRestaurants')}</h3>
            <p className="text-sm text-white/80">{t('superAdmin.totalRestaurantsDesc')}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${
              isRTL ? 'right-3' : 'left-3'
            }`} />
            <input
              type="text"
              placeholder={t('superAdmin.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                isRTL ? 'text-right pr-10 pl-4' : 'text-left'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
            {/* Restaurant Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Rating */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-800">{restaurant.rating}</span>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</p>
                </div>
              </div>

              {/* Owner Info */}
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{restaurant.owner}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{restaurant.city}</span>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{restaurant.phone}</span>
              </div>

              {/* Delete Action */}
              <div className="flex justify-end">
                <button 
                  onClick={() => handleDeleteRestaurant(restaurant)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('superAdmin.noRestaurants')}</h3>
          <p className="text-gray-500">{t('superAdmin.noRestaurantsDesc')}</p>
        </div>
      )}

      {/* Delete Restaurant Confirmation Dialog */}
      {showDeleteRestaurantDialog && restaurantToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('superAdmin.deleteRestaurantTitle')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('superAdmin.confirmDeleteRestaurant', { name: restaurantToDelete.name })}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDeleteRestaurant}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleConfirmDeleteRestaurant}
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

export default SuperAdmin; 