import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiTrendingDown, FiActivity, 
  FiCheckCircle, FiClock, FiTarget, FiDollarSign 
} from 'react-icons/fi';

export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  trend = null 
}) => {
  const colorClasses = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
    pink: 'from-pink-400 to-pink-600',
    red: 'from-red-400 to-red-600',
  };

  const bgClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
    pink: 'bg-pink-50 dark:bg-pink-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl ${bgClasses[color]} p-4 shadow-lg`}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 opacity-10">
        <div className={`w-full h-full bg-gradient-to-br ${colorClasses[color]} rounded-full`} />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-xs ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{title}</p>
          {subtitle && (
            <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const QuickActionCard = ({ title, icon: Icon, onClick, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600',
    success: 'bg-green-500 hover:bg-green-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    danger: 'bg-red-500 hover:bg-red-600',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-full ${colorClasses[color]} text-white rounded-xl p-4 shadow-lg transition-colors`}
    >
      <Icon className="w-6 h-6 mb-2 mx-auto" />
      <p className="text-xs font-medium">{title}</p>
    </motion.button>
  );
};

export const TaskCard = ({ task, onToggle, onEdit, onDelete }) => {
  const priorityColors = {
    high: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`border-l-4 ${priorityColors[task.priority]} rounded-lg p-3 shadow-sm mb-2`}
    >
      <div className="flex items-start space-x-3">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
          }`}
        >
          {task.completed && <FiCheckCircle className="w-3 h-3 text-white" />}
        </button>
        
        <div className="flex-1">
          <h3 className={`font-medium text-gray-900 dark:text-white ${
            task.completed ? 'line-through opacity-50' : ''
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {task.description}
            </p>
          )}
          <div className="flex items-center space-x-3 mt-2">
            {task.dueDate && (
              <span className="text-[10px] text-gray-500 dark:text-gray-500 flex items-center space-x-1">
                <FiClock className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {task.priority}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const MobileStatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <StatCard
        title="Today's Tasks"
        value={stats.todayTasks || 0}
        subtitle="All items"
        icon={FiCheckCircle}
        color="blue"
        trend={12}
      />
      <StatCard
        title="This Week"
        value={`${stats.weeklyProgress || 0}%`}
        subtitle="Completed"
        icon={FiActivity}
        color="purple"
        trend={-5}
      />
      <StatCard
        title="Productivity"
        value={`${stats.productivity || 0}%`}
        subtitle="Score today"
        icon={FiTarget}
        color="green"
        trend={8}
      />
      <StatCard
        title="Total Items"
        value={stats.totalItems || 0}
        subtitle="Active in queue"
        icon={FiDollarSign}
        color="orange"
      />
    </div>
  );
};

export const FinancialCard = ({ type, amount, trend }) => {
  const isIncome = type === 'income';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl p-4 ${
        isIncome 
          ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' 
          : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'
      } shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium ${
          isIncome ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
        }`}>
          {isIncome ? 'Weekly Income' : 'Weekly Expenses'}
        </span>
        <div className={`p-1.5 rounded-lg ${
          isIncome ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800'
        }`}>
          {isIncome ? (
            <FiTrendingUp className="w-4 h-4 text-green-700 dark:text-green-300" />
          ) : (
            <FiTrendingDown className="w-4 h-4 text-red-700 dark:text-red-300" />
          )}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-2xl font-bold ${
            isIncome ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
          }`}>
            ${amount.toLocaleString()}
          </p>
        </div>
        {trend !== undefined && (
          <span className={`text-xs ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </motion.div>
  );
};
