import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { todoService } from '../services/api';
import TodoItem from '../components/TodoItem';
import TodoForm from '../components/TodoForm';
import { FiPlus, FiLogOut, FiFilter, FiSearch, FiCheckCircle, FiCircle, FiList } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created');

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    filterAndSortTodos();
  }, [todos, filter, searchTerm, sortBy]);

  const fetchTodos = async () => {
    try {
      const data = await todoService.getTodos();
      setTodos(data);
    } catch (error) {
      toast.error('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTodos = () => {
    let filtered = [...todos];

    // Apply filter
    if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    } else if (filter === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredTodos(filtered);
  };

  const handleCreateOrUpdate = async (todoData) => {
    try {
      if (editingTodo) {
        const updated = await todoService.updateTodo(editingTodo.id, todoData);
        setTodos(todos.map(t => t.id === updated.id ? updated : t));
        toast.success('Task updated successfully');
      } else {
        const newTodo = await todoService.createTodo(todoData);
        setTodos([newTodo, ...todos]);
        toast.success('Task created successfully');
      }
      setIsFormOpen(false);
      setEditingTodo(null);
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await todoService.toggleTodo(id);
      setTodos(todos.map(t => t.id === updated.id ? updated : t));
      toast.success(updated.completed ? 'Task completed!' : 'Task reopened');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await todoService.deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
              <span className="ml-4 text-sm text-gray-500">
                Welcome back, {user?.username}!
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <FiList className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.active}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Tasks</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="created">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="due_date">Sort by Due Date</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingTodo(null);
                setIsFormOpen(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : filteredTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 card"
            >
              <FiList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No tasks found matching your search.' : 'No tasks yet. Create your first task!'}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Todo Form Modal */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={handleCreateOrUpdate}
        editingTodo={editingTodo}
      />
    </div>
  );
};

export default Dashboard;
