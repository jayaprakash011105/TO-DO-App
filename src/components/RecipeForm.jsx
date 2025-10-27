import { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const RecipeForm = ({ isOpen, onClose, onSubmit, editingRecipe }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    ingredients: '',
    instructions: '',
    prep_time: '',
    cook_time: '',
    servings: 1,
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  useEffect(() => {
    if (editingRecipe) {
      setFormData({
        name: editingRecipe.name || '',
        category: editingRecipe.category || '',
        ingredients: editingRecipe.ingredients || '',
        instructions: editingRecipe.instructions || '',
        prep_time: editingRecipe.prep_time || '',
        cook_time: editingRecipe.cook_time || '',
        servings: editingRecipe.servings || 1,
        calories: editingRecipe.calories || '',
        protein: editingRecipe.protein || '',
        carbs: editingRecipe.carbs || '',
        fat: editingRecipe.fat || ''
      });
    } else {
      setFormData({
        name: '',
        category: '',
        ingredients: '',
        instructions: '',
        prep_time: '',
        cook_time: '',
        servings: 1,
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      });
    }
  }, [editingRecipe]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      prep_time: parseInt(formData.prep_time) || null,
      cook_time: parseInt(formData.cook_time) || null,
      servings: parseInt(formData.servings) || 1,
      calories: parseFloat(formData.calories) || null,
      protein: parseFloat(formData.protein) || null,
      carbs: parseFloat(formData.carbs) || null,
      fat: parseFloat(formData.fat) || null,
    };
    onSubmit(submitData);
    setFormData({
      name: '',
      category: '',
      ingredients: '',
      instructions: '',
      prep_time: '',
      cook_time: '',
      servings: 1,
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
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
          {/* Modal - Centered like TodoForm */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div 
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{ pointerEvents: 'auto' }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipe Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Enter recipe name"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select Category</option>
                        <option value="breakfast">🍳 Breakfast</option>
                        <option value="lunch">🥗 Lunch</option>
                        <option value="dinner">🍽️ Dinner</option>
                        <option value="snack">🍿 Snack</option>
                      </select>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ingredients
                    </label>
                    <textarea
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleChange}
                      rows="3"
                      required
                      className="input-field resize-none"
                      placeholder="List ingredients, one per line"
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instructions
                    </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      rows="4"
                      required
                      className="input-field resize-none"
                      placeholder="Step-by-step instructions"
                    />
                  </div>

                  {/* Time and Servings */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prep Time (min)
                      </label>
                      <input
                        type="number"
                        name="prep_time"
                        value={formData.prep_time}
                        onChange={handleChange}
                        min="0"
                        className="input-field"
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cook Time (min)
                      </label>
                      <input
                        type="number"
                        name="cook_time"
                        value={formData.cook_time}
                        onChange={handleChange}
                        min="0"
                        className="input-field"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Servings
                      </label>
                      <input
                        type="number"
                        name="servings"
                        value={formData.servings}
                        onChange={handleChange}
                        min="1"
                        className="input-field"
                        placeholder="4"
                      />
                    </div>
                  </div>

                  {/* Nutrition Info - Optional Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Nutrition Information (Optional)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Calories
                        </label>
                        <input
                          type="number"
                          name="calories"
                          value={formData.calories}
                          onChange={handleChange}
                          min="0"
                          step="0.1"
                          className="input-field"
                          placeholder="250"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          name="protein"
                          value={formData.protein}
                          onChange={handleChange}
                          min="0"
                          step="0.1"
                          className="input-field"
                          placeholder="15"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          name="carbs"
                          value={formData.carbs}
                          onChange={handleChange}
                          min="0"
                          step="0.1"
                          className="input-field"
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Fat (g)
                        </label>
                        <input
                          type="number"
                          name="fat"
                          value={formData.fat}
                          onChange={handleChange}
                          min="0"
                          step="0.1"
                          className="input-field"
                          placeholder="10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <FiPlus className="w-5 h-5" />
                      <span>{editingRecipe ? 'Update Recipe' : 'Add Recipe'}</span>
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

export default RecipeForm;
