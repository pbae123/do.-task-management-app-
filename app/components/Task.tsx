'use client';

import { useRef, useEffect } from 'react';

type TaskProps = {
  task: {
    id: string;
    content: string;
    x: number;
    y: number;
  };
  isEditing: boolean;
  isSelected: boolean;
  isDragging: boolean;
  editingContent: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onSelect: () => void;
  onStartEditing: () => void;
  onStartDragging: (e: React.MouseEvent) => void;
};

export default function Task({
  task,
  isEditing,
  isSelected,
  isDragging,
  editingContent,
  onContentChange,
  onSave,
  onSelect,
  onStartEditing,
  onStartDragging,
}: TaskProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(
          textareaRef.current.value.length,
          textareaRef.current.value.length
        );
      }, 10);
    }
  }, [isEditing]);

  return (
    <div
      className={`absolute ${isDragging ? 'z-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ left: task.x, top: task.y }}
      onClick={(e) => {
        if (isEditing) return;
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onStartEditing();
      }}
      onMouseDown={(e) => {
        if (isEditing) return;
        e.stopPropagation();
        onStartDragging(e);
      }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editingContent}
          onChange={(e) => onContentChange(e.target.value)}
          onBlur={onSave}
          className="outline-none resize-none bg-transparent border-none p-0 m-0 text-black font-sans text-base leading-relaxed min-w-[100px] min-h-[20px] overflow-hidden"
          style={{
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            width: `${Math.max(100, editingContent.length * 8)}px`,
            height: `${Math.max(20, editingContent.split('\n').length * 24)}px`,
            overflow: 'hidden'
          }}
        />
      ) : (
        <div className="text-black font-sans text-base leading-relaxed whitespace-pre-wrap cursor-text min-w-[100px] min-h-[20px]">
          {task.content || 'Double-click to edit...'}
        </div>
      )}
    </div>
  );
}
