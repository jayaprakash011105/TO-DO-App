import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart, FiCalendar, FiCreditCard, FiTarget, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { financeService } from '../services/api';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [financialData, setFinancialData] = useState({
    netWorth: 550.00,
    monthlyIncome: 1200.00,
    monthlyExpenses: 650.00,
    savingsRate: 45.8,
    savedThisMonth: 550.00,
    todayExpense: 0.00,
    todayAvg: 21.67,
    weekExpense: 300.00,
    burnRate: 21.67,
    dailyAverage: 21.67,
    weeklyProjection: 151.67,
    monthlyProjection: 650.00,
    budgetDaysLeft: 25,
    categorySpending: {
      Shopping: 300.00,
      Transportation: 250.00,
      Food: 100.00
    }
  });

  const [transactions, setTransactions] = useState([]);
  const [cashFlowData, setCashFlowData] = useState(null);

  useEffect(() => {
    fetchFinancialData();
    
    // Refresh data every 5 seconds to stay in sync
    const interval = setInterval(fetchFinancialData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchFinancialData = async () => {
    try {
      const data = await financeService.getTransactions();
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      
      // Calculate total net worth (all time balance)
      const allIncome = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const allExpenses = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netWorth = allIncome - allExpenses;
      
      // Calculate financial metrics for current month
      const monthTransactions = data.filter(t => {
        const date = new Date(t.date);
        return date >= monthStart && date <= monthEnd;
      });

      const monthlyIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const savedThisMonth = monthlyIncome - monthlyExpenses;
      const savingsRate = monthlyIncome > 0 ? ((savedThisMonth / monthlyIncome) * 100) : 0;
      
      // Calculate category spending
      const categoryTotals = {};
      monthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

      // Prepare cash flow chart data
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const dailyData = days.map(day => {
        const dayTransactions = monthTransactions.filter(t => 
          format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        const dayIncome = dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const dayExpense = dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          date: format(day, 'd'),
          income: dayIncome,
          expense: dayExpense
        };
      });

      setCashFlowData({
        labels: dailyData.map(d => d.date),
        datasets: [
          {
            label: 'Income',
            data: dailyData.map(d => d.income),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          },
          {
            label: 'Expenses',
            data: dailyData.map(d => d.expense),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4
          }
        ]
      });

      // Calculate week expenses
      const weekTransactions = data.filter(t => {
        const date = new Date(t.date);
        return date >= weekStart && date <= now && t.type === 'expense';
      });
      const weekExpense = weekTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate today's expenses
      const todayTransactions = data.filter(t => {
        const date = new Date(t.date);
        return format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') && t.type === 'expense';
      });
      const todayExpense = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate daily average (last 30 days)
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const last30DaysExpenses = data.filter(t => {
        const date = new Date(t.date);
        return date >= thirtyDaysAgo && date <= now && t.type === 'expense';
      }).reduce((sum, t) => sum + t.amount, 0);
      const dailyAverage = last30DaysExpenses / 30;
      
      setFinancialData(prev => ({
        ...prev,
        netWorth: netWorth,
        monthlyIncome: monthlyIncome,
        monthlyExpenses: monthlyExpenses,
        savingsRate: savingsRate.toFixed(1),
        savedThisMonth: savedThisMonth,
        todayExpense: todayExpense,
        todayAvg: dailyAverage.toFixed(2),
        weekExpense: weekExpense,
        burnRate: dailyAverage.toFixed(2),
        dailyAverage: dailyAverage.toFixed(2),
        weeklyProjection: (dailyAverage * 7).toFixed(2),
        monthlyProjection: (dailyAverage * 30).toFixed(2),
        budgetDaysLeft: monthlyIncome > 0 ? Math.floor((monthlyIncome - monthlyExpenses) / dailyAverage) : 0,
        categorySpending: categoryTotals
      }));

      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    }
  };

  const pieChartData = {
    labels: Object.keys(financialData.categorySpending),
    datasets: [{
      data: Object.values(financialData.categorySpending),
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `₹${context.parsed.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ₹${context.parsed}`
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Net Worth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm mb-2">Total Net Worth</p>
              <h2 className="text-4xl font-bold mb-2">₹{financialData.netWorth.toFixed(2)}</h2>
              <p className="text-purple-200 text-sm">All time balance</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <FiCreditCard className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        {/* Monthly Savings Rate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm mb-2">Monthly Savings Rate</p>
              <h2 className="text-4xl font-bold mb-2">+{financialData.savingsRate}%</h2>
              <p className="text-green-200 text-sm">₹{financialData.savedThisMonth.toFixed(2)} saved this month</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <FiTarget className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Income and Expenses Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-l-4 border-green-500"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Monthly Income</p>
              <h3 className="text-2xl font-bold text-green-600">₹{financialData.monthlyIncome.toFixed(2)}</h3>
            </div>
            <FiTrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-l-4 border-red-500"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Monthly Expenses</p>
              <h3 className="text-2xl font-bold text-red-600">₹{financialData.monthlyExpenses.toFixed(2)}</h3>
            </div>
            <FiTrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </motion.div>
      </div>

      {/* Expense Tracking Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Expense Tracking</h3>
        
        <div className="space-y-4">
          {/* Today */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                <FiCalendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">vs avg: ₹{financialData.todayAvg}</p>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{financialData.todayExpense.toFixed(2)}</p>
          </div>

          {/* This Week */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <FiCalendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Since Monday</p>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{financialData.weekExpense.toFixed(2)}</p>
          </div>

          {/* Burn Rate */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <FiActivity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Burn Rate</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Per day this month</p>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{financialData.burnRate}</p>
          </div>
        </div>
      </motion.div>

      {/* Financial Insights Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Financial Insights</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Daily Average</p>
            <p className="text-2xl font-bold text-purple-600">₹{financialData.dailyAverage}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weekly Projection</p>
            <p className="text-2xl font-bold text-blue-600">₹{financialData.weeklyProjection}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Based on avg</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Budget Days Left</p>
            <p className="text-2xl font-bold text-green-600">{financialData.budgetDaysLeft}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">At current rate</p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Projection</p>
            <p className="text-2xl font-bold text-yellow-600">₹{financialData.monthlyProjection}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Expected total</p>
          </div>
        </div>
      </motion.div>

      {/* Spending by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Spending by Category</h3>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pie Chart */}
          <div className="flex-1">
            <div className="h-64 relative">
              {Object.keys(financialData.categorySpending).length > 0 ? (
                <Pie data={pieChartData} options={pieOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No spending data available
                </div>
              )}
            </div>
          </div>

          {/* Category List */}
          <div className="flex-1 space-y-3">
            {Object.entries(financialData.categorySpending).map(([category, amount], index) => {
              const colors = ['purple', 'blue', 'pink', 'green', 'orange'];
              const color = colors[index % colors.length];
              const total = Object.values(financialData.categorySpending).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (amount / total * 100).toFixed(1) : 0;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full bg-${color}-500`}></div>
                    <span className="text-gray-700 dark:text-gray-300">{category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Daily Cash Flow Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Daily Cash Flow - {format(new Date(), 'MMMM yyyy')}
        </h3>
        
        <div className="h-64">
          {cashFlowData ? (
            <Line data={cashFlowData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Loading chart data...
            </div>
          )}
        </div>

        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
