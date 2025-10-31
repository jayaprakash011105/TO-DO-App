import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// Todo Service
export const todoService = {
  async getTodos() {
    try {
      const userId = getCurrentUserId();
      // Try with orderBy first, fall back to simple query if index not created
      let snapshot;
      try {
        const q = query(
          collection(db, 'todos'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        snapshot = await getDocs(q);
      } catch (indexError) {
        // If index error, use simple query without ordering
        console.log('Index not created yet for todos, using simple query');
        const q = query(
          collection(db, 'todos'),
          where('userId', '==', userId)
        );
        snapshot = await getDocs(q);
      }
      
      const todos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort client-side if needed
      return todos.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error fetching todos:', error);
      return [];
    }
  },

  async createTodo(todoData) {
    try {
      const userId = getCurrentUserId();
      const docRef = await addDoc(collection(db, 'todos'), {
        ...todoData,
        userId,
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...todoData,
        userId,
        completed: false
      };
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },

  async updateTodo(id, updates) {
    try {
      const todoRef = doc(db, 'todos', id);
      await updateDoc(todoRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      const updatedDoc = await getDoc(todoRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  async toggleTodo(id) {
    try {
      const todoRef = doc(db, 'todos', id);
      const todoDoc = await getDoc(todoRef);
      const currentStatus = todoDoc.data().completed;
      
      await updateDoc(todoRef, {
        completed: !currentStatus,
        updatedAt: serverTimestamp()
      });
      
      return {
        id: todoDoc.id,
        ...todoDoc.data(),
        completed: !currentStatus
      };
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw error;
    }
  },

  async deleteTodo(id) {
    try {
      await deleteDoc(doc(db, 'todos', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }
};

// Notes Service
export const noteService = {
  async getNotes() {
    try {
      const userId = getCurrentUserId();
      // Try with orderBy first, fall back to simple query if index not created
      let snapshot;
      try {
        const q = query(
          collection(db, 'notes'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        snapshot = await getDocs(q);
      } catch (indexError) {
        // If index error, use simple query without ordering
        console.log('Index not created yet for notes, using simple query');
        const q = query(
          collection(db, 'notes'),
          where('userId', '==', userId)
        );
        snapshot = await getDocs(q);
      }
      
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort client-side if needed
      return notes.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  },

  async createNote(noteData) {
    try {
      const userId = getCurrentUserId();
      const docRef = await addDoc(collection(db, 'notes'), {
        ...noteData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...noteData,
        userId
      };
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  async updateNote(id, updates) {
    try {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      const updatedDoc = await getDoc(noteRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  async deleteNote(id) {
    try {
      await deleteDoc(doc(db, 'notes', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
};

// Recipe Service
export const recipeService = {
  async getRecipes() {
    try {
      const userId = getCurrentUserId();
      // Try with orderBy first, fall back to simple query if index not created
      let snapshot;
      try {
        const q = query(
          collection(db, 'recipes'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        snapshot = await getDocs(q);
      } catch (indexError) {
        // If index error, use simple query without ordering
        console.log('Index not created yet for recipes, using simple query');
        const q = query(
          collection(db, 'recipes'),
          where('userId', '==', userId)
        );
        snapshot = await getDocs(q);
      }
      
      const recipes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort client-side if needed
      return recipes.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  },

  async createRecipe(recipeData) {
    try {
      const userId = getCurrentUserId();
      const docRef = await addDoc(collection(db, 'recipes'), {
        ...recipeData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...recipeData,
        userId
      };
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  async updateRecipe(id, updates) {
    try {
      const recipeRef = doc(db, 'recipes', id);
      await updateDoc(recipeRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      const updatedDoc = await getDoc(recipeRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  },

  async deleteRecipe(id) {
    try {
      await deleteDoc(doc(db, 'recipes', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  }
};

// Finance Service
export const financeService = {
  async getTransactions() {
    try {
      const userId = getCurrentUserId();
      // Try with orderBy first, fall back to simple query if index not created
      let snapshot;
      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', userId),
          orderBy('date', 'desc')
        );
        snapshot = await getDocs(q);
      } catch (indexError) {
        // If index error, use simple query without ordering
        console.log('Index not created yet, using simple query');
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', userId)
        );
        snapshot = await getDocs(q);
      }
      
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort client-side if needed
      return transactions.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },

  async createTransaction(transactionData) {
    try {
      const userId = getCurrentUserId();
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...transactionData,
        userId
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  async updateTransaction(id, updates) {
    try {
      const transactionRef = doc(db, 'transactions', id);
      await updateDoc(transactionRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      const updatedDoc = await getDoc(transactionRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id) {
    try {
      await deleteDoc(doc(db, 'transactions', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  async getBudgets() {
    try {
      const userId = getCurrentUserId();
      // Try with orderBy first, fall back to simple query if index not created
      let snapshot;
      try {
        const q = query(
          collection(db, 'budgets'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        snapshot = await getDocs(q);
      } catch (indexError) {
        // If index error, use simple query without ordering
        console.log('Index not created yet for budgets, using simple query');
        const q = query(
          collection(db, 'budgets'),
          where('userId', '==', userId)
        );
        snapshot = await getDocs(q);
      }
      
      const budgets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort client-side if needed
      return budgets.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  },

  async createBudget(budgetData) {
    try {
      const userId = getCurrentUserId();
      const docRef = await addDoc(collection(db, 'budgets'), {
        ...budgetData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...budgetData,
        userId
      };
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },

  async updateBudget(id, updates) {
    try {
      const budgetRef = doc(db, 'budgets', id);
      await updateDoc(budgetRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      const updatedDoc = await getDoc(budgetRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  },

  async deleteBudget(id) {
    try {
      await deleteDoc(doc(db, 'budgets', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  },

  async getSummary() {
    try {
      const transactions = await this.getTransactions();
      const budgets = await this.getBudgets();
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Calculate totals from transactions
      let totalIncome = 0;
      let totalExpenses = 0;
      let monthlyIncome = 0;
      let monthlyExpenses = 0;
      
      transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount) || 0;
        const transactionDate = transaction.date ? new Date(transaction.date) : new Date();
        const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                              transactionDate.getFullYear() === currentYear;
        
        if (transaction.type === 'income') {
          totalIncome += amount;
          if (isCurrentMonth) monthlyIncome += amount;
        } else if (transaction.type === 'expense') {
          totalExpenses += amount;
          if (isCurrentMonth) monthlyExpenses += amount;
        }
      });
      
      return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses,
        monthlyBalance: monthlyIncome - monthlyExpenses,
        budgets: budgets.length,
        transactions: transactions.length
      };
    } catch (error) {
      console.error('Error getting financial summary:', error);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlyBalance: 0,
        budgets: 0,
        transactions: 0
      };
    }
  }
};

// Habits Service
export const habitService = {
  async getHabits() {
    try {
      const userId = getCurrentUserId();
      // Try with orderBy first, fall back to simple query if index not created
      let snapshot;
      try {
        const q = query(
          collection(db, 'habits'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        snapshot = await getDocs(q);
      } catch (indexError) {
        // If index error, use simple query without ordering
        console.log('Index not created yet for habits, using simple query');
        const q = query(
          collection(db, 'habits'),
          where('userId', '==', userId)
        );
        snapshot = await getDocs(q);
      }
      
      const habits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort client-side if needed
      return habits.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error fetching habits:', error);
      return [];
    }
  },

  async createHabit(habitData) {
    try {
      const userId = getCurrentUserId();
      const docRef = await addDoc(collection(db, 'habits'), {
        ...habitData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...habitData,
        userId
      };
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  },

  async updateHabit(id, updates) {
    try {
      const habitRef = doc(db, 'habits', id);
      await updateDoc(habitRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      const updatedDoc = await getDoc(habitRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  },

  async deleteHabit(id) {
    try {
      await deleteDoc(doc(db, 'habits', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }
};
