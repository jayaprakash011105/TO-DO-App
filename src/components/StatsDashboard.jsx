import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiActivity, FiPieChart, FiBarChart2,
  FiCheckCircle, FiClock, FiCalendar, FiAward
} from 'react-icons/fi';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';

const StatsDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayTasks: 0,
    weekTasks: 0,
    completionRate: 0,
    productivityScore: 0,
    weeklyData: [],
    categoryBreakdown: {}
  });

  useEffect(() => {
    calculateStats();
  }, [user]);

  const calculateStats = () => {
    const todos = JSON.parse(localStorage.getItem(`todos_${user?.id}`) || '[]');
    const notes = JSON.parse(localStorage.getItem(`notes_${user?.id}`) || '[]');
    const recipes = JSON.parse(localStorage.getItem(`recipes_${user?.id}`) || '[]');
    
    // Today's tasks
    const today = new Date().toDateString();
    const todayTasks = todos.filter(t => 
      new Date(t.createdAt).toDateString() === today
    );

    // This week's tasks
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekTasks = todos.filter(t => {
      const taskDate = new Date(t.createdAt);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    // Completion rate
    const completedTasks = todos.filter(t => t.completed).length;
    const completionRate = todos.length > 0 
      ? Math.round((completedTasks / todos.length) * 100) 
      : 0;

    // Weekly data for chart
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    const weeklyData = last7Days.map(day => {
      const dayTasks = todos.filter(t => 
        new Date(t.createdAt).toDateString() === day.toDateString()
      );
      return {
        day: format(day, 'EEE'),
        completed: dayTasks.filter(t => t.completed).length,
        pending: dayTasks.filter(t => !t.completed).length
      };
    });

    // Category breakdown
    const categoryBreakdown = {
      Tasks: todos.length,
      Notes: notes.length,
      Recipes: recipes.length,
      Finance: Math.floor(Math.random() * 20) // Mock data
    };

    // Productivity score (mock calculation)
    const productivityScore = Math.min(100, 
      Math.round(completionRate * 0.4 + 
      (weekTasks.length * 5) + 
      (notes.length * 2) + 
      (recipes.length * 3))
    );

    setStats({
      todayTasks: todayTasks.length,
      weekTasks: weekTasks.length,
      completionRate,
      productivityScore,
      weeklyData,
      categoryBreakdown
    });
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, gradient }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-xl`}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
        <Icon className="w-32 h-32" />
      </div>
      <div className="relative z-10">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm mb-4`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-white/90 font-medium">{title}</p>
        {subtitle && (
          <p className="text-white/70 text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );

  const maxBarHeight = Math.max(...stats.weeklyData.map(d => d.completed + d.pending), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your productivity and progress
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <FiCalendar className="w-4 h-4" />
          <span>{format(new Date(), 'MMMM d, yyyy')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiCheckCircle}
          title="Today's Tasks"
          value={stats.todayTasks}
          subtitle="Keep it up!"
          color="text-white"
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={FiTrendingUp}
          title="This Week"
          value={stats.weekTasks}
          subtitle={`${stats.completionRate}% completed`}
          color="text-white"
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={FiActivity}
          title="Productivity"
          value={`${stats.productivityScore}%`}
          subtitle="Great progress!"
          color="text-white"
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={FiAward}
          title="Total Items"
          value={Object.values(stats.categoryBreakdown).reduce((a, b) => a + b, 0)}
          subtitle="Across all categories"
          color="text-white"
          gradient="from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weekly Activity
            </h3>
            <FiBarChart2 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-end justify-between h-48 space-x-2">
            {stats.weeklyData.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 flex flex-col items-center justify-end space-y-2"
              >
                <div className="w-full flex flex-col space-y-1">
                  {day.completed > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ 
                        height: `${(day.completed / maxBarHeight) * 100}%` 
                      }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg min-h-[4px]"
                      style={{ 
                        height: `${(day.completed / maxBarHeight) * 150}px` 
                      }}
                    />
                  )}
                  {day.pending > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ 
                        height: `${(day.pending / maxBarHeight) * 100}%` 
                      }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="w-full bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg min-h-[4px]"
                      style={{ 
                        height: `${(day.pending / maxBarHeight) * 150}px` 
                      }}
                    />
                  )}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {day.day}
                </span>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
            </div>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Category Breakdown
            </h3>
            <FiPieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {Object.entries(stats.categoryBreakdown).map(([category, count], index) => {
              const colors = [
                'from-blue-500 to-blue-600',
                'from-purple-500 to-purple-600',
                'from-green-500 to-green-600',
                'from-orange-500 to-orange-600'
              ];
              const total = Object.values(stats.categoryBreakdown).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${colors[index]}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center"
      >
        <FiAward className="w-8 h-8 mx-auto mb-3 text-white/80" />
        <p className="text-lg font-medium">
          "The secret of getting ahead is getting started."
        </p>
        <p className="text-sm text-white/80 mt-2">- Mark Twain</p>
      </motion.div>
    </div>
  );
};

export default StatsDashboard;
