import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import TodoSection from '../components/TodoSection';
import NotesSection from '../components/NotesSection';
import RecipesSection from '../components/RecipesSection';
import FinanceSection from '../components/FinanceSection';
import { FiLogOut, FiSun, FiMoon, FiCheckSquare, FiFileText, FiBook, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';

const DashboardNew = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('todos');

  const tabs = [
    { id: 'todos', label: 'Tasks', icon: FiCheckSquare },
    { id: 'notes', label: 'Notes', icon: FiFileText },
    { id: 'recipes', label: 'Recipes', icon: FiBook },
    { id: 'finance', label: 'Finance', icon: FiDollarSign },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Header */}
      <header className="glass-effect backdrop-blur-xl shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold gradient-text">My Workspace</h1>
              <span className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                👋 Welcome back, {user?.username}!
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <FiSun className="w-5 h-5 text-yellow-500" /> : <FiMoon className="w-5 h-5 text-blue-600" />}
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 hover:shadow-lg"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

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
          {activeTab === 'todos' && <TodoSection />}
          {activeTab === 'notes' && <NotesSection />}
          {activeTab === 'recipes' && <RecipesSection />}
          {activeTab === 'finance' && <FinanceSection />}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardNew;
