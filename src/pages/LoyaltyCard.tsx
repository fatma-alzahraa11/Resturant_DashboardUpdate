import React, { useState, ChangeEvent, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, CheckCircle, XCircle, Gift, Percent, Image as ImageIcon,
  Calendar, Clock, Mail, Star, Trophy, Coins, Target, History, Bell, Users,
  TrendingUp, Award, ShoppingCart, Filter, Search, Download, Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Interfaces for the reward system
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

interface Reward {
  id: number;
  image: string;
  title: string;
  description: string;
  points: number;
  type: 'discount' | 'meal' | 'monetary';
  discountValue: string;
  mealCount: string;
  monetaryValue: string;
  startDate: string;
  endDate: string;
  selectedProducts: string[];
  active: boolean;
  claimed: boolean;
  claimDate?: string;
}

interface RewardHistory {
  id: number;
  rewardId: number;
  rewardTitle: string;
  pointsUsed: number;
  claimDate: string;
  rewardType: string;
  value: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  currentPoints: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  joinDate: string;
  lastVisit: string;
}

// Mock data
const mockProducts: Product[] = [
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
];

const mockRewards: Reward[] = [
  {
    id: 1,
    image: '',
    title: '',
    description: 'Get 1 free meal for 500 points.',
    points: 500,
    type: 'meal',
    mealCount: '1',
    discountValue: '',
    monetaryValue: '',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    selectedProducts: [],
    active: true,
    claimed: false,
  },
  {
    id: 2,
    image: '',
    title: '',
    description: 'Enjoy 10% off for 1000 points.',
    points: 1000,
    type: 'discount',
    mealCount: '',
    discountValue: '10',
    monetaryValue: '',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    selectedProducts: [],
    active: true,
    claimed: false,
  },
  {
    id: 3,
    image: '',
    title: '',
    description: 'Get 2 free meals for 1500 points.',
    points: 1500,
    type: 'meal',
    mealCount: '2',
    discountValue: '',
    monetaryValue: '',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    selectedProducts: [],
    active: false,
    claimed: false,
  },
];

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    currentPoints: 750,
    totalPointsEarned: 1500,
    totalPointsRedeemed: 750,
    joinDate: '2023-06-15',
    lastVisit: '2024-01-15',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    currentPoints: 1200,
    totalPointsEarned: 2000,
    totalPointsRedeemed: 800,
    joinDate: '2023-08-20',
    lastVisit: '2024-01-10',
  },
];

const mockHistory: RewardHistory[] = [
  {
    id: 1,
    rewardId: 1,
    rewardTitle: '',
    pointsUsed: 500,
    claimDate: '2024-01-15',
    rewardType: 'meal',
    value: 'Reward',
  },
  {
    id: 2,
    rewardId: 2,
    rewardTitle: '',
    pointsUsed: 1000,
    claimDate: '2024-01-10',
    rewardType: 'discount',
    value: 'Reward',
  },
  {
    id: 3,
    rewardId: 3,
    rewardTitle: '',
    pointsUsed: 1500,
    claimDate: '2024-01-08',
    rewardType: 'meal',
    value: 'Reward',
  },
  {
    id: 4,
    rewardId: 1,
    rewardTitle: '',
    pointsUsed: 500,
    claimDate: '2024-01-05',
    rewardType: 'meal',
    value: 'Reward',
  },
  {
    id: 5,
    rewardId: 2,
    rewardTitle: '',
    pointsUsed: 1000,
    claimDate: '2024-01-02',
    rewardType: 'discount',
    value: 'Reward',
  },
];

const rewardTypes = {
  meal: { label: 'Free Meal', icon: Gift, color: 'text-green-600' },
  discount: { label: 'Discount', icon: Percent, color: 'text-blue-600' },
  monetary: { label: 'Monetary', icon: Coins, color: 'text-yellow-600' },
};

const initialForm = {
  points: '',
  type: '',
  startDate: '',
  endDate: '',
};

