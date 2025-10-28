import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiHome } from 'react-icons/fi';

const MobileNavigation = ({ tabs, activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="grid grid-cols-5 gap-0">
          {tabs.slice(0, 4).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-1 transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xxs">{tab.label}</span>
              </button>
            );
          })}
          
          {/* More button for remaining tabs */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col items-center py-2 px-1 text-gray-600 dark:text-gray-400"
          >
            {isOpen ? <FiX className="w-5 h-5 mb-1" /> : <FiMenu className="w-5 h-5 mb-1" />}
            <span className="text-xxs">More</span>
          </button>
        </div>
      </div>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sm:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="sm:hidden fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl z-40 p-4"
            >
              <div className="grid grid-cols-3 gap-3">
                {tabs.slice(4).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsOpen(false);
                      }}
                      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      <span className="text-xs">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add padding to main content to account for bottom nav */}
      <style jsx global>{`
        @media (max-width: 640px) {
          main {
            padding-bottom: 4rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default MobileNavigation;
