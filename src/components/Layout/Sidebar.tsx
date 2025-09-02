import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  Home,
  CreditCard,
  Percent,
  Package,
  QrCode,
  Gift,
  Monitor,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  LogOut
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, sidebarOpen, setSidebarOpen }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    // Ensure page starts at the top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
  };

  const navigationItems = [
    { to: '/dashboard', icon: Home, label: t('nav.home') },
    { to: '/product-list', icon: Package, label: t('nav.productList') },
    { to: '/discounts', icon: Percent, label: t('nav.discounts') },
    { to: '/offers', icon: Gift, label: t('nav.offers') },
    { to: '/loyalty-card', icon: CreditCard, label: t('nav.loyaltyCard') },
    { to: '/qr-printing', icon: QrCode, label: t('nav.qrPrinting') },
    { to: '/admin/display-screen', icon: Monitor, label: t('nav.displayScreen') },
    { to: '/super-admin', icon: Building2, label: t('nav.superAdmin') },
  ];

  // Sidebar classes for desktop
  const sidebarDesktop = `${collapsed ? 'w-20' : 'w-64'} h-screen fixed top-0 ${isRTL ? 'right-0' : 'left-0'} bg-[#003049] text-white shadow-2xl z-50 transition-all duration-300 hidden md:block`;

  // Sidebar classes for mobile overlay
  const sidebarMobile = `fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-64 bg-[#003049] text-white shadow-2xl z-40 transition-transform duration-300 md:hidden`;

  return (
    <>
      {/* Desktop sidebar */}
      <div className={sidebarDesktop} style={isRTL ? {right: 0, left: 'auto'} : {left: 0, right: 'auto'}}>
        {/* Toggle Arrow Button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`absolute top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110
            ${isRTL 
              ? collapsed ? 'left-20' : 'left-64' 
              : collapsed ? 'left-20' : 'left-64'
            }
          `}
          style={isRTL 
            ? { right: collapsed ? '80px' : '256px', left: 'auto', transform: 'translateY(-50%) translateX(50%)', transition: 'all 0.3s ease' }
            : { left: collapsed ? '80px' : '256px', right: 'auto', transform: 'translateY(-50%) translateX(-50%)', transition: 'all 0.3s ease' }
          }
        >
          {isRTL ? (
            collapsed ? (
              <ChevronLeft className="w-4 h-4 text-[#003049]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#003049]" />
            )
          ) : (
            collapsed ? (
              <ChevronRight className="w-4 h-4 text-[#003049]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#003049]" />
            )
          )}
        </button>
        <div className="p-4 border-b border-primary-700 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCollapsed((c) => !c)}>
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-primary-900" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-primary-100">Restaurant</h1>
                <p className="text-sm text-primary-300">Admin Dashboard</p>
              </div>
            )}
          </div>
        </div>
        <nav className="mt-8">
          <div className="px-2 space-y-2 flex flex-col h-full">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={(nav) =>
                  `flex items-center px-2 py-3 rounded-xl transition-all duration-200 group gap-3 ${
                    nav && nav.isActive
                      ? 'bg-primary-100 text-primary-900 shadow-lg'
                      : 'text-primary-200 hover:bg-[rgba(0,0,0,0.2)] hover:text-primary-100'
                  } ${isRTL ? 'flex-row-reverse justify-end text-right' : ''}`
                }
              >
                {isRTL ? (
                  <>
                    {!collapsed && <span className="font-medium whitespace-nowrap text-right">{item.label}</span>}
                    <item.icon className="transition-all w-6 h-6" />
                  </>
                ) : (
                  <>
                    <item.icon className="transition-all w-6 h-6" />
                    {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-2 py-3 rounded-xl transition-all duration-200 gap-3 mt-auto text-left ${
                'text-primary-200 hover:bg-[rgba(0,0,0,0.2)] hover:text-primary-100'
              } ${isRTL ? 'flex-row-reverse justify-end text-right' : ''}`}
            >
              {isRTL ? (
                <>
                  {!collapsed && <span className="font-medium whitespace-nowrap text-right">Log out</span>}
                  <LogOut className="transition-all w-6 h-6" />
                </>
              ) : (
                <>
                  <LogOut className="transition-all w-6 h-6" />
                  {!collapsed && <span className="font-medium whitespace-nowrap">Log out</span>}
                </>
              )}
            </button>
          </div>
        </nav>
      </div>
      {/* Mobile sidebar overlay - only render when sidebarOpen is true */}
      {sidebarOpen && (
        <div className={sidebarMobile + ' ' + (isRTL ? 'translate-x-0' : 'translate-x-0')} style={isRTL ? {right: 0, left: 'auto'} : {left: 0, right: 'auto'}}>
          <div className="flex items-center justify-between p-4 border-b border-primary-700">
            <div className="flex items-center gap-3 select-none">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-primary-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-100">Restaurant</h1>
                <p className="text-sm text-primary-300">Admin Dashboard</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 rounded-full hover:bg-primary-900/20 transition-colors">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <nav className="mt-8">
            <div className="px-2 space-y-2 flex flex-col h-full">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={(nav) =>
                    `flex items-center px-2 py-3 rounded-xl transition-all duration-200 group ${
                      nav && nav.isActive
                        ? 'bg-primary-100 text-primary-900 shadow-lg'
                        : 'text-primary-200 hover:bg-[rgba(0,0,0,0.2)] hover:text-primary-100'
                    } ${isRTL ? 'flex-row-reverse text-right' : ''}`
                  }
                >
                  <item.icon className={`transition-all w-6 h-6 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={() => { setSidebarOpen(false); handleLogout(); }}
                className={`w-full flex items-center px-2 py-3 rounded-xl transition-all duration-200 mt-auto ${
                  'text-primary-200 hover:bg-[rgba(0,0,0,0.2)] hover:text-primary-100'
                } ${isRTL ? 'flex-row-reverse text-right' : ''}`}
              >
                <LogOut className={`transition-all w-6 h-6 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Sidebar;