import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { migrationHelper } from '../utils/migrationHelper';
import { FiDatabase, FiCloud, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const DataMigration = ({ onClose, onComplete }) => {
  const { user } = useAuth();
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState(null);
  const [dataPreview, setDataPreview] = useState({
    todos: 0,
    notes: 0,
    recipes: 0,
    transactions: 0,
    habits: 0
  });

  useEffect(() => {
    checkForLocalData();
  }, [user]);

  const checkForLocalData = () => {
    if (!user) return;

    // Check for existing localStorage data
    const todos = JSON.parse(localStorage.getItem('todo_app_todos') || '[]');
    const notes = JSON.parse(localStorage.getItem('todo_app_notes') || '[]');
    const recipes = JSON.parse(localStorage.getItem('todo_app_recipes') || '[]');
    const transactions = JSON.parse(localStorage.getItem('todo_app_transactions') || '[]');
    const habits = JSON.parse(localStorage.getItem(`habits_${user.id}`) || '[]');

    const userTodos = todos.filter(item => item.userId === user.id);
    const userNotes = notes.filter(item => item.userId === user.id);
    const userRecipes = recipes.filter(item => item.userId === user.id);
    const userTransactions = transactions.filter(item => item.userId === user.id);

    const preview = {
      todos: userTodos.length,
      notes: userNotes.length,
      recipes: userRecipes.length,
      transactions: userTransactions.length,
      habits: habits.length
    };

    setDataPreview(preview);
    
    const hasData = Object.values(preview).some(count => count > 0);
    setMigrationNeeded(hasData);
  };

  const handleMigration = async () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    setMigrating(true);
    
    try {
      // Create backup first
      toast.loading('Creating backup...', { id: 'migration-backup' });
      migrationHelper.backupLocalStorageData();
      toast.success('Backup created', { id: 'migration-backup' });

      // Perform migration
      toast.loading('Migrating your data to Firebase...', { id: 'migration-progress' });
      const results = await migrationHelper.migrateAllData(user.id);
      
      setMigrationResults(results);
      
      if (results.total.success > 0) {
        toast.success(
          `Successfully migrated ${results.total.success} items to Firebase!`,
          { id: 'migration-progress' }
        );
        
        // Clear localStorage after successful migration
        setTimeout(() => {
          migrationHelper.clearLocalStorageData(false);
          if (onComplete) onComplete();
        }, 2000);
      } else {
        toast.error('No data was migrated', { id: 'migration-progress' });
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed. Please try again.', { id: 'migration-progress' });
    } finally {
      setMigrating(false);
    }
  };

  const skipMigration = () => {
    if (window.confirm('Are you sure you want to skip migration? Your local data will not be transferred to Firebase.')) {
      onClose();
    }
  };

  if (!migrationNeeded && !migrationResults) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6"
        >
          {!migrationResults ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiDatabase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Migrate to Firebase
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We found existing data in your browser
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Would you like to migrate your existing data to Firebase? This will enable:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <FiCheck className="text-green-500" />
                    Access your data from any device
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="text-green-500" />
                    Real-time synchronization
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="text-green-500" />
                    Automatic backups
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="text-green-500" />
                    Enhanced security
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Data to Migrate:
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {dataPreview.todos > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tasks:</span>
                      <span className="font-semibold">{dataPreview.todos}</span>
                    </div>
                  )}
                  {dataPreview.notes > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Notes:</span>
                      <span className="font-semibold">{dataPreview.notes}</span>
                    </div>
                  )}
                  {dataPreview.recipes > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Recipes:</span>
                      <span className="font-semibold">{dataPreview.recipes}</span>
                    </div>
                  )}
                  {dataPreview.transactions > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Transactions:</span>
                      <span className="font-semibold">{dataPreview.transactions}</span>
                    </div>
                  )}
                  {dataPreview.habits > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Habits:</span>
                      <span className="font-semibold">{dataPreview.habits}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleMigration}
                  disabled={migrating}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {migrating ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <FiCloud />
                      Migrate to Firebase
                    </>
                  )}
                </button>
                <button
                  onClick={skipMigration}
                  disabled={migrating}
                  className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                >
                  Skip for now
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                A backup will be automatically downloaded before migration
              </p>
            </>
          ) : (
            <>
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Migration Complete!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your data has been successfully migrated to Firebase
                </p>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Migration Results:
                  </h3>
                  <div className="space-y-2 text-sm">
                    {migrationResults.todos.success > 0 && (
                      <div className="flex justify-between">
                        <span>Tasks migrated:</span>
                        <span className="font-semibold">{migrationResults.todos.success}</span>
                      </div>
                    )}
                    {migrationResults.notes.success > 0 && (
                      <div className="flex justify-between">
                        <span>Notes migrated:</span>
                        <span className="font-semibold">{migrationResults.notes.success}</span>
                      </div>
                    )}
                    {migrationResults.recipes.success > 0 && (
                      <div className="flex justify-between">
                        <span>Recipes migrated:</span>
                        <span className="font-semibold">{migrationResults.recipes.success}</span>
                      </div>
                    )}
                    {migrationResults.transactions.success > 0 && (
                      <div className="flex justify-between">
                        <span>Transactions migrated:</span>
                        <span className="font-semibold">{migrationResults.transactions.success}</span>
                      </div>
                    )}
                    {migrationResults.habits.success > 0 && (
                      <div className="flex justify-between">
                        <span>Habits migrated:</span>
                        <span className="font-semibold">{migrationResults.habits.success}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between font-semibold">
                        <span>Total items:</span>
                        <span className="text-green-600 dark:text-green-400">
                          {migrationResults.total.success}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue to Dashboard
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DataMigration;
