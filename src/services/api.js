// Import local storage services
import { 
  userStorage, 
  todoStorage, 
  noteStorage, 
  recipeStorage,
  financeStorage 
} from './localStorage';

// Simulate async behavior for a more realistic feel
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Auth service using local storage
export const authService = {
  register: async (userData) => {
    await delay();
    try {
      const user = userStorage.register(userData);
      return user;
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  login: async (username, password) => {
    await delay();
    try {
      const result = userStorage.login(username, password);
      return result;
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  logout: () => {
    userStorage.logout();
  },

  getCurrentUser: async () => {
    await delay(100);
    try {
      return userStorage.getCurrentUser();
    } catch (error) {
      throw { response: { status: 401 } };
    }
  },
};

// Todo service using local storage
export const todoService = {
  getTodos: async () => {
    await delay(200);
    try {
      return todoStorage.getTodos();
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  getTodo: async (id) => {
    await delay(100);
    try {
      return todoStorage.getTodo(id);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  createTodo: async (todoData) => {
    await delay();
    try {
      return todoStorage.createTodo(todoData);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  updateTodo: async (id, todoData) => {
    await delay();
    try {
      return todoStorage.updateTodo(id, todoData);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  deleteTodo: async (id) => {
    await delay();
    try {
      return todoStorage.deleteTodo(id);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  toggleTodo: async (id) => {
    await delay(200);
    try {
      return todoStorage.toggleTodo(id);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },
};

// Note service using local storage
export const noteService = {
  getNotes: async () => {
    await delay(200);
    try {
      return noteStorage.getNotes();
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  createNote: async (noteData) => {
    await delay();
    try {
      return noteStorage.createNote(noteData);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  updateNote: async (id, noteData) => {
    await delay();
    try {
      return noteStorage.updateNote(id, noteData);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  deleteNote: async (id) => {
    await delay();
    try {
      return noteStorage.deleteNote(id);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },
};

// Recipe service using local storage
export const recipeService = {
  getRecipes: async (category = null) => {
    await delay(200);
    try {
      return recipeStorage.getRecipes(category);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  createRecipe: async (recipeData) => {
    await delay();
    try {
      return recipeStorage.createRecipe(recipeData);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  updateRecipe: async (id, recipeData) => {
    await delay();
    try {
      return recipeStorage.updateRecipe(id, recipeData);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  deleteRecipe: async (id) => {
    await delay();
    try {
      return recipeStorage.deleteRecipe(id);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },
};

// Finance service using local storage
export const financeService = {
  getTransactions: async (filters = {}) => {
    await delay(200);
    try {
      return financeStorage.getTransactions(filters);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  createTransaction: async (transactionData) => {
    await delay();
    try {
      return financeStorage.createTransaction(transactionData);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  updateTransaction: async (id, transactionData) => {
    await delay();
    try {
      return financeStorage.updateTransaction(id, transactionData);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  deleteTransaction: async (id) => {
    await delay();
    try {
      return financeStorage.deleteTransaction(id);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  getBudgets: async () => {
    await delay(200);
    try {
      return financeStorage.getBudgets();
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  createBudget: async (budgetData) => {
    await delay();
    try {
      return financeStorage.createBudget(budgetData);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  updateBudget: async (id, budgetData) => {
    await delay();
    try {
      return financeStorage.updateBudget(id, budgetData);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  deleteBudget: async (id) => {
    await delay();
    try {
      return financeStorage.deleteBudget(id);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  },

  getFinancialSummary: async (period = 'month') => {
    await delay(100);
    try {
      return financeStorage.getFinancialSummary(period);
    } catch (error) {
      throw { response: { data: { detail: error.message } } };
    }
  }
};

// Export a default object for compatibility
export default {
  authService,
  todoService,
  noteService,
  recipeService,
  financeService
};
