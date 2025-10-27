import { v4 as uuidv4 } from 'uuid';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'todo_app_users',
  CURRENT_USER: 'todo_app_current_user',
  TODOS: 'todo_app_todos',
  NOTES: 'todo_app_notes',
  RECIPES: 'todo_app_recipes',
  TOKEN: 'todo_app_token',
  TRANSACTIONS: 'todo_app_transactions',
  BUDGETS: 'todo_app_budgets'
};

// Initialize storage with default data if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TODOS)) {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RECIPES)) {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
  }
};

initializeStorage();

// User management
export const userStorage = {
  register: (userData) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    // Check if user already exists
    if (users.find(u => u.username === userData.username)) {
      throw new Error('Username already exists');
    }
    
    const newUser = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    return { ...newUser, password: undefined }; // Don't return password
  },
  
  login: (username, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    const token = btoa(`${username}:${Date.now()}`); // Simple token generation
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...user, password: undefined }));
    
    return {
      access_token: token,
      user: { ...user, password: undefined }
    };
  },
  
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
  
  getCurrentUser: () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
};

// Get current user ID
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

// Todo management
export const todoStorage = {
  getTodos: () => {
    const userId = getCurrentUserId();
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    return todos.filter(t => t.userId === userId).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  },
  
  getTodo: (id) => {
    const userId = getCurrentUserId();
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    const todo = todos.find(t => t.id === id && t.userId === userId);
    if (!todo) throw new Error('Todo not found');
    return todo;
  },
  
  createTodo: (todoData) => {
    const userId = getCurrentUserId();
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    
    const newTodo = {
      id: uuidv4(),
      ...todoData,
      userId,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    
    return newTodo;
  },
  
  updateTodo: (id, todoData) => {
    const userId = getCurrentUserId();
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    const index = todos.findIndex(t => t.id === id && t.userId === userId);
    
    if (index === -1) throw new Error('Todo not found');
    
    todos[index] = {
      ...todos[index],
      ...todoData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    return todos[index];
  },
  
  deleteTodo: (id) => {
    const userId = getCurrentUserId();
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    const filtered = todos.filter(t => !(t.id === id && t.userId === userId));
    
    if (filtered.length === todos.length) throw new Error('Todo not found');
    
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(filtered));
    return { success: true };
  },
  
  toggleTodo: (id) => {
    const userId = getCurrentUserId();
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    const index = todos.findIndex(t => t.id === id && t.userId === userId);
    
    if (index === -1) throw new Error('Todo not found');
    
    todos[index].completed = !todos[index].completed;
    todos[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    return todos[index];
  }
};

// Note management
export const noteStorage = {
  getNotes: () => {
    const userId = getCurrentUserId();
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    return notes.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  },
  
  createNote: (noteData) => {
    const userId = getCurrentUserId();
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    
    const newNote = {
      id: uuidv4(),
      ...noteData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    
    return newNote;
  },
  
  updateNote: (id, noteData) => {
    const userId = getCurrentUserId();
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    const index = notes.findIndex(n => n.id === id && n.userId === userId);
    
    if (index === -1) throw new Error('Note not found');
    
    notes[index] = {
      ...notes[index],
      ...noteData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return notes[index];
  },
  
  deleteNote: (id) => {
    const userId = getCurrentUserId();
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    const filtered = notes.filter(n => !(n.id === id && n.userId === userId));
    
    if (filtered.length === notes.length) throw new Error('Note not found');
    
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
    return { success: true };
  }
};

// Recipe management
export const recipeStorage = {
  getRecipes: (category = null) => {
    const userId = getCurrentUserId();
    let recipes = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECIPES) || '[]');
    recipes = recipes.filter(r => r.userId === userId);
    
    if (category) {
      recipes = recipes.filter(r => r.category === category);
    }
    
    return recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  createRecipe: (recipeData) => {
    const userId = getCurrentUserId();
    const recipes = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECIPES) || '[]');
    
    const newRecipe = {
      id: uuidv4(),
      ...recipeData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    recipes.push(newRecipe);
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    
    return newRecipe;
  },
  
  updateRecipe: (id, recipeData) => {
    const userId = getCurrentUserId();
    const recipes = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECIPES) || '[]');
    const index = recipes.findIndex(r => r.id === id && r.userId === userId);
    
    if (index === -1) throw new Error('Recipe not found');
    
    recipes[index] = {
      ...recipes[index],
      ...recipeData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    return recipes[index];
  },
  
  deleteRecipe: (id) => {
    const userId = getCurrentUserId();
    const recipes = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECIPES) || '[]');
    const filtered = recipes.filter(r => !(r.id === id && r.userId === userId));
    
    if (filtered.length === recipes.length) throw new Error('Recipe not found');
    
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(filtered));
    return { success: true };
  }
};

