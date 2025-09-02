import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Package, Percent, QrCode, Gift, Monitor, Building2, Globe, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: t('common.english'), flag: '🇺🇸' },
    { code: 'ar', name: t('common.arabic'), flag: '🇸🇦' },
    { code: 'de', name: t('common.german'), flag: '🇩🇪' },
  ];

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRTL]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = languageCode;
    localStorage.setItem('appLanguage', languageCode);
  };

  const features = [
    { icon: Package, title: t('landing.features.products.title'), desc: t('landing.features.products.desc') },
    { icon: Percent, title: t('landing.features.discounts.title'), desc: t('landing.features.discounts.desc') },
    { icon: Gift, title: t('landing.features.offers.title'), desc: t('landing.features.offers.desc') },
    { icon: QrCode, title: t('landing.features.qr.title'), desc: t('landing.features.qr.desc') },
    { icon: Monitor, title: t('landing.features.display.title'), desc: t('landing.features.display.desc') },
    { icon: Building2, title: t('landing.features.superAdmin.title'), desc: t('landing.features.superAdmin.desc') },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#003049] via-[#003049] to-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between pt-6">
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shadow-soft">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <h1 className="text-xl font-extrabold tracking-tight">Restaurant Admin</h1>
              <p className="text-white/80 text-sm">{t('landing.branding')}</p>
            </div>
          </div>
          <div className={`flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-white/85 hover:text-white transition-colors">{t('landing.nav.about')}</a>
              <a href="#services" className="text-white/85 hover:text-white transition-colors">{t('landing.nav.services')}</a>
              <a href="#contact" className="text-white/85 hover:text-white transition-colors">{t('landing.nav.contact')}</a>
            </nav>
            {/* Register button in navbar */}
            <button
              onClick={() => navigate('/register')}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-primary-900 font-semibold shadow-soft hover:bg-white/90"
            >
              {t('auth.register')}
            </button>
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">{t('common.language')}</span>
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-strong p-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setLangMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 ${i18n.language === lang.code ? 'bg-gray-100 font-semibold' : ''}`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="pt-16 pb-24">
          <div className={`grid lg:grid-cols-2 gap-10 items-center ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-semibold tracking-wider">
                  {t('landing.badge')}
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                {t('landing.title')}
              </h2>
              <p className="text-white/90 text-lg">
                {t('landing.subtitle')}
              </p>
              <div className={`flex flex-wrap items-center gap-4 ${isRTL ? 'justify-end' : ''}`}>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-hover-effect inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-400 hover:bg-primary-300 text-white font-semibold shadow-medium"
                >
                  <span>{t('landing.ctaPrimary')}</span>
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium"
                >
                  {t('landing.ctaSecondary')}
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-xl bg-white/10">
                  <div className="text-2xl font-extrabold">24/7</div>
                  <div className="text-sm text-white/80">{t('landing.stats.uptime')}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/10">
                  <div className="text-2xl font-extrabold">3x</div>
                  <div className="text-sm text-white/80">{t('landing.stats.fasterOps')}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/10">
                  <div className="text-2xl font-extrabold">100%</div>
                  <div className="text-sm text-white/80">{t('landing.stats.rtlLtr')}</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-strong ring-1 ring-white/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/10" />
                <img
                  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2070&auto=format&fit=crop"
                  alt="Restaurant dashboard preview"
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className={`grid grid-cols-3 gap-4 mt-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                {features.slice(0, 3).map((f, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                    <f.icon className="w-6 h-6 mb-2 text-white" />
                    <div className="font-semibold">{f.title}</div>
                    <div className="text-sm text-white/80">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section id="features" className="mt-20">
            <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-5 ${isRTL ? 'text-right' : 'text-left'}`}>
              {features.map((f, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors shadow-soft">
                  <f.icon className="w-7 h-7 mb-3 text-white" />
                  <div className="font-bold text-lg">{f.title}</div>
                  <div className="text-sm text-white/85">{f.desc}</div>
                </div>
              ))}
            </div>
          </section>
          <section id="about" className={`${'mt-24'} ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="text-3xl font-extrabold mb-4">{t('landing.about.title')}</h3>
            <p className="text-white/90 max-w-3xl">{t('landing.about.desc')}</p>
          </section>

          <section id="services" className={`${'mt-16'} ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="text-3xl font-extrabold mb-6">{t('landing.services.title')}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white/10 hover:bg-white/15 transition-all product-card-hover">
                  <f.icon className="w-7 h-7 mb-3 text-primary-400" />
                  <div className="font-bold text-lg">{f.title}</div>
                  <div className="text-sm text-white/85">{f.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="contact" className={`${'mt-16'} ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="text-3xl font-extrabold mb-6">{t('landing.contact.title')}</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-1 text-[#FF6A00]" />
                  <div>
                    <div className="font-semibold">{t('landing.contact.phone')}</div>
                    <div className="text-white/85">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-1 text-[#FF6A00]" />
                  <div>
                    <div className="font-semibold">{t('landing.contact.email')}</div>
                    <div className="text-white/85">support@example.com</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 text-[#FF6A00]" />
                  <div>
                    <div className="font-semibold">{t('landing.contact.address')}</div>
                    <div className="text-white/85">123 Main Street, City, Country</div>
                  </div>
                </div>
              </div>
              <form className="space-y-4">
                <div>
                  <input type="text" placeholder={t('landing.contact.form.namePlaceholder') || 'Your Name'} className="w-full px-4 py-3 rounded-xl bg-white/10 placeholder-white/70 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]" />
                </div>
                <div>
                  <input type="email" placeholder={t('landing.contact.form.emailPlaceholder') || 'Your Email'} className="w-full px-4 py-3 rounded-xl bg-white/10 placeholder-white/70 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]" />
                </div>
                <div>
                  <textarea placeholder={t('landing.contact.form.messagePlaceholder') || 'Message'} className="w-full px-4 py-3 rounded-xl bg-white/10 placeholder-white/70 text-white border border-white/20 h-28 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]" />
                </div>
                <button type="button" onClick={() => navigate('/dashboard')} className="btn-hover-effect px-6 py-3 rounded-xl bg-primary-400 hover:bg-primary-300 text-white font-semibold">
                  {t('landing.contact.form.send')}
                </button>
              </form>
            </div>
          </section>
        </main>
        <footer className="py-8 text-center text-white/80 text-sm">
          {t('landing.footer')}
        </footer>
      </div>
    </div>
  );
};

export default Landing;


