// Sample data generator for testing
import { v4 as uuidv4 } from 'uuid';

export const generateSampleData = (userId) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Sample todos
  const sampleTodos = [
    {
      id: uuidv4(),
      userId,
      title: "Complete project documentation",
      description: "Write comprehensive docs for the new feature",
      priority: "high",
      completed: false,
      createdAt: today.toISOString(),
      dueDate: tomorrow.toISOString()
    },
    {
      id: uuidv4(),
      userId,
      title: "Review pull requests",
      description: "Check team's code submissions",
      priority: "medium",
      completed: true,
      createdAt: yesterday.toISOString(),
      dueDate: today.toISOString()
    },
    {
      id: uuidv4(),
      userId,
      title: "Team meeting",
      description: "Weekly sync with the team",
      priority: "high",
      completed: false,
      createdAt: today.toISOString(),
      dueDate: today.toISOString()
    },
    {
      id: uuidv4(),
      userId,
      title: "Update dependencies",
      description: "Update npm packages",
      priority: "low",
      completed: false,
      createdAt: yesterday.toISOString(),
      dueDate: nextWeek.toISOString()
    },
    {
      id: uuidv4(),
      userId,
      title: "Write unit tests",
      description: "Add tests for new components",
      priority: "medium",
      completed: true,
      createdAt: yesterday.toISOString(),
      dueDate: yesterday.toISOString()
    }
  ];

  // Sample notes
  const sampleNotes = [
    {
      id: uuidv4(),
      userId,
      title: "Meeting Notes",
      content: "Discussed project timeline and deliverables",
      category: "work",
      createdAt: today.toISOString(),
      updatedAt: today.toISOString()
    },
    {
      id: uuidv4(),
      userId,
      title: "Ideas for new features",
      content: "1. Dark mode\n2. Export functionality\n3. Collaboration tools",
      category: "personal",
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString()
    }
  ];

  // Sample recipes
  const sampleRecipes = [
    {
      id: uuidv4(),
      userId,
      name: "Spaghetti Carbonara",
      ingredients: "Pasta, Eggs, Bacon, Parmesan, Black pepper",
      instructions: "Cook pasta, fry bacon, mix eggs with cheese, combine all",
      category: "dinner",
      prep_time: 20,
      cook_time: 15,
      servings: 4,
      createdAt: yesterday.toISOString()
    },
    {
      id: uuidv4(),
      userId,
      name: "Green Smoothie",
      ingredients: "Spinach, Banana, Apple, Yogurt, Honey",
      instructions: "Blend all ingredients until smooth",
      category: "breakfast",
      prep_time: 5,
      cook_time: 0,
      servings: 1,
      createdAt: today.toISOString()
    }
  ];

  // Sample transactions
  const sampleTransactions = [
    {
      id: uuidv4(),
      userId,
      type: "income",
      amount: 3000,
      category: "Salary",
      description: "Monthly salary",
      date: today.toISOString(),
      createdAt: today.toISOString()
    },
    {
      id: uuidv4(),
      userId,
      type: "expense",
      amount: 50,
      category: "Food",
      description: "Groceries",
      date: yesterday.toISOString(),
      createdAt: yesterday.toISOString()
    },
    {
      id: uuidv4(),
      userId,
      type: "expense",
      amount: 100,
      category: "Transport",
      description: "Gas for car",
      date: today.toISOString(),
      createdAt: today.toISOString()
    },
    {
      id: uuidv4(),
      userId,
      type: "expense",
      amount: 30,
      category: "Entertainment",
      description: "Movie tickets",
      date: yesterday.toISOString(),
      createdAt: yesterday.toISOString()
    },
    {
      id: uuidv4(),
      userId,
      type: "income",
      amount: 500,
      category: "Freelance",
      description: "Web design project",
      date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Sample events
  const sampleEvents = [
    {
      id: uuidv4(),
      userId,
      title: "Project Deadline",
      date: tomorrow.toISOString(),
      time: "17:00",
      category: "deadline",
      description: "Submit final project",
      color: "#ef4444"
    },
    {
      id: uuidv4(),
      userId,
      title: "Team Meeting",
      date: today.toISOString(),
      time: "14:00",
      category: "meeting",
      description: "Weekly standup",
      color: "#3b82f6"
    },
    {
      id: uuidv4(),
      userId,
      title: "Doctor Appointment",
      date: nextWeek.toISOString(),
      time: "10:00",
      category: "personal",
      description: "Annual checkup",
      color: "#10b981"
    }
  ];

  // Sample habits
  const sampleHabits = [
    {
      id: uuidv4(),
      userId,
      name: "Morning Exercise",
      icon: "💪",
      color: "from-blue-500 to-blue-600",
      category: "health",
      targetDays: 7,
      isActive: true,
      createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      userId,
      name: "Read 30 minutes",
      icon: "📚",
      color: "from-purple-500 to-purple-600",
      category: "learning",
      targetDays: 5,
      isActive: true,
      createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      userId,
      name: "Meditate",
      icon: "🧘",
      color: "from-green-500 to-green-600",
      category: "wellness",
      targetDays: 7,
      isActive: true,
      createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Sample habit logs
  const sampleHabitLogs = [];
  sampleHabits.forEach(habit => {
    // Create logs for the past 7 days
    for (let i = 0; i < 7; i++) {
      const logDate = new Date(today);
      logDate.setDate(logDate.getDate() - i);
      
      // Randomly mark some as completed
      if (Math.random() > 0.3) {
        sampleHabitLogs.push({
          id: uuidv4(),
          userId,
          habitId: habit.id,
          date: logDate.toISOString(),
          completed: true,
          createdAt: logDate.toISOString()
        });
      }
    }
  });

  return {
    todos: sampleTodos,
    notes: sampleNotes,
    recipes: sampleRecipes,
    transactions: sampleTransactions,
    events: sampleEvents,
    habits: sampleHabits,
    habitLogs: sampleHabitLogs
  };
};

// Function to populate localStorage with sample data
export const populateSampleData = () => {
  const currentUser = JSON.parse(localStorage.getItem('todo_app_current_user') || 'null');
  
  if (!currentUser) {
    console.error('No user logged in');
    return false;
  }

  const sampleData = generateSampleData(currentUser.id);

  // Get existing data
  const existingTodos = JSON.parse(localStorage.getItem('todo_app_todos') || '[]');
  const existingNotes = JSON.parse(localStorage.getItem('todo_app_notes') || '[]');
  const existingRecipes = JSON.parse(localStorage.getItem('todo_app_recipes') || '[]');
  const existingTransactions = JSON.parse(localStorage.getItem('todo_app_transactions') || '[]');

  // Merge with sample data (avoiding duplicates)
  localStorage.setItem('todo_app_todos', JSON.stringify([...existingTodos, ...sampleData.todos]));
  localStorage.setItem('todo_app_notes', JSON.stringify([...existingNotes, ...sampleData.notes]));
  localStorage.setItem('todo_app_recipes', JSON.stringify([...existingRecipes, ...sampleData.recipes]));
  localStorage.setItem('todo_app_transactions', JSON.stringify([...existingTransactions, ...sampleData.transactions]));
  
  // Store events and habits with user-specific keys
  localStorage.setItem(`events_${currentUser.id}`, JSON.stringify(sampleData.events));
  localStorage.setItem(`habits_${currentUser.id}`, JSON.stringify(sampleData.habits));
  localStorage.setItem(`habitLogs_${currentUser.id}`, JSON.stringify(sampleData.habitLogs));

  console.log('Sample data populated successfully!');
  return true;
};

// Function to clear all user data
export const clearUserData = () => {
  const currentUser = JSON.parse(localStorage.getItem('todo_app_current_user') || 'null');
  
  if (!currentUser) {
    console.error('No user logged in');
    return false;
  }

  // Clear main data
  const todos = JSON.parse(localStorage.getItem('todo_app_todos') || '[]');
  const notes = JSON.parse(localStorage.getItem('todo_app_notes') || '[]');
  const recipes = JSON.parse(localStorage.getItem('todo_app_recipes') || '[]');
  const transactions = JSON.parse(localStorage.getItem('todo_app_transactions') || '[]');

  // Filter out current user's data
  localStorage.setItem('todo_app_todos', JSON.stringify(todos.filter(t => t.userId !== currentUser.id)));
  localStorage.setItem('todo_app_notes', JSON.stringify(notes.filter(n => n.userId !== currentUser.id)));
  localStorage.setItem('todo_app_recipes', JSON.stringify(recipes.filter(r => r.userId !== currentUser.id)));
  localStorage.setItem('todo_app_transactions', JSON.stringify(transactions.filter(t => t.userId !== currentUser.id)));

  // Clear user-specific data
  localStorage.removeItem(`events_${currentUser.id}`);
  localStorage.removeItem(`habits_${currentUser.id}`);
  localStorage.removeItem(`habitLogs_${currentUser.id}`);

  console.log('User data cleared successfully!');
  return true;
};
