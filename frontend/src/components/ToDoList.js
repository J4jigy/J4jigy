import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowLeft, Plus, Search, SortAsc, SortDesc, Check, X, Edit2, Trash2 } from 'lucide-react';

const ToDoList = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([
    { id: 1, text: 'Review financial reports', completed: false, createdAt: new Date('2024-01-15') },
    { id: 2, text: 'Follow up with suppliers', completed: true, createdAt: new Date('2024-01-14') },
    { id: 3, text: 'Update inventory records', completed: false, createdAt: new Date('2024-01-16') },
    { id: 4, text: 'Prepare monthly budget', completed: false, createdAt: new Date('2024-01-13') },
    { id: 5, text: 'Call potential customers', completed: true, createdAt: new Date('2024-01-12') },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'completed', 'pending'
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Filter todos based on search query
  const filteredTodos = todos.filter(todo =>
    todo.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort todos based on sort order
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    switch (sortOrder) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'completed':
        return b.completed - a.completed;
      case 'pending':
        return a.completed - b.completed;
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const addTodo = () => {
    if (newTodoText.trim()) {
      const newTodo = {
        id: Math.max(...todos.map(t => t.id), 0) + 1,
        text: newTodoText.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTodos(prev => [newTodo, ...prev]);
      setNewTodoText('');
      setShowAddDialog(false);
    }
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      setTodos(prev => prev.map(todo =>
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      ));
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case 'oldest':
        return <SortAsc className="w-4 h-4" />;
      case 'newest':
        return <SortDesc className="w-4 h-4" />;
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'pending':
        return <X className="w-4 h-4" />;
      default:
        return <SortDesc className="w-4 h-4" />;
    }
  };

  const cycleSortOrder = () => {
    const orders = ['newest', 'oldest', 'pending', 'completed'];
    const currentIndex = orders.indexOf(sortOrder);
    const nextIndex = (currentIndex + 1) % orders.length;
    setSortOrder(orders[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">To Do List</h1>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Search and Sort Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="bg-slate-800 border-slate-600 text-white pl-10"
          />
        </div>
        <Button
          onClick={cycleSortOrder}
          variant="outline"
          className="border-slate-600 text-slate-200 hover:bg-slate-700 flex items-center gap-2"
        >
          {getSortIcon()}
          <span className="hidden sm:inline">
            {sortOrder === 'newest' && 'Newest'}
            {sortOrder === 'oldest' && 'Oldest'}
            {sortOrder === 'completed' && 'Completed'}
            {sortOrder === 'pending' && 'Pending'}
          </span>
        </Button>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{todos.length}</div>
          <div className="text-slate-400 text-sm">Total Tasks</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{todos.filter(t => t.completed).length}</div>
          <div className="text-slate-400 text-sm">Completed</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-400">{todos.filter(t => !t.completed).length}</div>
          <div className="text-slate-400 text-sm">Pending</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">
            {todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0}%
          </div>
          <div className="text-slate-400 text-sm">Progress</div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {sortedTodos.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            {searchQuery ? 'No tasks found matching your search.' : 'No tasks yet. Add your first task!'}
          </div>
        ) : (
          sortedTodos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-slate-800 p-4 rounded-lg flex items-center justify-between transition-all ${
                todo.completed ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-green-600 border-green-600'
                      : 'border-slate-500 hover:border-slate-400'
                  }`}
                >
                  {todo.completed && <Check className="w-4 h-4 text-white" />}
                </button>
                
                {editingId === todo.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                      autoFocus
                    />
                    <Button onClick={saveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button onClick={cancelEdit} size="sm" variant="outline" className="border-slate-600">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1">
                    <span className={`${todo.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                      {todo.text}
                    </span>
                    <div className="text-xs text-slate-500 mt-1">
                      Created: {todo.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {editingId !== todo.id && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => startEdit(todo)}
                    size="sm"
                    variant="ghost"
                    className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => deleteTodo(todo.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Enter task description..."
              className="bg-slate-700 border-slate-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={addTodo}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!newTodoText.trim()}
              >
                Add Task
              </Button>
              <Button
                onClick={() => {
                  setShowAddDialog(false);
                  setNewTodoText('');
                }}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ToDoList;