// Finance management
export const financeStorage = {
  // Transaction management
  getTransactions: (filters = {}) => {
    const userId = getCurrentUserId();
    let transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    transactions = transactions.filter(t => t.userId === userId);
    
    // Apply filters
    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }
    if (filters.category) {
      transactions = transactions.filter(t => t.category === filters.category);
    }
    if (filters.startDate) {
      transactions = transactions.filter(t => new Date(t.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      transactions = transactions.filter(t => new Date(t.date) <= new Date(filters.endDate));
    }
    
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  
  createTransaction: (transactionData) => {
    const userId = getCurrentUserId();
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    
    const newTransaction = {
      id: uuidv4(),
      ...transactionData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    
    return newTransaction;
  },
  
  updateTransaction: (id, transactionData) => {
    const userId = getCurrentUserId();
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const index = transactions.findIndex(t => t.id === id && t.userId === userId);
    
    if (index === -1) throw new Error('Transaction not found');
    
    transactions[index] = {
      ...transactions[index],
      ...transactionData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return transactions[index];
  },
  
  deleteTransaction: (id) => {
    const userId = getCurrentUserId();
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const filtered = transactions.filter(t => !(t.id === id && t.userId === userId));
    
    if (filtered.length === transactions.length) throw new Error('Transaction not found');
    
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
    return { success: true };
  },
  
  // Budget management
  getBudgets: () => {
    const userId = getCurrentUserId();
    const budgets = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '[]');
    return budgets.filter(b => b.userId === userId);
  },
  
  createBudget: (budgetData) => {
    const userId = getCurrentUserId();
    const budgets = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '[]');
    
    const newBudget = {
      id: uuidv4(),
      ...budgetData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    budgets.push(newBudget);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    
    return newBudget;
  },
  
  updateBudget: (id, budgetData) => {
    const userId = getCurrentUserId();
    const budgets = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '[]');
    const index = budgets.findIndex(b => b.id === id && b.userId === userId);
    
    if (index === -1) throw new Error('Budget not found');
    
    budgets[index] = {
      ...budgets[index],
      ...budgetData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return budgets[index];
  },
  
  deleteBudget: (id) => {
    const userId = getCurrentUserId();
    const budgets = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '[]');
    const filtered = budgets.filter(b => !(b.id === id && b.userId === userId));
    
    if (filtered.length === budgets.length) throw new Error('Budget not found');
    
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(filtered));
    return { success: true };
  },
  
  // Analytics
  getFinancialSummary: (period = 'month') => {
    const userId = getCurrentUserId();
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]')
      .filter(t => t.userId === userId);
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }
    
    const periodTransactions = transactions.filter(t => new Date(t.date) >= startDate);
    
    const income = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const balance = income - expenses;
    
    // Group expenses by category
    const expensesByCategory = {};
    periodTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!expensesByCategory[t.category]) {
          expensesByCategory[t.category] = 0;
        }
        expensesByCategory[t.category] += t.amount || 0;
      });
    
    return {
      income,
      expenses,
      balance,
      expensesByCategory,
      transactionCount: periodTransactions.length
    };
  }
};
