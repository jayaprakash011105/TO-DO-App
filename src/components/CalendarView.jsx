import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronLeft, FiChevronRight, FiPlus, FiCalendar,
  FiClock, FiTag, FiEdit2, FiTrash2, FiCheck
} from 'react-icons/fi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, 
         isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, 
         endOfWeek, isToday } from 'date-fns';
import toast from 'react-hot-toast';

const CalendarView = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    category: 'task',
    color: 'blue'
  });

  const categories = [
    { id: 'task', label: 'Task', color: 'blue' },
    { id: 'meeting', label: 'Meeting', color: 'green' },
    { id: 'deadline', label: 'Deadline', color: 'red' },
    { id: 'reminder', label: 'Reminder', color: 'yellow' },
    { id: 'personal', label: 'Personal', color: 'purple' }
  ];

  const colorClasses = {
    blue: 'bg-blue-500 border-blue-600',
    green: 'bg-green-500 border-green-600',
    red: 'bg-red-500 border-red-600',
    yellow: 'bg-yellow-500 border-yellow-600',
    purple: 'bg-purple-500 border-purple-600'
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = () => {
    const savedEvents = localStorage.getItem(`calendar_events_${user?.id}`);
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  };

  const saveEvents = (newEvents) => {
    localStorage.setItem(`calendar_events_${user?.id}`, JSON.stringify(newEvents));
    setEvents(newEvents);
  };

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      isSameDay(new Date(event.date), date)
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEventForm({ ...eventForm, date: format(date, 'yyyy-MM-dd') });
  };

  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, date) => {
    e.preventDefault();
    if (draggedEvent) {
      const updatedEvents = events.map(event => 
        event.id === draggedEvent.id 
          ? { ...event, date: format(date, 'yyyy-MM-dd') }
          : event
      );
      saveEvents(updatedEvents);
      setDraggedEvent(null);
      toast.success('Event moved successfully!');
    }
  };

  const handleAddEvent = () => {
    const newEvent = {
      id: Date.now().toString(),
      ...eventForm,
      createdAt: new Date().toISOString()
    };
    saveEvents([...events, newEvent]);
    setEventForm({
      title: '',
      description: '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: '09:00',
      category: 'task',
      color: 'blue'
    });
    setShowEventModal(false);
    toast.success('Event added successfully!');
  };

  const handleUpdateEvent = () => {
    const updatedEvents = events.map(event => 
      event.id === editingEvent.id 
        ? { ...event, ...eventForm }
        : event
    );
    saveEvents(updatedEvents);
    setEditingEvent(null);
    setShowEventModal(false);
    toast.success('Event updated successfully!');
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    saveEvents(updatedEvents);
    toast.success('Event deleted successfully!');
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      category: event.category,
      color: event.color
    });
    setShowEventModal(true);
  };

  const days = getDaysInMonth();
  const monthYear = format(currentMonth, 'MMMM yyyy');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Calendar View
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Drag and drop to reschedule events
          </p>
        </div>
        <button
          onClick={() => setShowEventModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {monthYear}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleDateClick(day)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                className={`
                  relative min-h-[100px] p-2 rounded-xl border cursor-pointer transition-all
                  ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900 opacity-50'}
                  ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700'}
                  ${isTodayDate ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  hover:border-gray-300 dark:hover:border-gray-600
                `}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isTodayDate ? 'text-blue-600 dark:text-blue-400' : 
                  isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {format(day, 'd')}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <motion.div
                      key={event.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(event);
                      }}
                      whileHover={{ scale: 1.05 }}
                      className={`
                        px-2 py-1 rounded text-xs text-white cursor-move
                        ${colorClasses[event.color]} 
                        truncate
                      `}
                      title={event.title}
                    >
                      {event.title}
                    </motion.div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Events for {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        <div className="space-y-3">
          {getEventsForDate(selectedDate).length > 0 ? (
            getEventsForDate(selectedDate).map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${colorClasses[event.color]}`} />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center">
                        <FiClock className="w-3 h-3 mr-1" />
                        {event.time}
                      </span>
                      <span className="flex items-center">
                        <FiTag className="w-3 h-3 mr-1" />
                        {event.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(event)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No events scheduled for this date
            </p>
          )}
        </div>
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowEventModal(false);
              setEditingEvent(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="input-field"
                    placeholder="Event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="input-field resize-none"
                    rows="3"
                    placeholder="Event description (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="input-field"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {Object.keys(colorClasses).map(color => (
                      <button
                        key={color}
                        onClick={() => setEventForm({ ...eventForm, color })}
                        className={`w-8 h-8 rounded-full ${colorClasses[color]} ${
                          eventForm.color === color ? 'ring-4 ring-offset-2 ring-blue-500' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                  disabled={!eventForm.title}
                  className="flex-1 btn-primary"
                >
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </button>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;
