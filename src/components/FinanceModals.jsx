import { motion } from 'framer-motion';

export const TransactionModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingTransaction, 
  incomeCategories, 
  expenseCategories 
}) => {
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  defaultValue={editingTransaction?.type || 'expense'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onChange={(e) => {
                    const categorySelect = e.target.form.category;
                    categorySelect.innerHTML = '';
                    const categories = e.target.value === 'income' ? incomeCategories : expenseCategories;
                    categories.forEach(cat => {
                      const option = document.createElement('option');
                      option.value = cat;
                      option.text = cat;
                      categorySelect.add(option);
                    });
                  }}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  defaultValue={editingTransaction?.amount}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  defaultValue={editingTransaction?.category}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {(editingTransaction?.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  defaultValue={editingTransaction?.description}
                  placeholder="Optional description"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={editingTransaction?.date?.split('T')[0] || new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {editingTransaction ? 'Update' : 'Add'}
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
  );
};

export const BudgetModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingBudget, 
  expenseCategories 
}) => {
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingBudget ? 'Edit Budget' : 'Create Budget'}
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  defaultValue={editingBudget?.category}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  defaultValue={editingBudget?.amount}
                  required
                  placeholder="Enter budget amount"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Period
                </label>
                <select
                  name="period"
                  defaultValue={editingBudget?.period || 'monthly'}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {editingBudget ? 'Update' : 'Create'}
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
  );
};
