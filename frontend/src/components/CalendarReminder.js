import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Bell, Clock, Calendar as CalendarIcon, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useBusiness } from '../contexts/BusinessContext';

export default function CalendarReminder() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  
  // Form state
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderDescription, setReminderDescription] = useState('');

  // Load reminders from localStorage
  useEffect(() => {
    const businessId = activeBusiness?.id || 'default';
    const stored = localStorage.getItem(`reminders_${businessId}`);
    if (stored) {
      setReminders(JSON.parse(stored));
    }
  }, [activeBusiness]);

  // Save reminders to localStorage
  const saveReminders = (newReminders) => {
    const businessId = activeBusiness?.id || 'default';
    localStorage.setItem(`reminders_${businessId}`, JSON.stringify(newReminders));
    setReminders(newReminders);
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelectedDate = (day) => {
    return day === selectedDate.getDate() &&
           currentDate.getMonth() === selectedDate.getMonth() &&
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const hasReminders = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reminders.some(r => r.date === dateStr);
  };

  const handleDateClick = (day) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const getRemindersForSelectedDate = () => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return reminders.filter(r => r.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleAddReminder = () => {
    setEditingReminder(null);
    setReminderTitle('');
    setReminderDescription('');
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    setReminderDate(dateStr);
    setReminderTime('09:00');
    setShowAddDialog(true);
  };

  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    setReminderTitle(reminder.title);
    setReminderDescription(reminder.description || '');
    setReminderDate(reminder.date);
    setReminderTime(reminder.time);
    setShowAddDialog(true);
  };

  const handleSaveReminder = () => {
    if (!reminderTitle || !reminderDate || !reminderTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingReminder) {
      // Update existing reminder
      const updated = reminders.map(r => 
        r.id === editingReminder.id 
          ? { ...r, title: reminderTitle, date: reminderDate, time: reminderTime, description: reminderDescription }
          : r
      );
      saveReminders(updated);
    } else {
      // Add new reminder
      const newReminder = {
        id: Date.now(),
        title: reminderTitle,
        date: reminderDate,
        time: reminderTime,
        description: reminderDescription,
        createdAt: new Date().toISOString()
      };
      saveReminders([...reminders, newReminder]);
    }

    setShowAddDialog(false);
    resetForm();
  };

  const handleDeleteReminder = (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      saveReminders(reminders.filter(r => r.id !== id));
    }
  };

  const resetForm = () => {
    setReminderTitle('');
    setReminderDescription('');
    setReminderDate('');
    setReminderTime('');
    setEditingReminder(null);
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-12 rounded-lg flex items-center justify-center text-sm font-medium relative transition-colors
            ${isToday(day) ? 'bg-blue-600 text-white' : ''}
            ${isSelectedDate(day) && !isToday(day) ? 'bg-slate-700 text-white' : ''}
            ${!isToday(day) && !isSelectedDate(day) ? 'hover:bg-slate-700 text-slate-300' : ''}
          `}
        >
          {day}
          {hasReminders(day) && (
            <div className="absolute bottom-1 w-1 h-1 bg-pink-500 rounded-full"></div>
          )}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)} 
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">Calendar & Reminders</h1>
              <p className="text-slate-400 text-sm">{activeBusiness?.name}</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={handleAddReminder}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Reminder
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Calendar */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={previousMonth}
                className="text-white hover:bg-slate-700"
              >
                ‹
              </Button>
              <h2 className="text-lg font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={nextMonth}
                className="text-white hover:bg-slate-700"
              >
                ›
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-slate-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
          </CardContent>
        </Card>

        {/* Reminders for Selected Date */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-pink-400" />
            Reminders for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>

          {getRemindersForSelectedDate().length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No reminders for this date</p>
                <Button 
                  size="sm" 
                  onClick={handleAddReminder}
                  className="mt-3 bg-pink-600 hover:bg-pink-700"
                >
                  Add Reminder
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {getRemindersForSelectedDate().map(reminder => (
                <Card key={reminder.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Bell className="w-4 h-4 text-pink-400" />
                          <h4 className="font-semibold text-white">{reminder.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>{reminder.time}</span>
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-slate-300 mt-2">{reminder.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditReminder(reminder)}
                          className="text-blue-400 hover:bg-slate-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="text-red-400 hover:bg-slate-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Reminder Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Add Reminder'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                placeholder="Enter reminder title"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                value={reminderDescription}
                onChange={(e) => setReminderDescription(e.target.value)}
                placeholder="Add notes or details"
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
                className="text-slate-400 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveReminder}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {editingReminder ? 'Update' : 'Save'} Reminder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
