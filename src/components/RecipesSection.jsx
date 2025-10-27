import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiClock, FiUsers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { recipeService } from '../services/api';

const RecipesSection = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servingMultipliers, setServingMultipliers] = useState({});
  const [formNutrients, setFormNutrients] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [formServings, setFormServings] = useState(1);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const data = await recipeService.getRecipes();
      setRecipes(data);
    } catch (error) {
      toast.error('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const recipeData = {
      name: formData.get('name'),
      ingredients: formData.get('ingredients'),
      instructions: formData.get('instructions'),
      prep_time: parseInt(formData.get('prep_time')) || null,
      cook_time: parseInt(formData.get('cook_time')) || null,
      servings: parseInt(formData.get('servings')) || 1,
      calories: parseFloat(formData.get('calories')) || null,
      protein: parseFloat(formData.get('protein')) || null,
      carbs: parseFloat(formData.get('carbs')) || null,
      fat: parseFloat(formData.get('fat')) || null,
      category: formData.get('category'),
    };

    try {
      if (editingRecipe) {
        const updated = await recipeService.updateRecipe(editingRecipe.id, recipeData);
        setRecipes(recipes.map(r => r.id === updated.id ? updated : r));
        toast.success('Recipe updated');
      } else {
        const newRecipe = await recipeService.createRecipe(recipeData);
        setRecipes([newRecipe, ...recipes]);
        toast.success('Recipe created');
      }
      setIsFormOpen(false);
      setEditingRecipe(null);
    } catch (error) {
      toast.error('Failed to save recipe');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await recipeService.deleteRecipe(id);
      setRecipes(recipes.filter(r => r.id !== id));
      toast.success('Recipe deleted');
    } catch (error) {
      toast.error('Failed to delete recipe');
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const NutritionBadge = ({ label, value, unit, color }) => (
    <div className={`flex flex-col items-center p-2 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg`}>
      <span className={`text-lg font-bold text-${color}-600 dark:text-${color}-400`}>
        {value || 0}{unit}
      </span>
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );

  return (
    <div>
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <button
            onClick={() => {
              setEditingRecipe(null);
              setIsFormOpen(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>New Recipe</span>
          </button>
        </div>
      </div>

      {/* Recipes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{recipe.name}</h3>
                      {recipe.category && (
                        <span className="inline-block mt-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-xs rounded-full text-primary-600 dark:text-primary-400">
                          {recipe.category}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingRecipe(recipe);
                          setIsFormOpen(true);
                        }}
                        className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="p-2 text-gray-500 hover:text-red-600"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {(recipe.prep_time || recipe.cook_time) && (
                      <div className="flex items-center space-x-1">
                        <FiClock className="w-4 h-4" />
                        <span>
                          {recipe.prep_time && `Prep: ${recipe.prep_time}min`}
                          {recipe.prep_time && recipe.cook_time && ' | '}
                          {recipe.cook_time && `Cook: ${recipe.cook_time}min`}
                        </span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center space-x-1">
                        <FiUsers className="w-4 h-4" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Serving Size Adjuster */}
                  {recipe.servings && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Adjust Serving Size:
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const newMultiplier = Math.max(0.5, (servingMultipliers[recipe.id] || 1) - 0.5);
                              setServingMultipliers({ ...servingMultipliers, [recipe.id]: newMultiplier });
                            }}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={servingMultipliers[recipe.id] || 1}
                            onChange={(e) => {
                              const value = Math.max(0.5, parseFloat(e.target.value) || 1);
                              setServingMultipliers({ ...servingMultipliers, [recipe.id]: value });
                            }}
                            className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="0.5"
                            step="0.5"
                          />
                          <button
                            onClick={() => {
                              const newMultiplier = (servingMultipliers[recipe.id] || 1) + 0.5;
                              setServingMultipliers({ ...servingMultipliers, [recipe.id]: newMultiplier });
                            }}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                          >
                            +
                          </button>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            × {recipe.servings} = {Math.round((servingMultipliers[recipe.id] || 1) * recipe.servings)} servings
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nutrition Info with Dynamic Calculation */}
                  {(recipe.calories || recipe.protein || recipe.carbs || recipe.fat) && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Nutrition per {Math.round((servingMultipliers[recipe.id] || 1) * recipe.servings)} servings:
                        </span>
                        {servingMultipliers[recipe.id] && servingMultipliers[recipe.id] !== 1 && (
                          <button
                            onClick={() => {
                              const newMultipliers = { ...servingMultipliers };
                              delete newMultipliers[recipe.id];
                              setServingMultipliers(newMultipliers);
                            }}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            Reset to original
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="flex flex-col items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {Math.round((recipe.calories || 0) * (servingMultipliers[recipe.id] || 1))}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">Calories</span>
                          {servingMultipliers[recipe.id] && servingMultipliers[recipe.id] !== 1 && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              ({recipe.calories || 0} × {servingMultipliers[recipe.id]})
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <span className="text-lg font-bold text-red-600 dark:text-red-400">
                            {Math.round((recipe.protein || 0) * (servingMultipliers[recipe.id] || 1) * 10) / 10}g
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">Protein</span>
                          {servingMultipliers[recipe.id] && servingMultipliers[recipe.id] !== 1 && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              ({recipe.protein || 0}g × {servingMultipliers[recipe.id]})
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {Math.round((recipe.carbs || 0) * (servingMultipliers[recipe.id] || 1) * 10) / 10}g
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">Carbs</span>
                          {servingMultipliers[recipe.id] && servingMultipliers[recipe.id] !== 1 && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              ({recipe.carbs || 0}g × {servingMultipliers[recipe.id]})
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                            {Math.round((recipe.fat || 0) * (servingMultipliers[recipe.id] || 1) * 10) / 10}g
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">Fat</span>
                          {servingMultipliers[recipe.id] && servingMultipliers[recipe.id] !== 1 && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              ({recipe.fat || 0}g × {servingMultipliers[recipe.id]})
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Per Serving Info */}
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">
                        Per serving: {Math.round((recipe.calories || 0) / recipe.servings)} cal | 
                        {Math.round((recipe.protein || 0) / recipe.servings * 10) / 10}g protein | 
                        {Math.round((recipe.carbs || 0) / recipe.servings * 10) / 10}g carbs | 
                        {Math.round((recipe.fat || 0) / recipe.servings * 10) / 10}g fat
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Ingredients:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{recipe.ingredients}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Instructions:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{recipe.instructions}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Recipe Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsFormOpen(false)}
            />
            {/* Modal - Centered */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ pointerEvents: 'none' }}
              onAnimationStart={() => {
                // Initialize form state when modal opens
                if (editingRecipe) {
                  setFormNutrients({
                    calories: editingRecipe.calories || 0,
                    protein: editingRecipe.protein || 0,
                    carbs: editingRecipe.carbs || 0,
                    fat: editingRecipe.fat || 0
                  });
                  setFormServings(editingRecipe.servings || 1);
                } else {
                  setFormNutrients({ calories: 0, protein: 0, carbs: 0, fat: 0 });
                  setFormServings(1);
                }
              }}
            >
              <div 
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                style={{ pointerEvents: 'auto' }}
              >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipe Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={editingRecipe?.name}
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
                        defaultValue={editingRecipe?.category || ''}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Category</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ingredients (one per line)
                    </label>
                    <textarea
                      name="ingredients"
                      rows="4"
                      defaultValue={editingRecipe?.ingredients}
                      required
                      placeholder="1 cup flour&#10;2 eggs&#10;1/2 cup milk"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instructions
                    </label>
                    <textarea
                      name="instructions"
                      rows="4"
                      defaultValue={editingRecipe?.instructions}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prep Time (min)
                      </label>
                      <input
                        type="number"
                        name="prep_time"
                        defaultValue={editingRecipe?.prep_time}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cook Time (min)
                      </label>
                      <input
                        type="number"
                        name="cook_time"
                        defaultValue={editingRecipe?.cook_time}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Servings
                      </label>
                      <input
                        type="number"
                        name="servings"
                        value={formServings}
                        onChange={(e) => setFormServings(parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Nutrition Information (total for recipe)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Enter total nutrition for the entire recipe. Per-serving values are calculated automatically.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Total Calories
                        </label>
                        <input
                          type="number"
                          name="calories"
                          value={formNutrients.calories}
                          onChange={(e) => setFormNutrients({...formNutrients, calories: parseFloat(e.target.value) || 0})}
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Per serving: {Math.round(formNutrients.calories / formServings)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Total Protein (g)
                        </label>
                        <input
                          type="number"
                          name="protein"
                          value={formNutrients.protein}
                          onChange={(e) => setFormNutrients({...formNutrients, protein: parseFloat(e.target.value) || 0})}
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Per serving: {Math.round(formNutrients.protein / formServings * 10) / 10}g
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Total Carbs (g)
                        </label>
                        <input
                          type="number"
                          name="carbs"
                          value={formNutrients.carbs}
                          onChange={(e) => setFormNutrients({...formNutrients, carbs: parseFloat(e.target.value) || 0})}
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Per serving: {Math.round(formNutrients.carbs / formServings * 10) / 10}g
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Total Fat (g)
                        </label>
                        <input
                          type="number"
                          name="fat"
                          value={formNutrients.fat}
                          onChange={(e) => setFormNutrients({...formNutrients, fat: parseFloat(e.target.value) || 0})}
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Per serving: {Math.round(formNutrients.fat / formServings * 10) / 10}g
                        </span>
                      </div>
                    </div>
                    
                    {/* Live Nutrition Summary */}
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Nutrition Summary for {formServings} serving{formServings > 1 ? 's' : ''}:
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Total Recipe:</span> {Math.round(formNutrients.calories)} cal
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Per Serving:</span> {Math.round(formNutrients.calories / formServings)} cal
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Macros Total:</span> {formNutrients.protein}g P | {formNutrients.carbs}g C | {formNutrients.fat}g F
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Macros/Serving:</span> {Math.round(formNutrients.protein / formServings * 10) / 10}g P | {Math.round(formNutrients.carbs / formServings * 10) / 10}g C | {Math.round(formNutrients.fat / formServings * 10) / 10}g F
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button type="submit" className="flex-1 btn-primary">
                      {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
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
    </div>
  );
};

export default RecipesSection;
