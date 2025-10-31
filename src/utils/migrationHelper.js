import { 
  todoService, 
  noteService, 
  recipeService, 
  financeService,
  habitService 
} from '../services/firebaseApi';
import toast from 'react-hot-toast';

/**
 * Migrate localStorage data to Firebase Firestore
 * This utility helps users migrate their existing data when switching to Firebase
 */
export const migrationHelper = {
  /**
   * Check if migration is needed
   * @returns {boolean} - True if localStorage has data that needs migration
   */
  checkMigrationNeeded() {
    const keys = [
      'todo_app_todos',
      'todo_app_notes',
      'todo_app_recipes',
      'todo_app_transactions',
      'finance_budgets',
      'finance_savings'
    ];
    
    return keys.some(key => {
      const data = localStorage.getItem(key);
      return data && JSON.parse(data).length > 0;
    });
  },

  /**
   * Migrate all data from localStorage to Firebase
   * @param {string} userId - The current user's ID
   * @returns {Promise<Object>} - Migration results
   */
  async migrateAllData(userId) {
    const results = {
      todos: { success: 0, failed: 0 },
      notes: { success: 0, failed: 0 },
      recipes: { success: 0, failed: 0 },
      transactions: { success: 0, failed: 0 },
      budgets: { success: 0, failed: 0 },
      habits: { success: 0, failed: 0 },
      total: { success: 0, failed: 0 }
    };

    try {
      // Show migration start toast
      toast.loading('Starting data migration...', { id: 'migration' });

      // Migrate Todos
      const todos = JSON.parse(localStorage.getItem('todo_app_todos') || '[]');
      const userTodos = todos.filter(todo => todo.userId === userId);
      
      for (const todo of userTodos) {
        try {
          await todoService.createTodo({
            title: todo.title,
            description: todo.description,
            priority: todo.priority,
            dueDate: todo.dueDate,
            completed: todo.completed || false
          });
          results.todos.success++;
        } catch (error) {
          console.error('Failed to migrate todo:', error);
          results.todos.failed++;
        }
      }

      // Migrate Notes
      const notes = JSON.parse(localStorage.getItem('todo_app_notes') || '[]');
      const userNotes = notes.filter(note => note.userId === userId);
      
      for (const note of userNotes) {
        try {
          await noteService.createNote({
            title: note.title,
            content: note.content,
            category: note.category,
            tags: note.tags || [],
            color: note.color
          });
          results.notes.success++;
        } catch (error) {
          console.error('Failed to migrate note:', error);
          results.notes.failed++;
        }
      }

      // Migrate Recipes
      const recipes = JSON.parse(localStorage.getItem('todo_app_recipes') || '[]');
      const userRecipes = recipes.filter(recipe => recipe.userId === userId);
      
      for (const recipe of userRecipes) {
        try {
          await recipeService.createRecipe({
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
            category: recipe.category,
            tags: recipe.tags || [],
            imageUrl: recipe.imageUrl
          });
          results.recipes.success++;
        } catch (error) {
          console.error('Failed to migrate recipe:', error);
          results.recipes.failed++;
        }
      }

      // Migrate Transactions
      const transactions = JSON.parse(localStorage.getItem('todo_app_transactions') || '[]');
      const userTransactions = transactions.filter(t => t.userId === userId);
      
      for (const transaction of userTransactions) {
        try {
          await financeService.createTransaction({
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description,
            date: transaction.date,
            account: transaction.account
          });
          results.transactions.success++;
        } catch (error) {
          console.error('Failed to migrate transaction:', error);
          results.transactions.failed++;
        }
      }

      // Migrate Budgets
      const budgets = JSON.parse(localStorage.getItem('finance_budgets') || '[]');
      
      for (const budget of budgets) {
        try {
          await financeService.createBudget({
            category: budget.category,
            amount: budget.amount,
            period: budget.period || 'monthly'
          });
          results.budgets.success++;
        } catch (error) {
          console.error('Failed to migrate budget:', error);
          results.budgets.failed++;
        }
      }

      // Migrate Habits
      const habits = JSON.parse(localStorage.getItem(`habits_${userId}`) || '[]');
      
      for (const habit of habits) {
        try {
          await habitService.createHabit({
            name: habit.name,
            description: habit.description,
            frequency: habit.frequency,
            target: habit.target,
            unit: habit.unit,
            color: habit.color,
            icon: habit.icon,
            completedDates: habit.completedDates || [],
            streak: habit.streak || 0,
            bestStreak: habit.bestStreak || 0
          });
          results.habits.success++;
        } catch (error) {
          console.error('Failed to migrate habit:', error);
          results.habits.failed++;
        }
      }

      // Calculate totals
      results.total.success = Object.values(results)
        .filter(r => r !== results.total)
        .reduce((sum, r) => sum + r.success, 0);
      
      results.total.failed = Object.values(results)
        .filter(r => r !== results.total)
        .reduce((sum, r) => sum + r.failed, 0);

      // Show completion toast
      toast.success(
        `Migration completed! ${results.total.success} items migrated successfully.`,
        { id: 'migration' }
      );

      if (results.total.failed > 0) {
        toast.error(`${results.total.failed} items failed to migrate. Check console for details.`);
      }

      return results;
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed. Please try again.', { id: 'migration' });
      throw error;
    }
  },

  /**
   * Backup localStorage data before migration
   * @returns {Object} - Backup data
   */
  backupLocalStorageData() {
    const backup = {
      timestamp: new Date().toISOString(),
      data: {}
    };

    const keys = [
      'todo_app_todos',
      'todo_app_notes',
      'todo_app_recipes',
      'todo_app_transactions',
      'finance_budgets',
      'finance_savings',
      'habits_'
    ];

    keys.forEach(key => {
      // For habits, we need to find all user-specific keys
      if (key === 'habits_') {
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.startsWith(key)) {
            backup.data[storageKey] = localStorage.getItem(storageKey);
          }
        });
      } else {
        const data = localStorage.getItem(key);
        if (data) {
          backup.data[key] = data;
        }
      }
    });

    // Save backup to a file
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-app-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return backup;
  },

  /**
   * Clear localStorage after successful migration
   * @param {boolean} createBackup - Whether to create a backup before clearing
   */
  clearLocalStorageData(createBackup = true) {
    if (createBackup) {
      this.backupLocalStorageData();
    }

    const keys = [
      'todo_app_todos',
      'todo_app_notes',
      'todo_app_recipes',
      'todo_app_transactions',
      'finance_budgets',
      'finance_savings'
    ];

    keys.forEach(key => localStorage.removeItem(key));

    // Clear user-specific habit keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('habits_')) {
        localStorage.removeItem(key);
      }
    });

    toast.success('Local data cleared successfully');
  }
};

export default migrationHelper;
