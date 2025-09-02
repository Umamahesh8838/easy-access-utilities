import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import useTodoStore from "../hooks/useTodoStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Sun, Moon, Trash2, Edit, Save, X } from "lucide-react";
import Confetti from "react-confetti";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "Well done is better than well said.",
];

const TodoList: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    tasks,
    filter,
    accentColor,
    addTask,
    editTask,
    deleteTask,
    toggleTask,
    reorderTasks,
    setFilter,
    setAccentColor,
    clearCompleted,
  } = useTodoStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addTask(inputValue);
      setInputValue("");
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderTasks(result.source.index, result.destination.index);
  };

  const handleEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const handleSaveEdit = (id: string) => {
    if (editingText.trim()) {
      editTask(id, editingText);
      setEditingId(null);
      setEditingText("");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const allTasksCompleted = tasks.length > 0 && tasks.every(t => t.completed);

  useEffect(() => {
    if (allTasksCompleted) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [allTasksCompleted]);

  const accentColors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#22c55e", // green
    "#f97316", // orange
    "#8b5cf6", // violet
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 transition-colors duration-300" style={{ paddingTop: '120px' }}>
      {showConfetti && <Confetti />}
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-4xl font-bold" style={{ color: accentColor }}>
                Todo List
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="hover:bg-muted"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <div className="flex gap-1">
                  {accentColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                        accentColor === color 
                          ? 'ring-2 ring-offset-2 ring-offset-background' 
                          : 'border-muted hover:border-muted-foreground'
                      }`}
                      style={{ backgroundColor: color, borderColor: accentColor === color ? color : undefined }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add a new task..."
                className="flex-grow bg-background text-foreground border-input"
              />
              <Button 
                type="submit" 
                className="text-white font-medium px-6"
                style={{ backgroundColor: accentColor }}
              >
                Add Task
              </Button>
            </form>

            {/* Filter Buttons */}
            <div className="flex justify-center gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'text-white' : ''}
                style={filter === 'all' ? { backgroundColor: accentColor } : {}}
              >
                All
              </Button>
              <Button 
                variant={filter === 'active' ? 'default' : 'outline'} 
                onClick={() => setFilter('active')}
                className={filter === 'active' ? 'text-white' : ''}
                style={filter === 'active' ? { backgroundColor: accentColor } : {}}
              >
                Active
              </Button>
              <Button 
                variant={filter === 'completed' ? 'default' : 'outline'} 
                onClick={() => setFilter('completed')}
                className={filter === 'completed' ? 'text-white' : ''}
                style={filter === 'completed' ? { backgroundColor: accentColor } : {}}
              >
                Completed
              </Button>
            </div>

            {/* Tasks List */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {filteredTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center p-4 bg-card border rounded-lg transition-all hover:shadow-md ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-opacity-50' : ''
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                              ...(snapshot.isDragging && { ringColor: accentColor })
                            }}
                          >
                            {editingId === task.id ? (
                              <div className="flex-grow flex items-center gap-2">
                                <Input
                                  type="text"
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="flex-grow bg-background text-foreground"
                                  autoFocus
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleSaveEdit(task.id)}
                                  className="hover:bg-muted text-green-600"
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => setEditingId(null)}
                                  className="hover:bg-muted text-gray-500"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-3 flex-grow">
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTask(task.id)}
                                    className="border-2"
                                    style={{ 
                                      borderColor: accentColor,
                                      backgroundColor: task.completed ? accentColor : 'transparent'
                                    }}
                                  />
                                  <span 
                                    className={`text-foreground transition-all ${
                                      task.completed 
                                        ? "line-through text-muted-foreground opacity-60" 
                                        : ""
                                    }`}
                                  >
                                    {task.text}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleEdit(task.id, task.text)}
                                    className="hover:bg-muted text-muted-foreground hover:text-foreground"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => deleteTask(task.id)}
                                    className="hover:bg-muted text-muted-foreground hover:text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-muted-foreground text-lg italic max-w-md mx-auto">
                  {motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}
                </p>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          {tasks.length > 0 && (
            <CardFooter className="flex justify-between items-center border-t bg-muted/30">
              <p className="text-sm text-muted-foreground">
                {tasks.filter(t => !t.completed).length} task{tasks.filter(t => !t.completed).length !== 1 ? 's' : ''} remaining
              </p>
              {tasks.some(t => t.completed) && (
                <Button 
                  variant="ghost" 
                  onClick={clearCompleted}
                  className="text-muted-foreground hover:text-red-500"
                >
                  Clear Completed
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TodoList;
