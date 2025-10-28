import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiCheckSquare, FiFileText, FiTarget, 
  FiBook, FiDollarSign, FiMoreHorizontal,
  FiTrendingUp, FiTrendingDown, FiPieChart,
  FiCreditCard, FiActivity, FiCalendar
} from 'react-icons/fi';
import { format } from 'date-fns';
import MobileFinanceView from './MobileFinanceView';

const MobileLayout = ({ 
  activeTab, 
  setActiveTab, 
  tabs, 
  children,
  stats,
  user 
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Get current tab info
  const currentTab = tabs.find(tab => tab.id === activeTab);
  const Icon = currentTab?.icon || FiHome;
  
  // Icon navigation items (6 main icons like in the screenshot)
  const iconNavItems = [
    { id: 'stats', icon: FiHome, label: 'Home' },
    { id: 'todos', icon: FiCheckSquare, label: 'Tasks' },
    { id: 'notes', icon: FiFileText, label: 'Notes' },
    { id: 'habits', icon: FiTarget, label: 'Habits' },
    { id: 'recipes', icon: FiBook, label: 'Recipes' },
    { id: 'finance', icon: FiDollarSign, label: 'Finance' },
  ];

  // Mobile stat cards with gradient backgrounds
  const MobileStatCard = ({ title, value, subtitle, gradient, icon: CardIcon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl p-5 ${gradient} text-white shadow-lg`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-3xl font-bold mb-1">{value}</h3>
          {subtitle && (
            <p className="text-white/70 text-xs">{subtitle}</p>
          )}
        </div>
        {CardIcon && (
          <div className="opacity-30">
            <CardIcon className="w-16 h-16" />
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="sm:hidden min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 z-40 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {currentTab?.label || 'Dashboard'}
              </h1>
              {activeTab === 'finance' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">₹ INR</p>
              )}
            </div>
          </div>
          
          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            {activeTab === 'stats' && (
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiCalendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiMoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Icon Navigation Bar */}
        <div className="px-4 pb-3">
          <div className="flex justify-around bg-gray-100 dark:bg-gray-700/50 rounded-2xl p-2">
            {iconNavItems.map((item) => {
              const NavIcon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`p-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white dark:bg-gray-600 shadow-md' 
                      : 'hover:bg-white/50 dark:hover:bg-gray-600/50'
                  }`}
                >
                  <NavIcon 
                    className={`w-5 h-5 ${
                      isActive 
                        ? 'text-purple-600 dark:text-purple-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`} 
                  />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-32 pb-4 px-4">
        {/* Show mobile-optimized content based on active tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <MobileStatCard
              title="Total Net Worth"
              value="₹550.00"
              subtitle="Across 1 account"
              gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              icon={FiCreditCard}
            />
            <MobileStatCard
              title="Monthly Savings Rate"
              value="+45.8%"
              subtitle="₹550.00 saved this month"
              gradient="bg-gradient-to-br from-green-500 to-green-600"
              icon={FiTrendingUp}
            />
            <div className="grid grid-cols-2 gap-4">
              <MobileStatCard
                title="Monthly Income"
                value="₹1,200"
                gradient="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                icon={FiTrendingUp}
              />
              <MobileStatCard
                title="Monthly Expenses"
                value="₹650"
                gradient="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400"
                icon={FiTrendingDown}
              />
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <MobileFinanceView 
            financialData={{
              totalNetWorth: 550.00,
              savingsRate: 45.8,
              savedThisMonth: 550.00,
              monthlyIncome: 1200.00,
              monthlyExpenses: 650.00,
              accounts: 1
            }}
          />
        )}

        {/* Default content for other tabs */}
        {!['stats', 'finance'].includes(activeTab) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 min-h-[60vh]">
            {children}
          </div>
        )}
      </main>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowMoreMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-20 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 p-2 min-w-[200px]"
            >
              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                Settings
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                Export Data
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-red-600">
                Logout
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileLayout;
