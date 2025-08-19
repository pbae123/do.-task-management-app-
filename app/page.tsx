'use client';

import { useEffect, useState } from 'react';

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
    setCurrentlyEditingTaskId(newTask.id); // Immediately allow editing
  };

  // Edit handler
  const handleEditTask = (id: string) => {
    setCurrentlyEditingTaskId(id);
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="relative w-screen h-screen bg-gray-100 overflow-hidden"
    >
      {tasks.map((task) => {
        const isEditing = currentlyEditingTaskId === task.id;

        return (
          <div
            key={task.id ?? `${task.x}-${task.y}-${Math.random()}`}
            className="task absolute"
            style={{ left: task.x, top: task.y }}
            onDoubleClick={() => handleEditTask(task.id)}
          >
            {isEditing ? (
              <input
                autoFocus
                className="bg-white border px-1 rounded shadow"
                defaultValue={task.content}
                onBlur={async (e) => {
                  const newContent = e.target.value;
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
            ) : (
              <div className="px-2 py-1 bg-white rounded shadow cursor-text">
                {task.content || 'New Task'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
