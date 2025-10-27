import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiTrash2, FiEdit2, FiTrendingUp, FiAward,
  FiTarget, FiCalendar, FiCheck, FiX, FiRepeat,
  FiSun, FiMoon, FiCoffee, FiActivity
} from 'react-icons/fi';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, 
         isSameDay, subDays, addDays, isToday } from 'date-fns';
import toast from 'react-hot-toast';

const HabitTracker = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState({});
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, month, year

  const [habitForm, setHabitForm] = useState({
    name: '',
    description: '',
    icon: '🎯',
    color: 'blue',
    frequency: 'daily', // daily, weekly, custom
    targetDays: 7,
    category: 'health',
    reminder: ''
  });

  const categories = [
    { id: 'health', label: 'Health', icon: FiActivity },
    { id: 'productivity', label: 'Productivity', icon: FiTarget },
    { id: 'learning', label: 'Learning', icon: FiAward },
    { id: 'wellness', label: 'Wellness', icon: FiSun }
  ];

  const iconOptions = ['🎯', '💪', '📚', '🧘', '🏃', '💧', '🥗', '😴', '📝', '🎨', '🎵', '💻'];

  const colorOptions = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600',
    red: 'from-red-400 to-red-600',
    yellow: 'from-yellow-400 to-yellow-600',
    pink: 'from-pink-400 to-pink-600'
  };

  useEffect(() => {
    loadHabits();
    loadHabitLogs();
  }, [user]);

  const loadHabits = () => {
    const savedHabits = localStorage.getItem(`habits_${user?.id}`);
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  };

  const loadHabitLogs = () => {
    const savedLogs = localStorage.getItem(`habit_logs_${user?.id}`);
    if (savedLogs) {
      setHabitLogs(JSON.parse(savedLogs));
    }
  };

  const saveHabits = (newHabits) => {
    localStorage.setItem(`habits_${user?.id}`, JSON.stringify(newHabits));
    setHabits(newHabits);
  };

  const saveHabitLogs = (newLogs) => {
    localStorage.setItem(`habit_logs_${user?.id}`, JSON.stringify(newLogs));
    setHabitLogs(newLogs);
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedWeek);
    const end = endOfWeek(selectedWeek);
    return eachDayOfInterval({ start, end });
  };

  const toggleHabitCompletion = (habitId, date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const logKey = `${habitId}_${dateKey}`;
    
    const newLogs = { ...habitLogs };
    if (newLogs[logKey]) {
      delete newLogs[logKey];
      toast.success('Habit unmarked');
    } else {
      newLogs[logKey] = {
        completed: true,
        completedAt: new Date().toISOString()
      };
      toast.success('Great job! Keep it up! 🎉');
      
      // Check for streak
      const streak = calculateStreak(habitId);
      if (streak > 0 && streak % 7 === 0) {
        toast.success(`Amazing! ${streak} day streak! 🔥`, { duration: 5000 });
      }
    }
    
    saveHabitLogs(newLogs);
  };

  const calculateStreak = (habitId) => {
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const logKey = `${habitId}_${dateKey}`;
      
      if (habitLogs[logKey]) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateCompletionRate = (habitId, days = 30) => {
    let completed = 0;
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
      const dateKey = format(d, 'yyyy-MM-dd');
      const logKey = `${habitId}_${dateKey}`;
      if (habitLogs[logKey]) completed++;
    }
    
    return Math.round((completed / days) * 100);
  };

  const handleAddHabit = () => {
    const newHabit = {
      id: Date.now().toString(),
      ...habitForm,
      createdAt: new Date().toISOString(),
      streak: 0
    };
    saveHabits([...habits, newHabit]);
    setHabitForm({
      name: '',
      description: '',
      icon: '🎯',
      color: 'blue',
      frequency: 'daily',
      targetDays: 7,
      category: 'health',
      reminder: ''
    });
    setShowHabitModal(false);
    toast.success('Habit added successfully!');
  };

  const handleUpdateHabit = () => {
    const updatedHabits = habits.map(habit => 
      habit.id === editingHabit.id 
        ? { ...habit, ...habitForm }
        : habit
    );
    saveHabits(updatedHabits);
    setEditingHabit(null);
    setShowHabitModal(false);
    toast.success('Habit updated successfully!');
  };

  const handleDeleteHabit = (habitId) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    saveHabits(updatedHabits);
    
    // Also remove related logs
    const newLogs = { ...habitLogs };
    Object.keys(newLogs).forEach(key => {
      if (key.startsWith(habitId)) {
        delete newLogs[key];
      }
    });
    saveHabitLogs(newLogs);
    
    toast.success('Habit deleted successfully!');
  };

  const openEditModal = (habit) => {
    setEditingHabit(habit);
    setHabitForm({
      name: habit.name,
      description: habit.description || '',
      icon: habit.icon,
      color: habit.color,
      frequency: habit.frequency,
      targetDays: habit.targetDays,
      category: habit.category,
      reminder: habit.reminder || ''
    });
    setShowHabitModal(true);
  };

  const weekDays = getWeekDays();
  const todayCount = habits.filter(habit => {
    const dateKey = format(new Date(), 'yyyy-MM-dd');
    const logKey = `${habit.id}_${dateKey}`;
    return habitLogs[logKey];
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Habit Tracker
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Build better habits, one day at a time
          </p>
        </div>
        <button
          onClick={() => setShowHabitModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white"
        >
          <FiTarget className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{habits.length}</p>
          <p className="text-blue-100">Active Habits</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white"
        >
          <FiCheck className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{todayCount}/{habits.length}</p>
          <p className="text-green-100">Completed Today</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white"
        >
          <FiTrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">
            {habits.length > 0 ? Math.max(...habits.map(h => calculateStreak(h.id))) : 0}
          </p>
          <p className="text-purple-100">Best Streak</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-2xl text-white"
        >
          <FiAward className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">
            {habits.length > 0 
              ? Math.round(habits.reduce((acc, h) => acc + calculateCompletionRate(h.id, 7), 0) / habits.length)
              : 0}%
          </p>
          <p className="text-orange-100">Weekly Average</p>
        </motion.div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Week of {format(startOfWeek(selectedWeek), 'MMM d, yyyy')}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedWeek(subDays(selectedWeek, 7))}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => setSelectedWeek(new Date())}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* Habit Grid */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 text-gray-600 dark:text-gray-400">Habit</th>
                {weekDays.map(day => (
                  <th key={day.toString()} className="text-center p-2 text-gray-600 dark:text-gray-400">
                    <div className="text-xs">{format(day, 'EEE')}</div>
                    <div className={`text-sm font-bold ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                      {format(day, 'd')}
                    </div>
                  </th>
                ))}
                <th className="text-center p-2 text-gray-600 dark:text-gray-400">Streak</th>
              </tr>
            </thead>
            <tbody>
              {habits.map(habit => (
                <motion.tr
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {habit.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {habit.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  {weekDays.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const logKey = `${habit.id}_${dateKey}`;
                    const isCompleted = habitLogs[logKey];
                    const isFuture = day > new Date();

                    return (
                      <td key={day.toString()} className="text-center p-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => !isFuture && toggleHabitCompletion(habit.id, day)}
                          disabled={isFuture}
                          className={`
                            w-10 h-10 rounded-xl transition-all
                            ${isCompleted 
                              ? `bg-gradient-to-r ${colorOptions[habit.color]} text-white shadow-lg` 
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }
                            ${isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          {isCompleted && <FiCheck className="w-5 h-5 mx-auto" />}
                        </motion.button>
                      </td>
                    );
                  })}
                  <td className="text-center p-2">
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {calculateStreak(habit.id)}
                      </span>
                      {calculateStreak(habit.id) >= 7 && (
                        <span className="text-orange-500">🔥</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {habits.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FiTarget className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No habits yet. Add your first habit to get started!</p>
          </div>
        )}
      </div>

      {/* Habit Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map(habit => (
          <motion.div
            key={habit.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{habit.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {habit.name}
                  </h3>
                  {habit.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {habit.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(habit)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Weekly Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {calculateCompletionRate(habit.id, 7)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateCompletionRate(habit.id, 7)}%` }}
                  className={`h-2 rounded-full bg-gradient-to-r ${colorOptions[habit.color]}`}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {calculateStreak(habit.id)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current Streak</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {calculateCompletionRate(habit.id, 30)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">30 Day Rate</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {habit.targetDays}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Target Days</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Habit Modal */}
      <AnimatePresence>
        {showHabitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowHabitModal(false);
              setEditingHabit(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingHabit ? 'Edit Habit' : 'Create New Habit'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={habitForm.name}
                    onChange={(e) => setHabitForm({ ...habitForm, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Morning Exercise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={habitForm.description}
                    onChange={(e) => setHabitForm({ ...habitForm, description: e.target.value })}
                    className="input-field resize-none"
                    rows="2"
                    placeholder="Why is this habit important?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setHabitForm({ ...habitForm, icon })}
                        className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                          habitForm.icon === icon
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {Object.entries(colorOptions).map(([color, gradient]) => (
                      <button
                        key={color}
                        onClick={() => setHabitForm({ ...habitForm, color })}
                        className={`w-10 h-10 rounded-full bg-gradient-to-r ${gradient} ${
                          habitForm.color === color ? 'ring-4 ring-offset-2 ring-blue-500' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={habitForm.category}
                    onChange={(e) => setHabitForm({ ...habitForm, category: e.target.value })}
                    className="input-field"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Days per Week
                  </label>
                  <input
                    type="number"
                    value={habitForm.targetDays}
                    onChange={(e) => setHabitForm({ ...habitForm, targetDays: parseInt(e.target.value) })}
                    className="input-field"
                    min="1"
                    max="7"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={editingHabit ? handleUpdateHabit : handleAddHabit}
                  disabled={!habitForm.name}
                  className="flex-1 btn-primary"
                >
                  {editingHabit ? 'Update Habit' : 'Create Habit'}
                </button>
                <button
                  onClick={() => {
                    setShowHabitModal(false);
                    setEditingHabit(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitTracker;
