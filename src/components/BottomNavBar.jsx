import { motion } from 'framer-motion';

const BottomNavBar = ({ tabs, activeTab, setActiveTab }) => {
  // Only show first 5 tabs in bottom nav
  const bottomTabs = tabs.slice(0, 5);

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
      <div className="grid grid-cols-5">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-2 px-1"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-colors ${
                    isActive 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} 
                />
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"
                  />
                )}
              </div>
              <span 
                className={`text-xxs mt-1 transition-colors ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400 font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;
