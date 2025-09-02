import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile overlay

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRTL]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50 ${isRTL ? 'rtl' : 'ltr'} flex flex-col`}>
      <Header 
        collapsed={collapsed} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        {/* Overlay background for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/40 md:hidden animate-fade-in" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`flex-1 min-w-0 mt-16 p-4 md:p-6 transition-all duration-300
            hidden md:block
            ${isRTL
              ? (collapsed ? 'md:mr-20' : 'md:mr-64')
              : (collapsed ? 'md:ml-20' : 'md:ml-64')
            }
          `}
        >
          {children}
        </div>
        {/* للموبايل: main بدون هامش */}
        <main className="flex-1 min-w-0 mt-16 p-4 md:p-6 transition-all duration-300 md:hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;