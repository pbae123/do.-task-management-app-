'use client';

import { useEffect, useRef, useState } from 'react';

type Task = {
  id: string;
  content: string;
  x: number;
  y: number;
  pageId: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Fetch tasks on load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  // Create new task
  const createTask = async (x: number, y: number) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '',
          x,
          y,
          pageId: 'default',
        }),
      });

      if (!res.ok) return;

      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
      setEditingContent('');
      setEditingTaskId(newTask.id);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Handle double-click on canvas
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createTask(x, y);
    setSelectedTaskId(null); // Clear selection when creating new task
  };

  // Start editing task
  const startEditing = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingContent(task.content);
      setEditingTaskId(taskId);
      setSelectedTaskId(null); // Clear selection when editing
    }
  };

  // Save task content
  const saveTask = async (taskId: string, content: string) => {
    // If content is empty or only whitespace, delete the task
    if (!content.trim()) {
      deleteTask(taskId);
      return;
    }

    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
    setEditingTaskId(null);
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        if (editingTaskId === taskId) {
          setEditingTaskId(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Focus textarea when editing starts
  useEffect(() => {
    if (editingTaskId && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 10);
    }
  }, [editingTaskId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key, 'Selected task:', selectedTaskId); // Debug log
      
      if (editingTaskId) {
        if (e.key === 'Escape') {
          setEditingTaskId(null);
        }
      } else if (selectedTaskId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        console.log('Deleting task:', selectedTaskId); // Debug log
        deleteTask(selectedTaskId);
        setSelectedTaskId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTaskId, selectedTaskId]);

  // Handle dragging
  useEffect(() => {
    if (!draggingTaskId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !dragOffset) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nextX = e.clientX - rect.left - dragOffset.x;
      const nextY = e.clientY - rect.top - dragOffset.y;
      setTasks(prev =>
        prev.map(t =>
          t.id === draggingTaskId ? { ...t, x: nextX, y: nextY } : t
        )
      );
    };

    const handleMouseUp = async () => {
      const dragged = tasks.find(t => t.id === draggingTaskId);
      setDraggingTaskId(null);
      setDragOffset(null);
      
      if (dragged) {
        try {
          await fetch(`/api/tasks?id=${dragged.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: dragged.x, y: dragged.y }),
          });
        } catch (error) {
          console.error('Failed to save position:', error);
        }
      }
      
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingTaskId, dragOffset, tasks]);

  return (
    <div
      ref={containerRef}
      onDoubleClick={handleCanvasDoubleClick}
      className="relative w-screen h-screen bg-neutral-300 dot-grid overflow-auto cursor-crosshair"
    >
      {tasks.map((task) => {
        const isEditing = editingTaskId === task.id;
        const isDragging = draggingTaskId === task.id;

        return (
          <div
            key={task.id}
            className={`absolute ${isDragging ? 'z-50' : ''}`}
            style={{ left: task.x, top: task.y }}
            onClick={(e) => {
              if (isEditing) return;
              e.stopPropagation();
              setSelectedTaskId(task.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              startEditing(task.id);
            }}
            onMouseDown={(e) => {
              if (isEditing) return;
              e.stopPropagation();
              if (!containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              const offsetX = e.clientX - rect.left - task.x;
              const offsetY = e.clientY - rect.top - task.y;
              setDraggingTaskId(task.id);
              setDragOffset({ x: offsetX, y: offsetY });
            }}
          >
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                onBlur={() => saveTask(task.id, editingContent)}
                className="outline-none resize-none bg-transparent border-none p-0 m-0 text-black font-sans text-base min-w-[100px] min-h-[20px] overflow-hidden"
                style={{
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.4',
                  width: `${Math.max(100, editingContent.length * 8)}px`,
                  height: `${Math.max(20, editingContent.split('\n').length * 20)}px`,
                  overflow: 'hidden'
                }}
              />
            ) : (
              <div 
                className="text-black font-sans text-base whitespace-pre-wrap cursor-text min-w-[100px] min-h-[20px]"
                style={{ 
                  lineHeight: '1.4',
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '16px',
                  width: `${Math.max(100, task.content.length * 8)}px`,
                  height: `${Math.max(20, task.content.split('\n').length * 20)}px`
                }}
              >
                {task.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
