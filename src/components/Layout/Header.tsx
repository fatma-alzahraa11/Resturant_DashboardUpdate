import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Menu, User } from 'lucide-react';

interface HeaderProps {
  collapsed: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ collapsed, sidebarOpen, setSidebarOpen }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  // اسم المستخدم التجريبي
  const userName = 'Fadi';

  const languages = [
    { code: 'en', name: t('common.english'), flag: '🇺🇸' },
    { code: 'ar', name: t('common.arabic'), flag: '🇸🇦' },
    { code: 'de', name: t('common.german'), flag: '🇩🇪' },
  ];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = languageCode;
    localStorage.setItem('appLanguage', languageCode); // حفظ اللغة المختارة
  };

  // إغلاق القوائم عند الضغط خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 w-full h-16 bg-white shadow-lg z-50">
      <div className="flex items-center h-full px-4 md:px-6 w-full">
        {/* زر القائمة للموبايل على الشمال دائمًا */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-primary-100 transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label={t('nav.openMenu') || 'Open menu'}
        >
          <Menu className="w-7 h-7 text-primary-900" />
        </button>
        {/* Spacer لملء الفراغ */}
        <div className="flex-1" />
        {/* مجموعة أيقونة اللغة وأيقونة اليوزر */}
        <div className="flex items-center gap-2">
          {/* زر اللغة */}
          <div className="relative" ref={langMenuRef}>
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-900 rounded-xl hover:bg-primary-100 transition-colors duration-200"
              onClick={() => setLangMenuOpen((open) => !open)}
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">{t('common.language')}</span>
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { changeLanguage(lang.code); setLangMenuOpen(false); }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-primary-50 transition-colors duration-200 ${
                      i18n.language === lang.code ? 'bg-primary-100 text-primary-900' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium text-sm">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* أيقونة اليوزر مع قائمة ترحيب */}
          <div className="relative" ref={userMenuRef}>
            <button
              className="p-2 rounded-full bg-primary-100 ring-2 ring-primary-500 transition-colors"
              onClick={() => setUserMenuOpen((open) => !open)}
            >
              <User className="w-6 h-6 text-primary-900" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
                <div className="text-primary-900 font-bold text-lg mb-1">{t('common.welcome')}, {userName}!</div>
                <div className="text-gray-600 text-sm">{t('common.haveANiceDay') || 'Have a nice day!'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;