import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiPause, FiRotateCcw, FiSettings, FiX,
  FiCoffee, FiTarget, FiZap, FiVolume2, FiVolumeX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PomodoroTimer = ({ onClose }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // work, shortBreak, longBreak
  const [cycles, setCycles] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(null);

  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4
  });

  const modes = {
    work: {
      name: 'Focus Time',
      duration: settings.workDuration,
      color: 'from-red-500 to-orange-500',
      icon: FiTarget,
      message: 'Time to focus! 🎯'
    },
    shortBreak: {
      name: 'Short Break',
      duration: settings.shortBreakDuration,
      color: 'from-green-500 to-teal-500',
      icon: FiCoffee,
      message: 'Take a short break! ☕'
    },
    longBreak: {
      name: 'Long Break',
      duration: settings.longBreakDuration,
      color: 'from-blue-500 to-purple-500',
      icon: FiZap,
      message: 'Time for a longer break! 🌟'
    }
  };

  useEffect(() => {
    let interval = null;
    
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (minutes === 0 && seconds === 0 && isActive) {
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    playSound();
    
    if (mode === 'work') {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      
      if (newCycles % settings.cyclesBeforeLongBreak === 0) {
        setMode('longBreak');
        setMinutes(settings.longBreakDuration);
        toast.success('Great work! Time for a long break! 🎉');
      } else {
        setMode('shortBreak');
        setMinutes(settings.shortBreakDuration);
        toast.success('Good job! Take a short break! ☕');
      }
    } else {
      setMode('work');
      setMinutes(settings.workDuration);
      toast.success('Break over! Ready to focus? 💪');
    }
    setSeconds(0);
  };

  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(modes[mode].duration);
    setSeconds(0);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setMinutes(modes[newMode].duration);
    setSeconds(0);
    setIsActive(false);
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    resetTimer();
    toast.success('Settings updated!');
  };

  const progress = mode === 'work' 
    ? ((settings.workDuration * 60 - (minutes * 60 + seconds)) / (settings.workDuration * 60)) * 100
    : mode === 'shortBreak'
    ? ((settings.shortBreakDuration * 60 - (minutes * 60 + seconds)) / (settings.shortBreakDuration * 60)) * 100
    : ((settings.longBreakDuration * 60 - (minutes * 60 + seconds)) / (settings.longBreakDuration * 60)) * 100;

  const CurrentIcon = modes[mode].icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative h-32 bg-gradient-to-r ${modes[mode].color} p-6`}>
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h2 className="text-2xl font-bold">Pomodoro Timer</h2>
              <p className="text-white/80 mt-1">{modes[mode].message}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              >
                {soundEnabled ? <FiVolume2 className="w-5 h-5" /> : <FiVolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <FiSettings className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="p-8">
          {/* Mode Selector */}
          <div className="flex justify-center space-x-2 mb-8">
            {Object.entries(modes).map(([key, value]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  mode === key
                    ? 'bg-gradient-to-r ' + value.color + ' text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {value.name}
              </button>
            ))}
          </div>

          {/* Circular Timer */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                animate={{ strokeDashoffset: `${2 * Math.PI * 120 * (1 - progress / 100)}` }}
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={`text-${mode === 'work' ? 'red' : mode === 'shortBreak' ? 'green' : 'blue'}-500`} />
                  <stop offset="100%" className={`text-${mode === 'work' ? 'orange' : mode === 'shortBreak' ? 'teal' : 'purple'}-500`} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <CurrentIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
              <div className="text-5xl font-bold text-gray-900 dark:text-white">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Cycle {cycles + 1}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-xl font-medium text-white shadow-lg bg-gradient-to-r ${modes[mode].color} hover:shadow-xl transition-all`}
            >
              {isActive ? (
                <>
                  <FiPause className="inline-block w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <FiPlay className="inline-block w-5 h-5 mr-2" />
                  Start
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="px-8 py-3 rounded-xl font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              <FiRotateCcw className="inline-block w-5 h-5 mr-2" />
              Reset
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{cycles}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cycles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.floor((cycles * settings.workDuration) / 60)}h {(cycles * settings.workDuration) % 60}m
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Focus Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(progress)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 bg-white dark:bg-gray-800 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Timer Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.workDuration}
                    onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) })}
                    className="input-field"
                    min="1"
                    max="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.shortBreakDuration}
                    onChange={(e) => setSettings({ ...settings, shortBreakDuration: parseInt(e.target.value) })}
                    className="input-field"
                    min="1"
                    max="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreakDuration}
                    onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) })}
                    className="input-field"
                    min="1"
                    max="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cycles before long break
                  </label>
                  <input
                    type="number"
                    value={settings.cyclesBeforeLongBreak}
                    onChange={(e) => setSettings({ ...settings, cyclesBeforeLongBreak: parseInt(e.target.value) })}
                    className="input-field"
                    min="2"
                    max="10"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => updateSettings(settings)}
                  className="flex-1 btn-primary"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PomodoroTimer;
