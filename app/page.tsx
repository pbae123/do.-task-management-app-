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
  const [currentlyEditingTaskId, setCurrentlyEditingTaskId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editingRef = useRef<HTMLDivElement | null>(null);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  // Create task at double-click position
  const handleDoubleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

    const newTask = await res.json();
    setTasks((prev) => [...prev, newTask]);
    setEditingContent(newTask.content ?? '');
    setCurrentlyEditingTaskId(newTask.id); // Immediately allow editing
  };

  // Edit handler
  const handleEditTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    setEditingContent(task?.content ?? '');
    setCurrentlyEditingTaskId(id);
  };

  // Focus editable area when entering edit mode
  useEffect(() => {
    if (currentlyEditingTaskId) {
      editingRef.current?.focus();
    }
  }, [currentlyEditingTaskId]);

  // Drag: mouse move and up listeners
  useEffect(() => {
    if (!draggingTaskId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !dragOffset) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nextX = e.clientX - rect.left - dragOffset.x;
      const nextY = e.clientY - rect.top - dragOffset.y;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === draggingTaskId ? { ...t, x: nextX, y: nextY } : t
        )
      );
    };

    const handleMouseUp = async () => {
      const dragged = tasks.find((t) => t.id === draggingTaskId);
      setDraggingTaskId(null);
      setDragOffset(null);
      if (!dragged) return;
      // Persist position
      try {
        const res = await fetch(`/api/tasks?id=${dragged.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: dragged.x, y: dragged.y }),
        });
        if (res.ok) {
          const updated = await res.json();
          setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        } else {
          console.error('Failed to persist position:', await res.text());
        }
      } catch (err) {
        console.error('Failed to persist position:', err);
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
      onDoubleClick={handleDoubleClick}
      className="relative w-screen h-screen bg-white overflow-auto"
    >
      {tasks.map((task) => {
        const isEditing = currentlyEditingTaskId === task.id;

        return (
          <div
            key={task.id ?? `${task.x}-${task.y}-${Math.random()}`}
            className={`task absolute ${isEditing ? '' : 'cursor-move'}`}
            style={{ left: task.x, top: task.y }}
            onDoubleClick={(event) => {
              event.stopPropagation();
              handleEditTask(task.id);
            }}
            onMouseDown={(event) => {
              if (isEditing) return; // allow text selection while editing
              event.stopPropagation();
              if (!containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              const offsetX = event.clientX - rect.left - task.x;
              const offsetY = event.clientY - rect.top - task.y;
              setDraggingTaskId(task.id);
              setDragOffset({ x: offsetX, y: offsetY });
            }}
          >
            {isEditing ? (
              <div
                ref={editingRef}
                contentEditable
                suppressContentEditableWarning
                className="outline-none whitespace-pre-wrap"
                onBlur={async (e) => {
                  const newContent = (e.target as HTMLDivElement).innerText;
                  const res = await fetch(`/api/tasks?id=${task.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: newContent }),
                  });

                  if (!res.ok) {
                    console.error('PATCH failed:', await res.text());
                  } else {
                    const updatedTask = await res.json();
                    setTasks((prev) =>
                      prev.map((t) => (t.id === task.id ? updatedTask : t))
                    );
                    setCurrentlyEditingTaskId(null);
                  }
                }}
                onInput={(e) => setEditingContent((e.target as HTMLDivElement).innerText)}
              >
                {editingContent}
              </div>
            ) : (
              <div className="cursor-text whitespace-pre-wrap">
                {task.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
