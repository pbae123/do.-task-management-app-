// app/components/Task.tsx
"use client";
import { useState } from "react";

type TaskProps = {
  id: string;
  content: string;
  x: number;
  y: number;
  pageId: string; 
  onDoubleClick: (id: string) => void; 
};

export default function Task({ id, content, x, y, onDoubleClick }: TaskProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(content);

  const handleDoubleClick = () => setEditing(true);

  const handleBlur = () => {
    setEditing(false);
    // TODO: call PATCH API to update content
  };

  return (
    <div
      className="absolute bg-white shadow p-2 rounded shadow task"
      style = {{ top: y, left: x}}
      onDoubleClick = {() => onDoubleClick(id)}
    >
      {editing ? (
        <input
          className="border rounded px-2 py-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
}
