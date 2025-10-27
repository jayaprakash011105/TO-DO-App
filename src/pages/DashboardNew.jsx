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
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Workspace</h1>
              <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                Welcome back, {user?.username}!
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
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
