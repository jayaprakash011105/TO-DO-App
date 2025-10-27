import { useState, useEffect } from 'react';
import { FiPlus, FiX, FiCalendar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const TodoForm = ({ isOpen, onClose, onSubmit, editingTodo }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });

  useEffect(() => {
    if (editingTodo) {
      setFormData({
        title: editingTodo.title || '',
        description: editingTodo.description || '',
        priority: editingTodo.priority || 'medium',
        due_date: editingTodo.due_date ? editingTodo.due_date.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
      });
    }
  }, [editingTodo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
    };
    onSubmit(submitData);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          {/* Modal - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div 
              className="w-full max-w-md"
              style={{ pointerEvents: 'auto' }}
            >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingTodo ? 'Edit Task' : 'New Task'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="What needs to be done?"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Add more details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🔴 High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <FiPlus className="w-5 h-5" />
                    <span>{editingTodo ? 'Update Task' : 'Add Task'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TodoForm;
