import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiTrendingDown, FiDollarSign, 
  FiCreditCard, FiPieChart, FiActivity 
} from 'react-icons/fi';

const MobileFinanceView = ({ financialData = {} }) => {
  // Default values if no data
  const {
    totalNetWorth = 550.00,
    savingsRate = 45.8,
    savedThisMonth = 550.00,
    monthlyIncome = 1200.00,
    monthlyExpenses = 650.00,
    accounts = 1
  } = financialData;

  const StatCard = ({ title, value, subtitle, gradient, icon: Icon, textColor = 'text-white' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl p-5 ${gradient} shadow-lg`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className={`${textColor === 'text-white' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'} text-sm font-medium mb-2`}>
            {title}
          </p>
          <h3 className={`text-3xl font-bold mb-1 ${textColor}`}>
            {value}
          </h3>
          {subtitle && (
            <p className={`${textColor === 'text-white' ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'} text-xs`}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${textColor === 'text-white' ? 'opacity-30' : 'opacity-20'}`}>
            <Icon className="w-16 h-16" />
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Total Net Worth Card - Purple */}
      <StatCard
        title="Total Net Worth"
        value={`₹${totalNetWorth.toFixed(2)}`}
        subtitle={`Across ${accounts} account${accounts !== 1 ? 's' : ''}`}
        gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        icon={FiCreditCard}
      />

      {/* Monthly Savings Rate - Green */}
      <StatCard
        title="Monthly Savings Rate"
        value={`+${savingsRate}%`}
        subtitle={`₹${savedThisMonth.toFixed(2)} saved this month`}
        gradient="bg-gradient-to-br from-green-500 to-green-600"
        icon={FiPieChart}
      />

      {/* Income and Expenses Cards */}
      <div className="space-y-4">
        {/* Monthly Income - White with green text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border-l-4 border-green-500"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Monthly Income
              </p>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{monthlyIncome.toFixed(2)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        {/* Monthly Expenses - White with red text */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border-l-4 border-red-500"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Monthly Expenses
              </p>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                ₹{monthlyExpenses.toFixed(2)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FiTrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center"
        >
          <FiActivity className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">Daily Average</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            ₹{(monthlyExpenses / 30).toFixed(0)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center"
        >
          <FiDollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">Net Savings</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            ₹{(monthlyIncome - monthlyExpenses).toFixed(0)}
          </p>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg">
          Add Income
        </button>
        <button className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg">
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default MobileFinanceView;
