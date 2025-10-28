import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiActivity, FiPieChart, FiBarChart2,
  FiCheckCircle, FiClock, FiCalendar, FiAward,
  FiDollarSign, FiArrowUp, FiArrowDown, FiCreditCard,
  FiRefreshCw
} from 'react-icons/fi';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import toast from 'react-hot-toast';

const StatsDashboard = () => {
  const { user } = useAuth();
  const [financialView, setFinancialView] = useState('weekly');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [stats, setStats] = useState({
    todayTasks: 0,
    weekTasks: 0,
    completionRate: 0,
    productivityScore: 0,
    weeklyData: [],
    categoryBreakdown: {},
    financialData: {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      weeklyIncome: 0,
      weeklyExpenses: 0,
      weeklyBalance: 0,
      dailyAverage: 0,
      savingsRate: 0,
      weeklySavingsRate: 0,
      topCategories: [],
      recentTransactions: [],
      weeklyTrend: [],
      comparisonData: {
        incomeChange: 0,
        expenseChange: 0
      }
    },
    calendarData: {
      todayEvents: 0,
      weekEvents: 0,
      upcomingEvents: []
    },
    habitData: {
      activeHabits: 0,
      todayCompleted: 0,
      weeklyCompletion: 0,
      streaks: []
    },
    realTimeData: {
      lastUpdated: new Date().toISOString(),
      totalItems: 0,
      activeProjects: 0
    }
  });

  useEffect(() => {
    // Initial calculation
    calculateStats();
    
    // Set up real-time refresh every 5 seconds
    const interval = setInterval(() => {
      calculateStats();
    }, 5000);
    
    setRefreshInterval(interval);
    
    // Listen for storage changes (when data is updated in other tabs/components)
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes(user?.id)) {
        calculateStats();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);
  
  // Also recalculate when financial view changes
  useEffect(() => {
    calculateStats();
  }, [financialView]);

  const calculateStats = () => {
    // Fetch all data from localStorage with real-time sync
    // Using the actual storage keys from localStorage.js
    const allTodos = JSON.parse(localStorage.getItem('todo_app_todos') || '[]');
    const allNotes = JSON.parse(localStorage.getItem('todo_app_notes') || '[]');
    const allRecipes = JSON.parse(localStorage.getItem('todo_app_recipes') || '[]');
    const allTransactions = JSON.parse(localStorage.getItem('todo_app_transactions') || '[]');
    
    // Filter by current user if user exists
    const todos = user?.id ? allTodos.filter(t => t.userId === user.id) : allTodos;
    const notes = user?.id ? allNotes.filter(n => n.userId === user.id) : allNotes;
    const recipes = user?.id ? allRecipes.filter(r => r.userId === user.id) : allRecipes;
    const transactions = user?.id ? allTransactions.filter(t => t.userId === user.id) : allTransactions;
    
    // Calendar and habits might be stored differently, check for them
    const events = JSON.parse(localStorage.getItem(`events_${user?.id}`) || 
                              localStorage.getItem('todo_app_events') || '[]');
    const habits = JSON.parse(localStorage.getItem(`habits_${user?.id}`) || 
                             localStorage.getItem('todo_app_habits') || '[]');
    const habitLogs = JSON.parse(localStorage.getItem(`habitLogs_${user?.id}`) || 
                                localStorage.getItem('todo_app_habit_logs') || '[]');
    
    // Today's tasks - count both created today and due today
    const todayString = new Date().toDateString();
    const todayTasks = todos.filter(t => {
      const createdToday = new Date(t.createdAt).toDateString() === todayString;
      const dueToday = t.dueDate && new Date(t.dueDate).toDateString() === todayString;
      return createdToday || dueToday;
    });
    
    // Count only incomplete tasks for "Today's Tasks" metric
    const incompleteTodayTasks = todayTasks.filter(t => !t.completed);

    // This week's tasks - include both created and due this week
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekTasks = todos.filter(t => {
      const taskDate = new Date(t.createdAt);
      const dueDate = t.dueDate ? new Date(t.dueDate) : null;
      const createdThisWeek = taskDate >= weekStart && taskDate <= weekEnd;
      const dueThisWeek = dueDate && dueDate >= weekStart && dueDate <= weekEnd;
      return createdThisWeek || dueThisWeek;
    });
    
    // Count completed tasks this week
    const completedThisWeek = weekTasks.filter(t => t.completed).length;

    // Completion rate - calculate based on all tasks
    const completedTasks = todos.filter(t => t.completed).length;
    const totalTasks = todos.length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    // Weekly completion rate
    const weeklyCompletionRate = weekTasks.length > 0
      ? Math.round((completedThisWeek / weekTasks.length) * 100)
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

    // Financial calculations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const today = new Date();
    const weekAgo = subDays(today, 7);
    const twoWeeksAgo = subDays(today, 14);
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Weekly transactions
    const weeklyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= weekAgo && date <= today;
    });
    
    // Previous week transactions for comparison
    const previousWeekTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= twoWeeksAgo && date < weekAgo;
    });
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    // Weekly calculations
    const weeklyIncome = weeklyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const weeklyExpenses = weeklyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const previousWeekIncome = previousWeekTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const previousWeekExpenses = previousWeekTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const weeklyBalance = weeklyIncome - weeklyExpenses;
    const dailyAverage = weeklyExpenses / 7;
    
    const balance = totalIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 
      ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
      : 0;
    
    const weeklySavingsRate = weeklyIncome > 0
      ? Math.round(((weeklyIncome - weeklyExpenses) / weeklyIncome) * 100)
      : 0;
    
    // Calculate week-over-week changes
    const incomeChange = previousWeekIncome > 0 
      ? Math.round(((weeklyIncome - previousWeekIncome) / previousWeekIncome) * 100)
      : 0;
    
    const expenseChange = previousWeekExpenses > 0
      ? Math.round(((weeklyExpenses - previousWeekExpenses) / previousWeekExpenses) * 100)
      : 0;
    
    // Top expense categories
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'Other';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(t.amount || 0);
      });
    
    const topCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));
    
    // Recent transactions
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Weekly trend data (last 7 days)
    const weeklyTrend = eachDayOfInterval({ start: weekAgo, end: today }).map(day => {
      const dayTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.toDateString() === day.toDateString();
      });
      
      const dayIncome = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      const dayExpenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      return {
        day: format(day, 'EEE'),
        date: format(day, 'MMM dd'),
        income: dayIncome,
        expenses: dayExpenses,
        net: dayIncome - dayExpenses
      };
    });
    
    // Calendar data calculations
    const todayEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.toDateString() === todayString;
    });
    
    const weekEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });
    
    const upcomingEvents = events
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
    
    // Habit data calculations
    const activeHabits = habits.filter(h => h.isActive !== false).length;
    const todayHabitLogs = habitLogs.filter(log => 
      new Date(log.date).toDateString() === todayString
    );
    const todayCompletedHabits = todayHabitLogs.filter(log => log.completed).length;
    
    // Calculate habit streaks
    const habitStreaks = habits.map(habit => {
      const logs = habitLogs
        .filter(log => log.habitId === habit.id && log.completed)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < logs.length; i++) {
        const logDate = new Date(logs[i].date);
        const dayDiff = Math.floor((today - logDate) / (1000 * 60 * 60 * 24));
        if (dayDiff === streak) {
          streak++;
        } else {
          break;
        }
      }
      return { habit: habit.name, streak };
    }).filter(s => s.streak > 0);
    
    // Category breakdown with real counts
    const categoryBreakdown = {
      Tasks: todos.length,
      Notes: notes.length,
      Recipes: recipes.length,
      Events: events.length,
      Habits: habits.length,
      Transactions: transactions.length
    };

    // Productivity score - based on real metrics
    const taskScore = completionRate * 0.3; // 30% weight
    const weeklyScore = weeklyCompletionRate * 0.2; // 20% weight
    const habitScore = (activeHabits > 0 ? (todayCompletedHabits / activeHabits) * 100 : 0) * 0.2; // 20% weight
    const activityScore = Math.min(100, (todos.length + notes.length + events.length) * 2) * 0.15; // 15% weight
    const consistencyScore = (habitStreaks.length > 0 ? Math.min(100, habitStreaks.length * 20) : 0) * 0.15; // 15% weight
    
    const productivityScore = Math.round(
      taskScore + weeklyScore + habitScore + activityScore + consistencyScore
    );

    // Calculate total active items across all categories
    const totalItems = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);
    
    setStats({
      todayTasks: incompleteTodayTasks.length,
      weekTasks: weekTasks.filter(t => !t.completed).length,
      completionRate: weeklyCompletionRate, // Show weekly completion rate as main metric
      productivityScore,
      weeklyData,
      categoryBreakdown,
      financialData: {
        totalIncome,
        totalExpenses,
        balance,
        monthlyIncome,
        monthlyExpenses,
        weeklyIncome,
        weeklyExpenses,
        weeklyBalance,
        dailyAverage,
        savingsRate,
        weeklySavingsRate,
        topCategories,
        recentTransactions,
        weeklyTrend,
        comparisonData: {
          incomeChange,
          expenseChange
        }
      },
      calendarData: {
        todayEvents: todayEvents.length,
        weekEvents: weekEvents.length,
        upcomingEvents
      },
      habitData: {
        activeHabits,
        todayCompleted: todayCompletedHabits,
        weeklyCompletion: activeHabits > 0 ? Math.round((todayCompletedHabits / activeHabits) * 100) : 0,
        streaks: habitStreaks
      },
      realTimeData: {
        lastUpdated: new Date().toISOString(),
        totalItems,
        activeProjects: weekTasks.length + weekEvents.length + activeHabits
      }
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
            Track your productivity and progress • Live sync enabled
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={() => {
                calculateStats();
                toast.success('Dashboard refreshed!');
              }}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-1"
            >
              <FiRefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <FiCalendar className="w-4 h-4" />
            <span>{format(new Date(), 'MMMM d, yyyy')}</span>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Last updated: {format(new Date(stats.realTimeData.lastUpdated), 'HH:mm:ss')}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiCheckCircle}
          title="Today's Tasks"
          value={stats.todayTasks}
          subtitle={stats.todayTasks === 0 ? "All done!" : `${stats.todayTasks} pending`}
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
          subtitle={stats.productivityScore >= 70 ? "Excellent!" : stats.productivityScore >= 40 ? "Good progress" : "Keep going!"}
          color="text-white"
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={FiAward}
          title="Total Items"
          value={stats.realTimeData.totalItems}
          subtitle={`${stats.realTimeData.activeProjects} active projects`}
          color="text-white"
          gradient="from-orange-500 to-orange-600"
        />
      </div>

      {/* Financial Overview Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Financial Overview
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time sync with Finance section
            </p>
          </div>
          <FiDollarSign className="w-6 h-6 text-gray-400" />
        </div>
        
        {/* Weekly/Monthly Toggle */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFinancialView('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              financialView === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFinancialView('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              financialView === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
        </div>
        
        {/* Financial Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {financialView === 'weekly' ? 'Weekly Income' : 'Monthly Income'}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${financialView === 'weekly' 
                    ? stats.financialData.weeklyIncome.toFixed(2)
                    : stats.financialData.monthlyIncome.toFixed(2)
                  }
                </p>
                {financialView === 'weekly' && stats.financialData.comparisonData.incomeChange !== 0 && (
                  <p className={`text-xs mt-1 ${
                    stats.financialData.comparisonData.incomeChange > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {stats.financialData.comparisonData.incomeChange > 0 ? '↑' : '↓'} 
                    {Math.abs(stats.financialData.comparisonData.incomeChange)}% vs last week
                  </p>
                )}
              </div>
              <FiArrowUp className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {financialView === 'weekly' ? 'Weekly Expenses' : 'Monthly Expenses'}
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${financialView === 'weekly'
                    ? stats.financialData.weeklyExpenses.toFixed(2)
                    : stats.financialData.monthlyExpenses.toFixed(2)
                  }
                </p>
                {financialView === 'weekly' && stats.financialData.comparisonData.expenseChange !== 0 && (
                  <p className={`text-xs mt-1 ${
                    stats.financialData.comparisonData.expenseChange < 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {stats.financialData.comparisonData.expenseChange > 0 ? '↑' : '↓'} 
                    {Math.abs(stats.financialData.comparisonData.expenseChange)}% vs last week
                  </p>
                )}
              </div>
              <FiArrowDown className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {financialView === 'weekly' ? 'Weekly Balance' : 'Current Balance'}
                </p>
                <p className={`text-2xl font-bold ${
                  (financialView === 'weekly' ? stats.financialData.weeklyBalance : stats.financialData.balance) >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  ${Math.abs(
                    financialView === 'weekly' 
                      ? stats.financialData.weeklyBalance 
                      : stats.financialData.balance
                  ).toFixed(2)}
                </p>
                {financialView === 'weekly' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Daily avg: ${stats.financialData.dailyAverage.toFixed(2)}
                  </p>
                )}
              </div>
              <FiCreditCard className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </motion.div>
        </div>
        
        {/* Savings Rate */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {financialView === 'weekly' ? 'Weekly Savings Rate' : 'Monthly Savings Rate'}
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {financialView === 'weekly' 
                ? stats.financialData.weeklySavingsRate
                : stats.financialData.savingsRate
              }%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.max(0, Math.min(100, 
                  financialView === 'weekly' 
                    ? stats.financialData.weeklySavingsRate
                    : stats.financialData.savingsRate
                ))}%` 
              }}
              className={`h-3 rounded-full bg-gradient-to-r ${
                (financialView === 'weekly' 
                  ? stats.financialData.weeklySavingsRate 
                  : stats.financialData.savingsRate) >= 20 
                  ? 'from-green-500 to-green-600' 
                  : (financialView === 'weekly' 
                    ? stats.financialData.weeklySavingsRate 
                    : stats.financialData.savingsRate) >= 10
                  ? 'from-yellow-500 to-yellow-600'
                  : 'from-red-500 to-red-600'
              }`}
            />
          </div>
        </div>
        
        {/* Weekly Trend Chart (only show in weekly view) */}
        {financialView === 'weekly' && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              7-Day Financial Trend
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {stats.financialData.weeklyTrend.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {day.day}
                  </div>
                  <div className="relative h-24 bg-gray-100 dark:bg-gray-700 rounded">
                    {day.income > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ 
                          height: `${Math.min(100, (day.income / Math.max(...stats.financialData.weeklyTrend.map(d => d.income))) * 100)}%` 
                        }}
                        className="absolute bottom-0 left-0 w-1/2 bg-green-500 rounded-tl"
                      />
                    )}
                    {day.expenses > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ 
                          height: `${Math.min(100, (day.expenses / Math.max(...stats.financialData.weeklyTrend.map(d => d.expenses))) * 100)}%` 
                        }}
                        className="absolute bottom-0 right-0 w-1/2 bg-red-500 rounded-tr"
                      />
                    )}
                  </div>
                  <div className={`text-xs mt-1 font-medium ${
                    day.net >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {day.net >= 0 ? '+' : ''}${day.net.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Income</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Expenses</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Top Expense Categories */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Top Expense Categories
          </h4>
          <div className="space-y-2">
            {stats.financialData.topCategories.length > 0 ? (
              stats.financialData.topCategories.map((cat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {cat.category}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${cat.amount.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No expenses recorded</p>
            )}
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Recent Transactions
          </h4>
          <div className="space-y-2">
            {stats.financialData.recentTransactions.length > 0 ? (
              stats.financialData.recentTransactions.map((transaction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.category}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                  </span>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No transactions yet</p>
            )}
          </div>
        </div>
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

      {/* Calendar & Habits Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Calendar Overview
            </h3>
            <FiCalendar className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Events</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.calendarData.todayEvents}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.calendarData.weekEvents}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upcoming Events
              </p>
              {stats.calendarData.upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {stats.calendarData.upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(event.date), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.category === 'task' ? 'bg-blue-100 text-blue-600' :
                        event.category === 'meeting' ? 'bg-green-100 text-green-600' :
                        event.category === 'deadline' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {event.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events</p>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Habits Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Habits Tracker
            </h3>
            <FiActivity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.habitData.activeHabits}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.habitData.todayCompleted}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Today</p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.habitData.weeklyCompletion}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Weekly</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Streaks 🔥
              </p>
              {stats.habitData.streaks.length > 0 ? (
                <div className="space-y-2">
                  {stats.habitData.streaks.slice(0, 3).map((streak, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {streak.habit}
                      </span>
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {streak.streak} days
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Start building streaks!</p>
              )}
            </div>
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
