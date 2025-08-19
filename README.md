# Task App

A modern, interactive task management application built with Next.js, React, and Prisma. Create, edit, and organize tasks by double-clicking anywhere on the canvas and dragging them around.

## Features

- **Double-click anywhere** to create a new task
- **Double-click tasks** to edit their content
- **Drag and drop** tasks to reposition them
- **Keyboard shortcuts** for quick actions
- **Real-time persistence** with PostgreSQL database
- **Modern UI** with hover effects and visual feedback
- **Dark mode support**

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Setup

1. **Clone and install dependencies:**
   ```bash
   cd my-todo-app
   npm install
   ```

2. **Set up your database:**
   - Create a PostgreSQL database
   - Create a `.env` file in the root directory with your database URL:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/taskapp"
     ```

3. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## How to Use

### Creating Tasks
- **Double-click anywhere** on the canvas to create a new task at that location
- The task will automatically enter edit mode so you can start typing

### Editing Tasks
- **Double-click any task** to edit its content
- Click outside the task or press `Escape` to cancel editing
- Press `Cmd+Enter` to save changes

### Moving Tasks
- **Click and drag** any task to move it around the canvas
- Tasks automatically save their new position

### Deleting Tasks
- **Hover over a task** to see the delete button (×) in the top-right corner
- Click the delete button or press `Cmd+Delete` while editing

### Keyboard Shortcuts
- `Escape` - Cancel editing
- `Cmd+Enter` - Save task content
- `Cmd+Delete` - Delete current task

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **API:** Next.js API Routes

## Database Schema

The app uses a simple schema with two models:
- `Page` - Represents a workspace/page
- `Task` - Individual tasks with position and content

## Development

### Project Structure
```
my-todo-app/
├── app/
│   ├── api/tasks/     # API routes for CRUD operations
│   ├── components/    # React components
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main task app page
├── prisma/
│   └── schema.prisma  # Database schema
└── package.json
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The app can be deployed to any platform that supports Next.js:

1. **Vercel** (recommended):
   - Connect your GitHub repository
   - Add your `DATABASE_URL` environment variable
   - Deploy automatically

2. **Railway/Heroku:**
   - Set up PostgreSQL addon
   - Configure environment variables
   - Deploy with `npm run build && npm start`

## Contributing

Feel free to submit issues and enhancement requests!
