import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import TodoSection from '../components/TodoSection';
import NotesSection from '../components/NotesSection';
import RecipesSection from '../components/RecipesSection';
import RecipeForm from '../components/RecipeForm';
import FinanceSection from '../components/FinanceSection';
import UserProfile from '../components/UserProfile';
import PomodoroTimer from '../components/PomodoroTimer';
import HabitTracker from '../components/HabitTracker';
import Dashboard from '../components/Dashboard';
import { recipeService } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FiLogOut, FiSun, FiMoon, FiCheckSquare, FiFileText, 
  FiBook, FiDollarSign, FiUser, FiSearch, FiHome,
  FiCommand, FiBell, FiDownload, FiUpload, FiClock,
  FiCalendar, FiTarget, FiCreditCard, FiFilter, FiHelpCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardNew = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [recipeFormOpen, setRecipeFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();

  // Recipe form handlers
  const handleRecipeSubmit = async (recipeData) => {
    try {
      if (editingRecipe) {
        const updated = await recipeService.updateRecipe(editingRecipe.id, recipeData);
        setRecipes(recipes.map(r => r.id === updated.id ? updated : r));
        toast.success('Recipe updated successfully!');
      } else {
        const newRecipe = await recipeService.createRecipe(recipeData);
        setRecipes([newRecipe, ...recipes]);
        toast.success('Recipe created successfully!');
      }
      setRecipeFormOpen(false);
      setEditingRecipe(null);
    } catch (error) {
      toast.error('Failed to save recipe');
    }
  };

  const openRecipeForm = (recipe = null) => {
    setEditingRecipe(recipe);
    setRecipeFormOpen(true);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'todos', label: 'Tasks', icon: FiCheckSquare },
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
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col">
            {/* Top Header */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <FiCreditCard className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Finance</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <select className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <FiFilter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <FiDownload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            {/* Icon Navigation Bar */}
            <div className="flex justify-center py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`p-3 rounded-lg transition-colors ${
                    activeTab === 'dashboard' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm' 
                      : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FiHome className={`w-5 h-5 ${
                    activeTab === 'dashboard' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </button>
                <button 
                  onClick={() => setActiveTab('finance')}
                  className={`p-3 rounded-lg transition-colors ${
                    activeTab === 'finance' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm' 
                      : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FiDollarSign className={`w-5 h-5 ${
                    activeTab === 'finance' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </button>
                <button 
                  onClick={() => setActiveTab('todos')}
                  className={`p-3 rounded-lg transition-colors ${
                    activeTab === 'todos' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm' 
                      : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FiCheckSquare className={`w-5 h-5 ${
                    activeTab === 'todos' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </button>
                <button 
                  onClick={() => setActiveTab('habits')}
                  className={`p-3 rounded-lg transition-colors ${
                    activeTab === 'habits' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm' 
                      : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FiTarget className={`w-5 h-5 ${
                    activeTab === 'habits' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`p-3 rounded-lg transition-colors ${
                    activeTab === 'notes' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm' 
                      : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FiFileText className={`w-5 h-5 ${
                    activeTab === 'notes' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </button>
                <button 
                  className="p-3 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <FiHelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
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

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="glass-effect backdrop-blur-xl rounded-xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl border border-white/20"
        >
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'todos' && <TodoSection />}
          {activeTab === 'habits' && <HabitTracker />}
          {activeTab === 'notes' && <NotesSection />}
          {activeTab === 'recipes' && (
            <RecipesSection 
              onOpenForm={openRecipeForm}
              recipes={recipes}
              setRecipes={setRecipes}
            />
          )}
          {activeTab === 'finance' && <FinanceSection />}
        </motion.div>
      </main>

      {/* Recipe Form Modal - Rendered outside main container */}
      <RecipeForm
        isOpen={recipeFormOpen}
        onClose={() => {
          setRecipeFormOpen(false);
          setEditingRecipe(null);
        }}
        onSubmit={handleRecipeSubmit}
        editingRecipe={editingRecipe}
      />
    </div>
  );
};

export default DashboardNew;
