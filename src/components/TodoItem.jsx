import { useState } from 'react';
import { FiCheck, FiEdit2, FiTrash2, FiCalendar, FiFlag } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const TodoItem = ({ todo, onToggle, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const priorityColors = {
    low: 'text-green-500 bg-green-50',
    medium: 'text-yellow-500 bg-yellow-50',
    high: 'text-red-500 bg-red-50',
  };

  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3 transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-3">
        <button
          onClick={() => onToggle(todo.id)}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 ${
            todo.completed
              ? 'bg-primary-600 border-primary-600'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          {todo.completed && (
            <FiCheck className="w-3 h-3 text-white m-auto" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className={`text-lg font-medium transition-all duration-200 ${
                  todo.completed
                    ? 'text-gray-400 line-through'
                    : 'text-gray-900'
                }`}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p
                  className={`mt-1 text-sm transition-all duration-200 ${
                    todo.completed ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {todo.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    priorityColors[todo.priority]
                  }`}
                >
                  <FiFlag className="w-3 h-3 mr-1" />
                  {todo.priority}
                </span>
                
                {todo.due_date && (
                  <span className="inline-flex items-center text-xs text-gray-500">
                    <FiCalendar className="w-3 h-3 mr-1" />
                    {format(new Date(todo.due_date), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`flex items-center space-x-2 transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button
                onClick={() => onEdit(todo)}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TodoItem;
