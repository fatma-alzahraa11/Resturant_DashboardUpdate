import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../store/services/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { extractApiError } from '../utils/apiError';

const Login: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const isRTL = i18n.language === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { restaurantCode, registeredEmail } = useMemo(() => ({
    restaurantCode: location?.state?.restaurantCode as string | undefined,
    registeredEmail: location?.state?.registeredEmail as string | undefined,
  }), [location?.state]);

  useEffect(() => {
    if (registeredEmail && !email) {
      setEmail(registeredEmail);
    }
  }, [registeredEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    try {
      const data = await login({ email, password }).unwrap();
      if (data?.token && data?.user) {
        dispatch(setCredentials({ token: data.token, user: data.user }));
      }
      navigate('/dashboard');
    } catch (error: unknown) {
      const parsed = extractApiError(error);
      // Single concise message; if backend indicates wrong password, show it
      setErrorMessage(parsed.message || 'Login failed');
      setFieldErrors(parsed.fieldErrors || {});
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003049] via-[#003049] to-primary-900 p-4 text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="w-full max-w-md bg-white/10 rounded-2xl shadow-strong p-6 border border-white/15">
        <h1 className="text-2xl font-extrabold mb-2 text-center">{t('auth.signIn')}</h1>
        <p className="text-white/80 text-center mb-6">{t('auth.welcomeBack')}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {restaurantCode && (
            <div className="rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-4 py-2 text-sm">
              {(t('auth.yourRestaurantCode') as string) || 'Your restaurant code'}: <span className="font-mono">{restaurantCode}</span>
            </div>
          )}
          {errorMessage && (
            <div className="rounded-lg bg-red-500/20 text-red-200 border border-red-500/30 px-4 py-2 text-sm">
              {errorMessage}
            </div>
          )}
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-xl bg-white/10 placeholder-white/70 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder={t('auth.passwordPlaceholder') || '••••••••'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={`absolute inset-y-0 flex items-center ${isRTL ? 'left-3' : 'right-3'} text-white/80 hover:text-white`}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? (t('auth.hide') || 'Hide password') : (t('auth.show') || 'Show password')}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.4 18.4 0 0 1 5.06-6.94"/>
                    <path d="M1 1l22 22"/>
                    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.34 18.34 0 0 1-3.22 4.88"/>
                    <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88"/>
                  </svg>
                ) : (
                  // Eye icon
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-200">{fieldErrors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-hover-effect px-6 py-3 rounded-xl bg-primary-400 hover:bg-primary-300 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold"
          >
            {isLoading ? 'Signing in...' : t('auth.signIn')}
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-white/85">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-primary-200 hover:text-primary-100">
            {t('auth.register')}
          </Link>
        </div>
        <div className="text-center mt-2">
          <Link to="/dashboard" className="text-xs text-white/70 hover:text-white">{t('auth.backToDashboard')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;


