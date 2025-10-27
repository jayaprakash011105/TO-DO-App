import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import TodoSection from '../components/TodoSection';
import NotesSection from '../components/NotesSection';
import RecipesSection from '../components/RecipesSection';
import FinanceSection from '../components/FinanceSection';
import UserProfile from '../components/UserProfile';
import StatsDashboard from '../components/StatsDashboard';
import PomodoroTimer from '../components/PomodoroTimer';
import CalendarView from '../components/CalendarView';
import HabitTracker from '../components/HabitTracker';
import { 
  FiLogOut, FiSun, FiMoon, FiCheckSquare, FiFileText, 
  FiBook, FiDollarSign, FiUser, FiSearch, FiBarChart2,
  FiCommand, FiBell, FiDownload, FiUpload, FiClock,
  FiCalendar, FiTarget
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const DashboardNew = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('todos');
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const navigate = useNavigate();

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: FiBarChart2 },
    { id: 'todos', label: 'Tasks', icon: FiCheckSquare },
    { id: 'calendar', label: 'Calendar', icon: FiCalendar },
    { id: 'habits', label: 'Habits', icon: FiTarget },
    { id: 'notes', label: 'Notes', icon: FiFileText },
    { id: 'recipes', label: 'Recipes', icon: FiBook },
    { id: 'finance', label: 'Finance', icon: FiDollarSign },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'k':
            e.preventDefault();
            setShowSearch(!showSearch);
            break;
          case '1':
            setActiveTab('stats');
            break;
          case '2':
            setActiveTab('todos');
            break;
          case '3':
            setActiveTab('notes');
            break;
          case '4':
            setActiveTab('recipes');
            break;
          case '5':
            setActiveTab('finance');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  const exportData = () => {
    const data = {
      todos: localStorage.getItem(`todos_${user?.id}`) || '[]',
      notes: localStorage.getItem(`notes_${user?.id}`) || '[]',
      recipes: localStorage.getItem(`recipes_${user?.id}`) || '[]',
      profile: localStorage.getItem(`profile_${user?.id}`) || '{}',
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Data exported successfully!');
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.todos) localStorage.setItem(`todos_${user?.id}`, data.todos);
          if (data.notes) localStorage.setItem(`notes_${user?.id}`, data.notes);
          if (data.recipes) localStorage.setItem(`recipes_${user?.id}`, data.recipes);
          if (data.profile) localStorage.setItem(`profile_${user?.id}`, data.profile);
          toast.success('Data imported successfully!');
          window.location.reload();
        } catch (error) {
          toast.error('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Header */}
      <header className="glass-effect backdrop-blur-xl shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfile(true)}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg hover:shadow-lg transition-shadow"
              >
                {user?.username?.charAt(0).toUpperCase()}
              </button>
              <div>
                <h1 className="text-2xl font-bold gradient-text">My Workspace</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.username}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Pomodoro Timer */}
              <button
                onClick={() => setShowPomodoro(true)}
                className="p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
                title="Pomodoro Timer"
              >
                <FiClock className="w-5 h-5" />
              </button>
              
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
                title="Search (Ctrl+K)"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              
              {/* Notifications */}
              <button
                className="relative p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
              >
                <FiBell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              {/* Export/Import */}
              <button
                onClick={exportData}
                className="p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
                title="Export Data"
              >
                <FiDownload className="w-5 h-5" />
              </button>
              
              <label className="p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg cursor-pointer">
                <FiUpload className="w-5 h-5" />
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <FiSun className="w-5 h-5 text-yellow-500" /> : <FiMoon className="w-5 h-5 text-blue-600" />}
              </button>
              
              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 hover:shadow-lg"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3">
                <FiSearch className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks, notes, recipes..."
                  className="flex-1 bg-transparent outline-none text-lg text-gray-900 dark:text-white placeholder-gray-400"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>Quick actions:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+1</kbd> Dashboard
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+2</kbd> Tasks
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+3</kbd> Notes
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+4</kbd> Recipes
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <UserProfile onClose={() => setShowProfile(false)} />
        )}
      </AnimatePresence>

      {/* Pomodoro Timer Modal */}
      <AnimatePresence>
        {showPomodoro && (
          <PomodoroTimer onClose={() => setShowPomodoro(false)} />
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 p-2 glass-effect backdrop-blur-xl rounded-2xl shadow-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'tab-active transform scale-105'
                    : 'tab-inactive hover:scale-102'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm md:text-base">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="glass-effect backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20"
        >
          {activeTab === 'stats' && <StatsDashboard />}
          {activeTab === 'todos' && <TodoSection />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'habits' && <HabitTracker />}
          {activeTab === 'notes' && <NotesSection />}
          {activeTab === 'recipes' && <RecipesSection />}
          {activeTab === 'finance' && <FinanceSection />}
        </motion.div>
      </main>
    </div>
  );
};
export default DashboardNew;
