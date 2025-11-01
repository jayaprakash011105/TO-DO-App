import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import DataMigration from '../components/DataMigration';
import TodoSection from '../components/TodoSection';
import NotesSection from '../components/NotesSection';
import RecipesSection from '../components/RecipesSection';
import RecipeForm from '../components/RecipeForm';
import FinanceSection from '../components/FinanceSection';
import UserProfile from '../components/UserProfile';
import PomodoroTimer from '../components/PomodoroTimer';
import Dashboard from '../components/Dashboard';
// Use Firebase API instead of localStorage API
import { recipeService } from '../services/firebaseApi';
import toast from 'react-hot-toast';
import { 
  FiLogOut, FiSun, FiMoon, FiCheckSquare, FiFileText, 
  FiBook, FiDollarSign, FiUser, FiSearch, FiHome,
  FiCommand, FiBell, FiDownload, FiUpload, FiClock,
  FiCalendar, FiTarget
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
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [showMigration, setShowMigration] = useState(false);
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
    { id: 'finance', label: 'Finance', icon: FiDollarSign },
    { id: 'todos', label: 'Tasks', icon: FiCheckSquare },
    { id: 'notes', label: 'Notes', icon: FiFileText },
    { id: 'recipes', label: 'Recipes', icon: FiBook },
  ];

  // Check for migration on mount
  useEffect(() => {
    if (user) {
      // Check if user has local data that needs migration
      const checkMigration = () => {
        const todos = JSON.parse(localStorage.getItem('todo_app_todos') || '[]');
        const notes = JSON.parse(localStorage.getItem('todo_app_notes') || '[]');
        const recipes = JSON.parse(localStorage.getItem('todo_app_recipes') || '[]');
        
        const hasLocalData = todos.some(t => t.userId === user.id) ||
                            notes.some(n => n.userId === user.id) ||
                            recipes.some(r => r.userId === user.id);
        
        if (hasLocalData) {
          setShowMigration(true);
        }
      };
      
      // Check after a short delay to ensure user is loaded
      setTimeout(checkMigration, 1000);
    }
  }, [user]);

  // Load pending tasks count (now from Firebase)
  useEffect(() => {
    const loadPendingTasksCount = () => {
      // This will now be handled by Firebase real-time listeners
      // For now, keep it at 0 until Firebase data loads
      setPendingTasksCount(0);
    };

    loadPendingTasksCount();
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'k':
            e.preventDefault();
            setShowSearch(!showSearch);
            break;
          case '1':
            setActiveTab('dashboard');
            break;
          case '2':
            setActiveTab('finance');
            break;
          case '3':
            setActiveTab('todos');
            break;
          case '4':
            setActiveTab('notes');
            break;
          case '5':
            setActiveTab('recipes');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  const exportData = async () => {
    toast.loading('Exporting data from Firebase...', { id: 'export' });
    
    try {
      // Import all Firebase services
      const { todoService, noteService, financeService } = await import('../services/firebaseApi');
      
      // Fetch all data from Firebase
      const [todos, notes, recipes, transactions] = await Promise.all([
        todoService.getTodos(),
        noteService.getNotes(),
        recipeService.getRecipes(),
        financeService.getTransactions()
      ]);
      
      const data = {
        todos,
        notes,
        recipes,
        transactions,
        user: {
          id: user?.id,
          email: user?.email,
          username: user?.username
        },
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      toast.success('Data exported from Firebase successfully!', { id: 'export' });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data', { id: 'export' });
    }
  };

  const importData = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          toast.loading('Importing data to Firebase...', { id: 'import' });
          
          // Import all Firebase services
          const { todoService, noteService, financeService } = await import('../services/firebaseApi');
          
          // Import todos
          if (data.todos && Array.isArray(data.todos)) {
            for (const todo of data.todos) {
              await todoService.createTodo(todo);
            }
          }
          
          // Import notes
          if (data.notes && Array.isArray(data.notes)) {
            for (const note of data.notes) {
              await noteService.createNote(note);
            }
          }
          
          // Import recipes
          if (data.recipes && Array.isArray(data.recipes)) {
            for (const recipe of data.recipes) {
              await recipeService.createRecipe(recipe);
            }
          }
          
          // Import transactions
          if (data.transactions && Array.isArray(data.transactions)) {
            for (const transaction of data.transactions) {
              await financeService.createTransaction(transaction);
            }
          }
          
          toast.success('Data imported to Firebase successfully!', { id: 'import' });
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          console.error('Import error:', error);
          toast.error('Failed to import data', { id: 'import' });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Header */}
      <header className="glass-effect backdrop-blur-xl shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowProfile(true)}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg hover:shadow-lg transition-shadow flex-shrink-0"
              >
                {user?.username?.charAt(0).toUpperCase()}
              </button>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold gradient-text">My Workspace</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.username}!
                </p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-lg font-bold gradient-text">Workspace</h1>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Pomodoro Timer - Hidden on mobile */}
              <button
                onClick={() => setShowPomodoro(true)}
                className="hidden sm:block p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
                title="Pomodoro Timer"
              >
                <FiClock className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
              
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
                title="Search (Ctrl+K)"
              >
                <FiSearch className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
              
              {/* Notifications - Hidden on mobile */}
              <button
                className="hidden sm:block relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
              >
                <FiBell className="w-4 sm:w-5 h-4 sm:h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 sm:w-5 h-4 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              {/* Export/Import - Hidden on mobile */}
              <button
                onClick={exportData}
                className="hidden sm:block p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
                title="Export Data"
              >
                <FiDownload className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
              
              <label className="hidden sm:block p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg cursor-pointer">
                <FiUpload className="w-4 sm:w-5 h-4 sm:h-5" />
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
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <FiSun className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500" /> : <FiMoon className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />}
              </button>
              
              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 hover:shadow-lg"
              >
                <FiLogOut className="w-4 sm:w-5 h-4 sm:h-5" />
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

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Tab Navigation - Icon Only */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-3 rounded-lg transition-all duration-200 relative ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400'
                      : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5" />
                  {tab.id === 'todos' && pendingTasksCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                      {pendingTasksCount > 9 ? '9+' : pendingTasksCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

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

      {/* Data Migration Modal */}
      {showMigration && (
        <DataMigration
          onClose={() => setShowMigration(false)}
          onComplete={() => {
            setShowMigration(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default DashboardNew;
