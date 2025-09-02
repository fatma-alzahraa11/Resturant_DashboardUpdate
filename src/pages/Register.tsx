import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegisterOwnerMutation } from '../store/services/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { extractApiError } from '../utils/apiError';

// Base URL is configured in RTK Query baseQuery

const Register: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  // Restaurant owner registration fields expected by backend
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisine, setCuisine] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch();
  const [registerOwner] = useRegisterOwnerMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const data = await registerOwner({
        firstName,
        lastName,
        email,
        password,
        phone,
        restaurantName,
        cuisine,
      }).unwrap();

      // After registering, redirect to login and show restaurant code
      const restaurantCode = data?.restaurant?.restaurantCode;
      navigate('/login', { state: { restaurantCode, registeredEmail: email } });
    } catch (error: unknown) {
      const parsed = extractApiError(error);
      setErrorMessage(parsed.message || 'Registration failed');
      setFieldErrors(parsed.fieldErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003049] via-[#003049] to-primary-900 p-4 text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="w-full max-w-md bg-white/10 rounded-2xl shadow-strong p-6 border border-white/15">
        <h1 className="text-2xl font-extrabold mb-2 text-center">{t('auth.register')}</h1>
        <p className="text-white/80 text-center mb-6">{t('auth.createAccount')}</p>
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-500/20 text-red-200 border border-red-500/30 px-4 py-2 text-sm">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 placeholder-white/70 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="John"
                required
              />
            </div>
            {fieldErrors.firstName && (
              <p className="mt-1 text-xs text-red-200">{fieldErrors.firstName}</p>
            )}
            <div>
              <label className="block mb-1 text-sm">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 placeholder-white/70 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Doe"
                required
              />
              {fieldErrors.lastName && (
                <p className="mt-1 text-xs text-red-200">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 placeholder-white/70 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder={t('auth.emailPlaceholder') || 'you@example.com'}
              required
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-200">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 placeholder-white/70 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder={t('auth.passwordPlaceholder') || '••••••••'}
              required
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-200">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 placeholder-white/70 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="+1234567890"
              required
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-xs text-red-200">{fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm">Restaurant Name</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 placeholder-white/70 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Sample Restaurant"
              required
            />
            {fieldErrors.restaurantName && (
              <p className="mt-1 text-xs text-red-200">{fieldErrors.restaurantName}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm">Cuisine</label>
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 placeholder-white/70 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Italian / Arabic / ..."
              required
            />
            {fieldErrors.cuisine && (
              <p className="mt-1 text-xs text-red-200">{fieldErrors.cuisine}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-hover-effect px-6 py-3 rounded-xl bg-primary-400 hover:bg-primary-300 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold"
          >
            {isSubmitting ? 'Registering...' : t('auth.register')}
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-white/85">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-primary-200 hover:text-primary-100">
            {t('auth.signIn')}
          </Link>
        </div>
        <div className="text-center mt-2">
          <Link to="/dashboard" className="text-xs text-white/70 hover:text-white">{t('auth.backToDashboard')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;


