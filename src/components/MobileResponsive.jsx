import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export const MobileNav = ({ tabs, activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        >
          {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-4">
            <div className="grid grid-cols-3 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTablet, isDesktop };
};