const LoyaltyCard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // State management
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [history, setHistory] = useState<RewardHistory[]>(mockHistory);
  const [products] = useState<Product[]>(mockProducts);
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  // Point conversion state
  const [pointConversion, setPointConversion] = useState({ points: '', monetaryValue: '' });
  const [conversionRate] = useState(10); // 100 points = €10
  const [savedConversions, setSavedConversions] = useState<Array<{id: number, points: string, monetaryValue: string, date: string}>>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  
  // Email notification state
  const [emailModal, setEmailModal] = useState({ open: false, customerId: null as number | null });
  
  // Delete conversion modal state
  const [deleteConversionModal, setDeleteConversionModal] = useState({ open: false, id: null as number | null });

  // Point conversion logic - manual input fields
  const handlePointConversion = (points: string) => {
    setPointConversion(prev => ({ ...prev, points }));
  };

  const handleMonetaryConversion = (monetaryValue: string) => {
    setPointConversion(prev => ({ ...prev, monetaryValue }));
  };

  // Save conversion settings
  const handleSaveConversion = () => {
    if (pointConversion.points && pointConversion.monetaryValue) {
      const newConversion = {
        id: Date.now(),
        points: pointConversion.points,
        monetaryValue: pointConversion.monetaryValue,
        date: new Date().toLocaleDateString()
      };
      setSavedConversions([...savedConversions, newConversion]);
      setPointConversion({ points: '', monetaryValue: '' });
    }
  };

  // Reward management
  const handleActivate = (id: number) => {
    setRewards(rewards.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleDelete = (id: number) => {
    setDeleteModal({ open: true, id });
  };

  const confirmDelete = () => {
    if (deleteModal.id !== null) {
      setRewards(rewards.filter(r => r.id !== deleteModal.id));
    }
    setDeleteModal({ open: false, id: null });
  };

  const cancelDelete = () => {
    setDeleteModal({ open: false, id: null });
  };

  // Form handling
  const handleFormChange = (field: string, value: string | string[]) => {
    setForm({ ...form, [field]: value });
  };





  // Form validation
  const validateForm = () => {
    if (!form.points) {
      setFormError(t('pages.loyaltyCard.formErrorFillAll'));
      return false;
    }
    if (!form.type || form.type.trim() === '') {
      setFormError('Please enter a reward title');
      return false;
    }
    if (!form.startDate || !form.endDate) {
      setFormError(t('pages.loyaltyCard.formErrorDates'));
      return false;
    }
    if (new Date(form.startDate) < new Date()) {
      setFormError(t('pages.loyaltyCard.formErrorStartDate'));
      return false;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setFormError(t('pages.loyaltyCard.formErrorEndDate'));
      return false;
    }
    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const rewardData = {
      image: '',
      title: form.type,
      description: `Reward for ${form.points} ${t('pages.loyaltyCard.points')}.`,
      points: parseInt(form.points),
      type: 'meal' as const,
      mealCount: '',
      discountValue: '',
      monetaryValue: '',
      startDate: form.startDate,
      endDate: form.endDate,
      selectedProducts: [],
      active: true,
      claimed: false,
    };

    if (isEditing && editingId) {
      // Update existing reward
      setRewards(rewards.map(r => 
        r.id === editingId 
          ? { ...r, ...rewardData, id: editingId }
          : r
      ));
    } else {
      // Add new reward
      const newReward: Reward = {
        ...rewardData,
        id: Date.now(),
      };
      setRewards([...rewards, newReward]);
    }

    setForm(initialForm);
    setShowForm(false);
    setFormError('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleOpenForm = () => {
    setForm(initialForm);
    setFormError('');
    setIsEditing(false);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditReward = (reward: Reward) => {
    setForm({
      points: reward.points.toString(),
      type: reward.title,
      startDate: reward.startDate,
      endDate: reward.endDate,
    });
    setFormError('');
    setIsEditing(true);
    setEditingId(reward.id);
    setShowForm(true);
  };

  // Reward claiming
  const handleClaimReward = (rewardId: number, customerId: number) => {
    const reward = rewards.find(r => r.id === rewardId);
    const customer = customers.find(c => c.id === customerId);
    
    if (reward && customer && customer.currentPoints >= reward.points) {
      // Update customer points
      setCustomers(customers.map(c => 
        c.id === customerId 
          ? { 
              ...c, 
              currentPoints: c.currentPoints - reward.points,
              totalPointsRedeemed: c.totalPointsRedeemed + reward.points
            }
          : c
      ));

      // Mark reward as claimed
      setRewards(rewards.map(r => 
        r.id === rewardId 
          ? { ...r, claimed: true, claimDate: new Date().toISOString().split('T')[0] }
          : r
      ));

      // Add to history
      const newHistoryEntry: RewardHistory = {
        id: Date.now(),
        rewardId,
        rewardTitle: reward.title,
        pointsUsed: reward.points,
        claimDate: new Date().toISOString().split('T')[0],
        rewardType: reward.type,
        value: 'Reward',
      };
      setHistory([newHistoryEntry, ...history]);

      // Send email notification
      setEmailModal({ open: true, customerId });
    }
  };

  // Email notification
  const sendEmailNotification = () => {
    // Simulate email sending
    setTimeout(() => {
      setEmailModal({ open: false, customerId: null });
    }, 2000);
  };

  // Delete conversion functions
  const handleDeleteConversion = (id: number) => {
    setDeleteConversionModal({ open: true, id });
  };

  const confirmDeleteConversion = () => {
    if (deleteConversionModal.id !== null) {
      setSavedConversions(savedConversions.filter(c => c.id !== deleteConversionModal.id));
    }
    setDeleteConversionModal({ open: false, id: null });
  };

  const cancelDeleteConversion = () => {
    setDeleteConversionModal({ open: false, id: null });
  };





  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-orange-900 tracking-tight flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-[#E85D04]" />
          {t('pages.loyaltyCard.title')}
        </h1>
        <p className="text-lg text-orange-700 mt-2">{t('pages.loyaltyCard.description')}</p>
      </div>
      


      {/* Point Conversion Calculator */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-8">
        <h2 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-2">
          <Coins className="w-6 h-6" />
          {t('pages.loyaltyCard.pointConversion')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('pages.loyaltyCard.monetaryValue')}</label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={pointConversion.monetaryValue}
              onChange={(e) => handleMonetaryConversion(e.target.value)}
              placeholder={t('pages.loyaltyCard.monetaryValue')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('pages.loyaltyCard.points')}</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={pointConversion.points}
              onChange={(e) => handlePointConversion(e.target.value)}
              placeholder={t('pages.loyaltyCard.points')}
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            {t('pages.loyaltyCard.conversionRate')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSaveConversion}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              {t('common.save')}
            </button>
            <button
              onClick={() => setPointConversion({ points: '', monetaryValue: '' })}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              {t('pages.loyaltyCard.clear')}
            </button>
          </div>
        </div>
      </div>

      {/* Saved Conversions */}
      {savedConversions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-8">
          <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('pages.loyaltyCard.savedConversions')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedConversions.map(conversion => (
              <div key={conversion.id} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{t('pages.loyaltyCard.savedOn')} {conversion.date}</span>
                  <button
                    onClick={() => handleDeleteConversion(conversion.id)}
                    className="text-red-500 hover:text-red-700"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">€{conversion.monetaryValue}</div>
                  <div className="text-sm text-gray-600">=</div>
                  <div className="text-lg font-bold text-orange-900">{conversion.points} {t('pages.loyaltyCard.points')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-extrabold text-orange-900 tracking-tight flex items-center gap-3">
          <Gift className="w-8 h-8 text-[#E85D04]" />
          Reward System
        </h2>
        <button
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform duration-200"
          onClick={handleOpenForm}
        >
          <Plus className="w-5 h-5" />
          Add Reward
        </button>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {rewards.map(reward => {
          const rewardType = rewardTypes[reward.type] || rewardTypes.meal;
          const TypeIcon = rewardType.icon;
          const typeColor = rewardType.color;
          
          return (
            <div key={reward.id} className="bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center relative border-4 border-orange-100 hover:shadow-orange-200 transition group">
              {/* Reward Type Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4">
                <TypeIcon className={`w-10 h-10 ${typeColor}`} />
              </div>
              
              {/* Title */}
              <div className="text-center mb-3">
                <h3 className="text-xl font-bold text-orange-900 mb-1">{reward.title || 'No Title'}</h3>
                <p className="text-gray-600 text-sm">{reward.description}</p>
              </div>
              
              {/* Points Required */}
              <div className="bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white px-6 py-2 rounded-full font-bold text-lg mb-4">
                {reward.points} Points
              </div>
              

              
              {/* Date Range */}
              <div className="text-xs text-gray-500 mb-4 text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Calendar className="w-3 h-3" />
                  <span>Valid: {new Date(reward.startDate).toLocaleDateString()} - {new Date(reward.endDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {reward.active ? (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Active
                  </span>
                ) : (
                  <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Inactive
                  </span>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <button 
                  className="p-2 rounded-full bg-orange-50 hover:bg-orange-100 transition" 
                  title="Edit"
                  onClick={() => handleEditReward(reward)}
                >
                  <Edit2 className="w-5 h-5 text-[#E85D04]" />
                </button>
                <button className="p-2 rounded-full bg-orange-50 hover:bg-orange-100 transition" title="Delete" onClick={() => handleDelete(reward.id)}>
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
                <button
                  className={`p-2 rounded-full transition ${reward.active ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title={reward.active ? 'Deactivate' : 'Activate'}
                  onClick={() => handleActivate(reward.id)}
                >
                  {reward.active ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Food theme accent */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-[#F48C06] to-[#E85D04] w-16 h-16 rounded-full opacity-10 group-hover:opacity-20 transition-all duration-300" />
            </div>
          );
        })}
      </div>

      {/* Customer Management */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-8">
        <h2 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Customer Management
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Current Points</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Earned</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#E85D04] to-[#F48C06] rounded-full flex items-center justify-center text-white font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">Joined {new Date(customer.joinDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{customer.email}</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {customer.currentPoints} pts
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{customer.totalPointsEarned} pts</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {rewards.filter(r => r.active && !r.claimed && customer.currentPoints >= r.points).map(reward => (
                        <button
                          key={reward.id}
                          className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold hover:bg-blue-600 transition"
                          onClick={() => handleClaimReward(reward.id, customer.id)}
                        >
                          {t('pages.loyaltyCard.claimReward')} {reward.type}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reward History */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-orange-900 flex items-center gap-2">
            <History className="w-6 h-6" />
            Reward History
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone/WhatsApp</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Points</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-900">Ahmed Hassan</td>
                <td className="py-3 px-4 text-gray-700">ahmed@example.com</td>
                <td className="py-3 px-4 text-gray-700">+971 50 123 4567</td>
                <td className="py-3 px-4 text-gray-700">750 pts</td>
                <td className="py-3 px-4 text-gray-700">2024-01-15</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-900">Sarah Johnson</td>
                <td className="py-3 px-4 text-gray-700">sarah@example.com</td>
                <td className="py-3 px-4 text-gray-700">+971 55 987 6543</td>
                <td className="py-3 px-4 text-gray-700">1200 pts</td>
                <td className="py-3 px-4 text-gray-700">2024-01-10</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-900">Mohammed Ali</td>
                <td className="py-3 px-4 text-gray-700">mohammed@example.com</td>
                <td className="py-3 px-4 text-gray-700">+971 52 456 7890</td>
                <td className="py-3 px-4 text-gray-700">950 pts</td>
                <td className="py-3 px-4 text-gray-700">2024-01-08</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-900">Fatima Ahmed</td>
                <td className="py-3 px-4 text-gray-700">fatima@example.com</td>
                <td className="py-3 px-4 text-gray-700">+971 54 321 0987</td>
                <td className="py-3 px-4 text-gray-700">1800 pts</td>
                <td className="py-3 px-4 text-gray-700">2024-01-05</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-900">Omar Khalil</td>
                <td className="py-3 px-4 text-gray-700">omar@example.com</td>
                <td className="py-3 px-4 text-gray-700">+971 56 789 0123</td>
                <td className="py-3 px-4 text-gray-700">650 pts</td>
                <td className="py-3 px-4 text-gray-700">2024-01-02</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Reward Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl space-y-6 relative animate-fade-in-up overflow-y-auto"
            style={{ minWidth: 400, maxHeight: '90vh' }}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => { setShowForm(false); setFormError(''); }}
              title="Close"
            >
              <XCircle className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-[#E85D04] mb-2 text-center flex items-center gap-2 justify-center">
              {isEditing ? (
                <>
                  <Edit2 className="w-6 h-6" /> Edit Reward
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6" /> Add New Reward
                </>
              )}
            </h2>
            
            {formError && <div className="text-red-600 text-center font-bold mb-2">{formError}</div>}
            

            
            
            
            {/* Points & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1">Required Points</label>
                <input 
                  type="number" 
                  min="1" 
                  className="w-full border rounded px-3 py-2" 
                  value={form.points} 
                  onChange={e => handleFormChange('points', e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Reward Title</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.type}
                  onChange={e => handleFormChange('type', e.target.value)}
                  placeholder="Reward Title"
                />
              </div>
            </div>
            
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1">Start Date</label>
                <input 
                  type="date" 
                  className="w-full border rounded px-3 py-2" 
                  value={form.startDate} 
                  onChange={e => handleFormChange('startDate', e.target.value)} 
                  min={new Date().toISOString().split('T')[0]}
                  required 
                  />
                </div>
              <div>
                <label className="block font-bold mb-1">End Date</label>
                  <input
                  type="date" 
                  className="w-full border rounded px-3 py-2" 
                  value={form.endDate} 
                  onChange={e => handleFormChange('endDate', e.target.value)} 
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                  required 
                  />
                </div>
            </div>
            
            <button
              type="submit"
              className="w-full min-h-12 mt-8 text-lg font-bold bg-gradient-to-r from-[#E85D04] to-[#F48C06] text-white rounded-full shadow-2xl hover:scale-105 transition-transform duration-200 z-10"
            >
              {isEditing ? 'Update Reward' : 'Add Reward'}
            </button>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm space-y-6 relative animate-fade-in-up text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-red-100 rounded-full p-4 mb-2">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-700 mb-2">Delete Reward</h2>
              <div className="text-gray-700 mb-4">Are you sure you want to delete this reward? This action cannot be undone.</div>
              <div className="flex gap-4 justify-center mt-4">
                <button onClick={cancelDelete} className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-bold">Cancel</button>
                <button onClick={confirmDelete} className="px-6 py-2 rounded-full bg-red-600 text-white font-bold shadow hover:bg-red-700 transition">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Notification Modal */}
      {emailModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6 relative animate-fade-in-up text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-green-100 rounded-full p-4 mb-2">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">Email Notification</h2>
              <div className="text-gray-700 mb-4">Sending confirmation email to customer...</div>
              <div className="flex gap-4 justify-center mt-4">
                <button 
                  onClick={sendEmailNotification} 
                  className="px-6 py-2 rounded-full bg-green-600 text-white font-bold shadow hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Email
                </button>
                <button 
                  onClick={() => setEmailModal({ open: false, customerId: null })} 
                  className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Conversion Confirmation Modal */}
      {deleteConversionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm space-y-6 relative animate-fade-in-up text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-red-100 rounded-full p-4 mb-2">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-700 mb-2">
                {isRTL ? 'حذف تحويل النقاط' : 'Delete Point Conversion'}
              </h2>
              <div className="text-gray-700 mb-4">
                {isRTL 
                  ? 'هل أنت متأكد من حذف هذا التحويل؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to delete this conversion? This action cannot be undone.'
                }
              </div>
              <div className="flex gap-4 justify-center mt-4">
                <button 
                  onClick={cancelDeleteConversion} 
                  className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-bold"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  onClick={confirmDeleteConversion} 
                  className="px-6 py-2 rounded-full bg-red-600 text-white font-bold shadow hover:bg-red-700 transition"
                >
                  {isRTL ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyCard;