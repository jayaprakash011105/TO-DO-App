import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiEdit2, FiCheck, FiX, FiAward, FiTrendingUp, FiCalendar, FiTarget } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const UserProfile = ({ onClose }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    bio: '',
    avatar: '',
    theme: 'blue'
  });
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
    totalRecipes: 0,
    streak: 0,
    joinedDate: ''
  });

  const avatarOptions = [
    '👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓',
    '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '👨‍🚀', '👩‍🚀', '🤖', '👽'
  ];

  const themeColors = [
    { name: 'blue', gradient: 'from-blue-400 to-blue-600' },
    { name: 'purple', gradient: 'from-purple-400 to-purple-600' },
    { name: 'green', gradient: 'from-green-400 to-green-600' },
    { name: 'red', gradient: 'from-red-400 to-red-600' },
    { name: 'yellow', gradient: 'from-yellow-400 to-yellow-600' },
    { name: 'pink', gradient: 'from-pink-400 to-pink-600' }
  ];

  useEffect(() => {
    // Load profile data
    const savedProfile = localStorage.getItem(`profile_${user?.id}`);
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    } else {
      setProfileData(prev => ({
        ...prev,
        displayName: user?.username || '',
        email: user?.email || ''
      }));
    }

    // Calculate stats
    const todos = JSON.parse(localStorage.getItem(`todos_${user?.id}`) || '[]');
    const notes = JSON.parse(localStorage.getItem(`notes_${user?.id}`) || '[]');
    const recipes = JSON.parse(localStorage.getItem(`recipes_${user?.id}`) || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find(u => u.id === user?.id);

    setStats({
      totalTasks: todos.length,
      completedTasks: todos.filter(t => t.completed).length,
      totalNotes: notes.length,
      totalRecipes: recipes.length,
      streak: Math.floor(Math.random() * 30) + 1, // Mock streak
      joinedDate: currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Today'
    });
  }, [user]);

  const handleSave = () => {
    localStorage.setItem(`profile_${user?.id}`, JSON.stringify(profileData));
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    const savedProfile = localStorage.getItem(`profile_${user?.id}`);
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
    setIsEditing(false);
  };

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div className={`relative h-32 bg-gradient-to-r ${themeColors.find(t => t.name === profileData.theme)?.gradient || 'from-blue-400 to-blue-600'}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="relative px-8 pb-8">
          {/* Avatar */}
          <div className="absolute -top-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-6xl shadow-xl border-4 border-white dark:border-gray-800">
                {profileData.avatar || '👤'}
              </div>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg">
                  <FiEdit2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* Edit/Save buttons */}
          <div className="flex justify-end pt-4 space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FiEdit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  <FiCheck className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* User Info */}
          <div className="mt-8">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="input-field"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="input-field resize-none"
                    rows="3"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avatar
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => setProfileData(prev => ({ ...prev, avatar }))}
                        className={`p-3 text-2xl rounded-xl border-2 transition-all ${
                          profileData.avatar === avatar
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme Color
                  </label>
                  <div className="flex space-x-2">
                    {themeColors.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => setProfileData(prev => ({ ...prev, theme: theme.name }))}
                        className={`w-10 h-10 rounded-full bg-gradient-to-r ${theme.gradient} ${
                          profileData.theme === theme.name ? 'ring-4 ring-offset-2 ring-blue-500' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.displayName || user?.username}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">@{user?.username}</p>
                {profileData.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mt-3">{profileData.bio}</p>
                )}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl"
            >
              <FiTarget className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl"
            >
              <FiCheck className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl"
            >
              <FiTrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.streak}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl"
            >
              <FiAward className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalNotes + stats.totalRecipes}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Creations</p>
            </motion.div>
          </div>

          {/* Member Since */}
          <div className="flex items-center justify-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            <FiCalendar className="w-4 h-4 mr-2" />
            <span>Member since {stats.joinedDate}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;
